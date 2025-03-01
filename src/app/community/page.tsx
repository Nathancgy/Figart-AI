'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiRequest, getAuthToken } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: number;
  photo_uuid: string;
  user_id: string;
  created_at: string;
  thumbs_up: number;
}

export default function CommunityPage() {
  const { username } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sortMethod, setSortMethod] = useState<'recent' | 'likes'>('recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch posts and user's liked posts when component mounts or username changes
  useEffect(() => {
    fetchPosts(true);
    
    // Only fetch liked posts if user is logged in
    if (username) {
      fetchUserLikedPosts();
    } else {
      // Clear liked posts when user logs out
      setLikedPosts([]);
      localStorage.removeItem('likedPosts');
    }
  }, [username, sortMethod]);

  const fetchUserLikedPosts = async () => {
    if (!username) return;
    
    try {
      const response = await apiRequest('/users/liked-posts/');
      if (response && response.liked_posts) {
        setLikedPosts(response.liked_posts as number[]);
        localStorage.setItem('likedPosts', JSON.stringify(response.liked_posts));
      }
    } catch (err) {
      console.error('Error fetching liked posts:', err);
      // Fallback to localStorage if API fails
      const savedLikes = localStorage.getItem('likedPosts');
      if (savedLikes) {
        try {
          setLikedPosts(JSON.parse(savedLikes));
        } catch (e) {
          console.error('Error loading liked posts from localStorage', e);
        }
      }
    }
  };

  const fetchPosts = async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }
      
      // Get posts with sorting and pagination
      const currentPage = reset ? 0 : page;
      const response = await apiRequest(`/posts/?sort_by=${sortMethod}&page=${currentPage}`);
      
      if (reset) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      // Check if there are more posts to load
      setHasMorePosts(response.pagination.page < response.pagination.pages - 1);
      setTotalPages(response.pagination.pages);
      
      // If not resetting, increment the page for next load
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load specific page
  const goToPage = (pageNumber: number) => {
    if (pageNumber !== page && !loading && !loadingMore) {
      setPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Fetch the selected page
      try {
        setLoading(true);
        apiRequest(`/posts/?sort_by=${sortMethod}&page=${pageNumber}`)
          .then(response => {
            setPosts(response.posts);
            setHasMorePosts(response.pagination.page < response.pagination.pages - 1);
            setTotalPages(response.pagination.pages);
          })
          .catch(err => {
            setError('Failed to load posts');
            console.error('Error fetching posts:', err);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (err) {
        setError('Failed to load posts');
        console.error('Error fetching posts:', err);
        setLoading(false);
      }
    }
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5; // Maximum number of page buttons to show
    
    // Always show first page
    items.push(
      <button
        key="first"
        onClick={() => goToPage(0)}
        className={`px-3 py-1 rounded-md ${page === 0 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        disabled={loading}
      >
        1
      </button>
    );
    
    // If there are only 2 pages, just show page 1 and 2 without duplication
    if (totalPages === 2) {
      items.push(
        <button
          key="page2"
          onClick={() => goToPage(1)}
          className={`px-3 py-1 rounded-md ${page === 1 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          disabled={loading}
        >
          2
        </button>
      );
      return items;
    }
    
    // For more than 2 pages, continue with the regular logic
    // Calculate range of pages to show
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 2);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 2) {
      startPage = Math.max(1, endPage - (maxVisiblePages - 2));
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 1) {
      items.push(
        <span key="ellipsis1" className="px-2">
          ...
        </span>
      );
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded-md ${page === i ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          disabled={loading}
        >
          {i + 1}
        </button>
      );
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      items.push(
        <span key="ellipsis2" className="px-2">
          ...
        </span>
      );
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 2) {
      items.push(
        <button
          key="last"
          onClick={() => goToPage(totalPages - 1)}
          className={`px-3 py-1 rounded-md ${page === totalPages - 1 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          disabled={loading}
        >
          {totalPages}
        </button>
      );
    }
    
    return items;
  };

  // Handle sort method change
  const handleSortMethodChange = (method: 'recent' | 'likes') => {
    if (method !== sortMethod) {
      setSortMethod(method);
      setShowSortDropdown(false);
      
      // Reset page to 0 and fetch with new sort method
      setPage(0);
      setLoading(true);
      
      apiRequest(`/posts/?sort_by=${method}&page=0`)
        .then(response => {
          setPosts(response.posts);
          setHasMorePosts(response.pagination.page < response.pagination.pages - 1);
          setTotalPages(response.pagination.pages);
        })
        .catch(err => {
          setError('Failed to load posts');
          console.error('Error fetching posts:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setShowSortDropdown(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      
      // Get the auth token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload the photo and create post in one step
      const response = await fetch('http://localhost:8000/posts/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to create post');
      }

      // Refresh the posts list
      await fetchPosts();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!username) {
      setError('You must be logged in to like posts');
      return;
    }

    try {
      setError(null);
      const isLiked = likedPosts.includes(postId);
      const endpoint = isLiked ? `/posts/${postId}/thumbs-down/` : `/posts/${postId}/thumbs-up/`;
      
      // Optimistically update UI
      const newLikedPosts = isLiked ? likedPosts.filter(id => id !== postId) : [...likedPosts, postId];
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, thumbs_up: isLiked ? Math.max(0, post.thumbs_up - 1) : post.thumbs_up + 1 } : post
      ));
      setLikedPosts(newLikedPosts);
      
      // Make API request
      const response = await apiRequest(endpoint, {
        method: 'POST',
      });

      if (!response) {
        throw new Error('Failed to update like status');
      }
      
      // Save to localStorage on success
      localStorage.setItem('likedPosts', JSON.stringify(newLikedPosts));
      
    } catch (err) {
      console.error('Error liking post:', err);
      
      // Revert optimistic update on error
      await fetchPosts();
      await fetchUserLikedPosts();
      
      // Show error message
      if (err instanceof Error) {
        if (err.message.includes("You already thumbed up") || 
            err.message.includes("You haven't thumbed up")) {
          // If the error is due to inconsistent state, refresh the posts and liked posts
          setError("Your like status was out of sync. We've refreshed the data.");
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to like post');
      }
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
              aria-label="Close error message"
            >
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Photography Community
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-indigo-200">
            Share your photos, get feedback, and be inspired by other photographers.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {sortMethod === 'recent' ? 'Recent Photos' : 'Most Liked Photos'}
              </h2>
              <p className="text-gray-500">
                {sortMethod === 'recent' 
                  ? 'Explore the latest uploads from our community' 
                  : 'Discover the most popular photos in our community'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <span>Sort by: {sortMethod === 'recent' ? 'Recent' : 'Most Liked'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                {showSortDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        handleSortMethodChange('recent');
                        setShowSortDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortMethod === 'recent' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                    >
                      Recent
                    </button>
                    <button
                      onClick={() => {
                        handleSortMethodChange('likes');
                        setShowSortDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortMethod === 'likes' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                    >
                      Most Liked
                    </button>
                  </div>
                )}
              </div>
              {username && (
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload photo"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                  >
                    {uploading ? 'Uploading...' : 'Post a Picture'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-500">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet. Be the first to share a photo!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="relative pb-[75%] bg-gray-100">
                    <Link href={`/posts/${post.id}`}>
                      <img
                        src={`http://localhost:8000/photos/${post.photo_uuid}`}
                        alt={`Post ${post.id}`}
                        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                      />
                    </Link>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">By: {post.user_id}</span>
                      </div>
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center text-gray-500 hover:text-red-500 transition-colors focus:outline-none"
                        aria-label={likedPosts.includes(post.id) ? "Unlike post" : "Like post"}
                      >
                        {likedPosts.includes(post.id) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1 text-red-500">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        )}
                        <span>{post.thumbs_up}</span>
                      </button>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <Link href={`/posts/${post.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center my-8">
          <div className="inline-flex items-center gap-2 bg-white p-2 rounded-lg shadow">
            <button
              onClick={() => goToPage(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
              className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            {renderPaginationItems()}
            
            <button
              onClick={() => goToPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1 || loading}
              className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
              aria-label="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 