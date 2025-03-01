'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/utils/auth';

interface Post {
  id: number;
  photo_id: number;
  user_id: string;
  created_at: string;
  thumbs_up: number;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-500">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="relative pb-[75%] bg-gray-100">
                    <img
                      src={`http://localhost:8000/photos/${post.photo_id}/`}
                      alt={`Post ${post.id}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">Post #{post.id}</h3>
                      <div className="flex items-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1 text-red-500">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        <span>{post.thumbs_up}</span>
                      </div>
                    </div>
                    <div className="flex items-center mt-4">
                      <span className="text-sm font-medium text-gray-700">By: {post.user_id}</span>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
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