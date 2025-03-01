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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

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
    fetchPosts();
    
    // Only fetch liked posts if user is logged in
    if (username) {
      fetchUserLikedPosts();
    } else {
      // Clear liked posts when user logs out
      setLikedPosts(new Set());
      localStorage.removeItem('likedPosts');
    }
  }, [username]);

  const fetchUserLikedPosts = async () => {
    if (!username) return;
    
    try {
      const response = await apiRequest('/users/liked-posts/');
      if (response && response.liked_posts) {
        const likedPostsSet = new Set<number>(response.liked_posts as number[]);
        setLikedPosts(likedPostsSet);
        localStorage.setItem('likedPosts', JSON.stringify([...likedPostsSet]));
      }
    } catch (err) {
      console.error('Error fetching liked posts:', err);
      // Fallback to localStorage if API fails
      const savedLikes = localStorage.getItem('likedPosts');
      if (savedLikes) {
        try {
          const likedPostsArray = JSON.parse(savedLikes);
          setLikedPosts(new Set<number>(likedPostsArray));
        } catch (e) {
          console.error('Error loading liked posts from localStorage', e);
        }
      }
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Get recent posts
      const response = await apiRequest('/posts/recent/');
      setPosts(response.posts);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
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
      const isLiked = likedPosts.has(postId);
      const endpoint = isLiked ? `/posts/${postId}/thumbs-down/` : `/posts/${postId}/thumbs-up/`;
      
      // Optimistically update UI
      const newLikedPosts = new Set(likedPosts);
      if (isLiked) {
        newLikedPosts.delete(postId);
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, thumbs_up: Math.max(0, post.thumbs_up - 1) } : post
        ));
      } else {
        newLikedPosts.add(postId);
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, thumbs_up: post.thumbs_up + 1 } : post
        ));
      }
      setLikedPosts(newLikedPosts);
      
      // Make API request
      const response = await apiRequest(endpoint, {
        method: 'POST',
      });

      if (!response) {
        throw new Error('Failed to update like status');
      }
      
      // Save to localStorage on success
      localStorage.setItem('likedPosts', JSON.stringify([...newLikedPosts]));
      
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
    <div className="min-h-screen bg-gray-50 py-12">
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
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Photography Community
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Share your photos, get feedback, and be inspired by other photographers.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Photos</h2>
              <p className="text-gray-500">Explore the latest uploads from our community</p>
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
                    <img
                      src={`http://localhost:8000/photos/${post.photo_uuid}`}
                      alt={`Post ${post.id}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">Post #{post.id}</h3>
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center text-gray-500 hover:text-red-500 transition-colors focus:outline-none"
                        aria-label={likedPosts.has(post.id) ? "Unlike post" : "Like post"}
                      >
                        {likedPosts.has(post.id) ? (
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
                    <div className="flex items-center mt-4">
                      <span className="text-sm font-medium text-gray-700">By: {post.user_id}</span>
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
    </div>
  );
} 