'use client';

import { useState, useEffect } from 'react';
import TutorialFrame from '@/components/TutorialFrame';
import { TutorialImage, Frame } from '@/types';
import Image from 'next/image';

// Sample tutorial images for the static prototype
const SAMPLE_TUTORIAL_IMAGES: TutorialImage[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: 'Mountain Landscape',
    description: 'Find the best frame to capture this beautiful mountain landscape.',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1540270776932-e72e7c2d11cd',
    title: 'Cityscape at Night',
    description: 'Capture the vibrant city lights in the best possible frame.',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
    title: 'Ocean Waves',
    description: 'Frame the perfect shot of these powerful ocean waves.',
  },
];

// Sample popular frames (would typically come from the database)
const SAMPLE_POPULAR_FRAMES: Record<string, Frame> = {
  '1': {
    id: 'pop1',
    originImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    frameX: 300,
    frameY: 150,
    frameWidth: 375,
    frameHeight: 667,
    userId: 'user1',
    createdAt: new Date(),
    likes: 42,
  },
  '2': {
    id: 'pop2',
    originImageUrl: 'https://images.unsplash.com/photo-1540270776932-e72e7c2d11cd',
    frameX: 400,
    frameY: 100,
    frameWidth: 375,
    frameHeight: 667,
    userId: 'user1',
    createdAt: new Date(),
    likes: 28,
  },
  '3': {
    id: 'pop3',
    originImageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
    frameX: 350,
    frameY: 200,
    frameWidth: 375,
    frameHeight: 667,
    userId: 'user1',
    createdAt: new Date(),
    likes: 35,
  },
};

// Pre-calculated optimal frames (in a real app, these would come from the AI)
const OPTIMAL_FRAMES: Record<string, { x: number; y: number; width: number; height: number }> = {
  '1': { x: 250, y: 200, width: 375, height: 667 },
  '2': { x: 420, y: 80, width: 375, height: 667 },
  '3': { x: 300, y: 150, width: 375, height: 667 },
};

// Horizontal frames option
const HORIZONTAL_OPTIMAL_FRAMES: Record<string, { x: number; y: number; width: number; height: number }> = {
  '1': { x: 200, y: 250, width: 667, height: 375 },
  '2': { x: 100, y: 300, width: 667, height: 375 },
  '3': { x: 150, y: 200, width: 667, height: 375 },
};

export default function TutorialPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [frameResetKey, setFrameResetKey] = useState(0);

  const currentImage = SAMPLE_TUTORIAL_IMAGES[currentImageIndex];
  const optimalFrame = isHorizontal 
    ? HORIZONTAL_OPTIMAL_FRAMES[currentImage.id] 
    : OPTIMAL_FRAMES[currentImage.id];
  const popularFrame = SAMPLE_POPULAR_FRAMES[currentImage.id];

  // Simulate loading the optimal frames
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate AI computation with a slight delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [currentImageIndex]);

  const handleSubmitFrame = async (frame: Omit<Frame, 'id' | 'userId' | 'user' | 'createdAt' | 'likes'>) => {
    // In a real application, this would submit the frame to your backend API
    console.log('Submitting frame:', frame);
    
    // Simulate a delay for the API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return Promise.resolve();
  };

  const handleNextImage = () => {
    setFrameResetKey(prev => prev + 1); // Reset the TutorialFrame component
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % SAMPLE_TUTORIAL_IMAGES.length);
  };

  const toggleOrientation = () => {
    setIsHorizontal(!isHorizontal);
    setFrameResetKey(prev => prev + 1); // Reset the frame when changing orientation
  };

  return (
    <div className="min-h-screen py-12 relative">
      {/* Journey path visualization */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-transparent via-indigo-400 to-transparent opacity-30 hidden md:block"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10">
          <div className="inline-block relative mb-6">
            <span className="inline-block w-20 h-20 rounded-full bg-indigo-500 opacity-20 absolute blur-2xl -z-10"></span>
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Master Your Photography
            </h1>
          </div>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-indigo-200">
            Learn how to frame the perfect photo by practicing with our interactive tool.
          </p>
        </div>
        
        {/* Visual journey step indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            {SAMPLE_TUTORIAL_IMAGES.map((_, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <div 
                  className={`w-4 h-4 rounded-full ${
                    index < currentImageIndex 
                      ? 'bg-indigo-400' 
                      : index === currentImageIndex 
                        ? 'bg-indigo-500 animate-pulse' 
                        : 'bg-indigo-800'
                  } transition-colors duration-500`}
                ></div>
                {index < SAMPLE_TUTORIAL_IMAGES.length - 1 && (
                  <div className="w-12 h-0.5 bg-indigo-700 absolute left-4 top-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={toggleOrientation}
            className="glass px-6 py-3 rounded-full text-indigo-200 hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] focus:outline-none flex items-center space-x-2 transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
            </svg>
            <span>{isHorizontal ? "Switch to Vertical" : "Switch to Horizontal"}</span>
          </button>
        </div>
        
        <div className="glass-dark rounded-3xl overflow-hidden border border-indigo-900/50 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[800px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
                <p className="mt-4 text-xl text-indigo-300">Preparing your tutorial...</p>
              </div>
            </div>
          ) : (
            <TutorialFrame
              key={`${currentImageIndex}-${frameResetKey}-${isHorizontal ? 'h' : 'v'}`}
              tutorialImage={currentImage}
              onSubmit={handleSubmitFrame}
              optimalFrame={optimalFrame}
              popularFrame={popularFrame}
              isHorizontal={isHorizontal}
            />
          )}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-xl text-indigo-300 mb-6">
            Tutorial Progress: <span className="font-semibold text-indigo-100">{currentImageIndex + 1}</span> of <span className="font-semibold">{SAMPLE_TUTORIAL_IMAGES.length}</span>
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleNextImage}
              className="relative px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-indigo-900"
            >
              <span className="relative z-10">Next Tutorial Image</span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-75 blur-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 