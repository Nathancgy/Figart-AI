'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function CoverPage() {
  const { username } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once the component mounts
  // This ensures any client-side only code doesn't run during server rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: 'url("/images/index.jpg")' }}
      >
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      <main className="flex-grow flex items-center justify-center px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Capture Your Moments
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            A beautiful platform for photographers to share their work, get feedback, and connect with a community of like-minded creatives.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/community" 
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Explore Community
            </Link>
            
            {/* Only render this link on the client side */}
            {isClient && (
              <Link 
                href="/tutorial" 
                className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Start Tutorial
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 