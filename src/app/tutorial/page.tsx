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
const SAMPLE_POPULAR_FRAMES: Record<string, Frame & { frame: { x: number; y: number; width: number; height: number } }> = {
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
    frame: {
      x: 1488,
      y: 0,
      width: 2763,
      height: 4912
    }
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
    frame: {
      x: 1115,
      y: 0,
      width: 1867,
      height: 3318
    }
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
    frame: {
      x: 4057,
      y: 576,
      width: 1101,
      height: 1957
    }
  },
};

// Pre-calculated optimal frames (in a real app, these would come from the AI)
const OPTIMAL_FRAMES: Record<string, { x: number; y: number; width: number; height: number }> = {
  '1': { x: 1488, y: 0, width: 2763, height: 4912 },
  '2': { x: 1115, y: 0, width: 1867, height: 3318 },
  '3': { x: 4057, y: 576, width: 1101, height: 1957 },
};

// Horizontal frames option
const HORIZONTAL_OPTIMAL_FRAMES: Record<string, { x: number; y: number; width: number; height: number }> = {
  '1': { x: 758, y: 752, width: 5888, height: 3312 },
  '2': { x: 325, y: 770, width: 4000, height: 2250 },
  '3': { x: 0, y: 0, width: 6000, height: 3375 },
};

// Photography tips for each tutorial image
const TUTORIAL_TIPS: Record<string, string[]> = {
  '1': [
    'Look for natural framing elements like trees or rocks',
    'Position the horizon line using the rule of thirds',
    'Include foreground elements to create depth'
  ],
  '2': [
    'Capture light trails from moving vehicles',
    'Find a balance between bright lights and dark areas',
    'Use buildings to create leading lines'
  ],
  '3': [
    'Time your shot to capture the peak of wave action',
    'Consider the direction of wave movement',
    'Include shoreline elements for context'
  ],
  '4': [
    'Place key elements at intersection points of the grid',
    'Avoid centering the main subject',
    'Balance visual weight across the frame'
  ],
  '5': [
    'Identify natural lines that draw the eye through the image',
    'Use converging lines to create perspective',
    'Follow the path that your eye naturally takes'
  ],
};

export default function TutorialPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [frameResetKey, setFrameResetKey] = useState(0);
  const [showTips, setShowTips] = useState(false);

  const currentImage = SAMPLE_TUTORIAL_IMAGES[currentImageIndex];
  const optimalFrame = isHorizontal 
    ? HORIZONTAL_OPTIMAL_FRAMES[currentImage.id] 
    : OPTIMAL_FRAMES[currentImage.id];
  const popularFrame = SAMPLE_POPULAR_FRAMES[currentImage.id];
  const currentTips = TUTORIAL_TIPS[currentImage.id];

  // Simulate loading the optimal frames
  useEffect(() => {
    setIsLoading(true);
    setShowTips(false);
    
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
    
    // Show tips after submission
    setShowTips(true);
    
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
        
        {/* Photography Tips Section */}
        {showTips && (
          <div className="mt-8 glass p-6 rounded-2xl border border-indigo-800/30 shadow-lg animate-fadeIn">
            <h3 className="text-2xl font-bold text-indigo-100 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Photography Tips for {currentImage.title}
            </h3>
            <ul className="space-y-3 mt-4">
              {currentTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-900 text-indigo-300 mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-indigo-200">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
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