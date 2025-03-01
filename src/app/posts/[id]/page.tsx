'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { username } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch post details
        const postData = await apiRequest(`/posts/${id}/`);
        setPost(postData.post);
        
        // Fetch comments
        const commentsData = await apiRequest(`/posts/${id}/comments/`);
        const validComments = commentsData.comments ? commentsData.comments.filter((comment: Comment) => comment.post_id === Number(id)) : [];
        setComments(validComments);
        
        // Check if user has liked this post
        if (username) {
          try {
            const likedPostsData = await apiRequest('/users/liked-posts/');
            if (likedPostsData && likedPostsData.liked_posts) {
              setIsLiked(likedPostsData.liked_posts.includes(Number(id)));
            }
          } catch (err) {
            console.error('Error checking liked status:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching post details:', err);
        setError('Failed to load post details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPostDetails();
    }
  }, [id, username]);

  const handleLike = async () => {
    if (!username) {
      setError('You must be logged in to like posts');
      return;
    }

    try {
      setError(null);
      const endpoint = isLiked ? `/posts/${id}/thumbs-down/` : `/posts/${id}/thumbs-up/`;
      
      // Optimistically update UI
      setIsLiked(!isLiked);
      if (post) {
        setPost({
          ...post,
          thumbs_up: isLiked ? Math.max(0, post.thumbs_up - 1) : post.thumbs_up + 1
        });
      }
      
      // Make API request
      await apiRequest(endpoint, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Error liking post:', err);
      
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      if (post) {
        setPost({
          ...post,
          thumbs_up: isLiked ? post.thumbs_up + 1 : Math.max(0, post.thumbs_up - 1)
        });
      }
      
      // Show error message
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update like status');
      }
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setError('You must be logged in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    try {
      setSubmittingComment(true);
      setError(null);
      
      const response = await apiRequest(`/posts/${id}/comment/add/`, {
        method: 'POST',
        body: JSON.stringify({ comment: newComment }),
      });
      
      // Add the new comment to the list
      if (response && response.comment_id) {
        const newCommentObj: Comment = {
          id: response.comment_id,
          post_id: Number(id),
          user_id: username,
          content: newComment,
          created_at: new Date().toISOString(),
        };
        
        setComments([...comments, newCommentObj]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add comment');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || post.user_id !== username) {
      setError('You do not have permission to delete this post');
      return;
    }
    
    setShowDeleteModal(true);
  };
  
  const confirmDeletePost = async () => {
    try {
      setDeletingPost(true);
      setError(null);
      
      await apiRequest(`/posts/${id}/delete/`, {
        method: 'POST',
      });
      
      // Redirect to community page after successful deletion
      router.push('/community');
    } catch (err) {
      console.error('Error deleting post:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete post');
      }
      setShowDeleteModal(false);
      setDeletingPost(false);
    }
  };

  const handleDeleteComment = (comment: Comment) => {
    if (comment.user_id !== username) {
      setError('You do not have permission to delete this comment');
      return;
    }
    
    setCommentToDelete(comment);
    setShowDeleteCommentModal(true);
  };
  
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      setDeletingComment(true);
      setError(null);
      
      await apiRequest(`/posts/${id}/comment/${commentToDelete.id}/delete/`, {
        method: 'POST',
      });
      
      // Remove the comment from the list
      setComments(comments.filter(c => c.id !== commentToDelete.id));
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete comment');
      }
    } finally {
      setDeletingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        {error && (
          <div className="fixed top-0 left-0 right-0 z-[99999] flex justify-center items-start pt-0 bg-transparent" style={{position: 'fixed', top: '80px'}} role="alert">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg max-w-md w-full pointer-events-auto">
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
          </div>
        )}
        <div className="max-w-6xl mx-auto px-2 sm:px-3 lg:px-4 py-8">
          <div className="mb-4">
            <Link href="/community" className="text-white hover:text-indigo-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Community
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-500 text-lg">Loading post details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        {error && (
          <div className="fixed top-0 left-0 right-0 z-[99999] flex justify-center items-start pt-0 bg-transparent" style={{position: 'fixed', top: '80px'}} role="alert">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg max-w-md w-full pointer-events-auto">
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
          </div>
        )}
        <div className="max-w-6xl mx-auto px-2 sm:px-3 lg:px-4 py-8">
          <div className="mb-4">
            <Link href="/community" className="text-white hover:text-indigo-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Community
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Post not found</h2>
              <p className="mt-2 text-gray-500">The post you're looking for doesn't exist or has been removed.</p>
              <Link href="/community" className="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                Return to Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {error && (
        <div className="fixed top-0 left-0 right-0 z-[99999] flex justify-center items-start pt-0 bg-transparent" style={{position: 'fixed', top: '80px'}} role="alert">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg max-w-md w-full pointer-events-auto">
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
        </div>
      )}
      
      {/* Delete Post Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Post</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                disabled={deletingPost}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={deletingPost}
              >
                {deletingPost ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete Post'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Comment Confirmation Modal */}
      {showDeleteCommentModal && commentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Comment</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteCommentModal(false);
                  setCommentToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                disabled={deletingComment}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={deletingComment}
              >
                {deletingComment ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete Comment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-2 sm:px-3 lg:px-4 py-8">
        <div className="mb-4">
          <Link href="/community" className="text-white hover:text-indigo-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Community
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="relative flex flex-col">
            {/* Image container - full width */}
            <div className="w-full bg-black flex items-center justify-center p-4 border-b border-gray-200">
              <img
                src={`http://localhost:8000/photos/${post.photo_uuid}`}
                alt={`Post by ${post.user_id}`}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
            
            {/* Info section below image */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    By <span className="text-indigo-600">{post.user_id}</span>
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleLike}
                    className="flex items-center text-gray-500 hover:text-red-500 transition-colors focus:outline-none"
                    aria-label={isLiked ? "Unlike post" : "Like post"}
                  >
                    {isLiked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-1 text-red-500">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    )}
                    <span className="text-lg">{post.thumbs_up}</span>
                  </button>
                  
                  {post.user_id === username && (
                    <button 
                      onClick={handleDeletePost}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                      aria-label="Delete post"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Comments section - always shown */}
          <div className="p-6 border-t">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Comments ({comments.length})</h2>
            
            {username ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex flex-col space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    rows={2}
                    maxLength={60}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{newComment.length}/60 characters</span>
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
                <p className="text-gray-600">
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Log in
                  </Link>{' '}
                  to add a comment
                </p>
              </div>
            )}
            
            {comments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-900">{comment.user_id}</p>
                      <div className="flex items-center">
                        <p className="text-xs text-gray-500 mr-2">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {comment.user_id === username && (
                          <button 
                            onClick={() => handleDeleteComment(comment)}
                            className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                            aria-label="Delete comment"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 