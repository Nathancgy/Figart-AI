'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TutorialImage, Frame } from '@/types';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import Image from 'next/image';

interface TutorialFrameProps {
  tutorialImage: TutorialImage;
  onSubmit: (frame: Omit<Frame, 'id' | 'userId' | 'user' | 'createdAt' | 'likes'>) => Promise<void>;
  optimalFrame?: { x: number; y: number; width: number; height: number };
  popularFrame?: Frame;
  isHorizontal?: boolean;
}

const TutorialFrame: React.FC<TutorialFrameProps> = ({
  tutorialImage,
  onSubmit,
  optimalFrame,
  popularFrame,
  isHorizontal = false,
}) => {
  const [step, setStep] = useState<'framing' | 'results'>('framing');
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  
  const cropperRef = useRef<HTMLImageElement>(null);
  const [cropData, setCropData] = useState({ 
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0 
  });
  
  // Aspect ratio (default is portrait orientation for mobile)
  const aspectRatio = isHorizontal ? 16 / 9 : 9 / 16;
  
  const handleImageLoad = (imageId: string) => {
    setImagesLoaded(prev => ({...prev, [imageId]: true}));
  };
  
  // Reset state when the image changes
  useEffect(() => {
    setStep('framing');
    setScore(null);
    setFeedback(null);
    setShowOriginal(false);
    setImagesLoaded({});
    
    // Initialize crop data with default values
    setCropData({
      x: isHorizontal ? 200 : 100,
      y: isHorizontal ? 100 : 200,
      width: isHorizontal ? 667 : 375,
      height: isHorizontal ? 375 : 667
    });
  }, [tutorialImage.id, isHorizontal]);
  
  // Preload the tutorial image
  useEffect(() => {
    if (tutorialImage && tutorialImage.imageUrl) {
      // Reset the images loaded state
      setImagesLoaded({});
      
      // Mark all images as loaded after a timeout
      // This is a fallback in case the image loading events don't fire
      const timer = setTimeout(() => {
        setImagesLoaded({
          'tutorial': true,
          'user-frame': true,
          'ai-frame': true,
          'popular-frame': true,
          'original': true
        });
      }, 2000);
      
      // Preload the main tutorial image
      const img = new window.Image();
      img.onload = () => {
        console.log('Tutorial image loaded:', tutorialImage.imageUrl);
        setImagesLoaded(prev => ({
          ...prev,
          'tutorial': true,
          'user-frame': true,
          'ai-frame': true,
          'popular-frame': true,
          'original': true
        }));
        clearTimeout(timer);
      };
      img.src = tutorialImage.imageUrl;
      
      return () => clearTimeout(timer);
    }
  }, [tutorialImage]);
  
  // Handle the submission of the user's frame
  const handleSubmit = async () => {
    if (!cropperRef.current) return;
    
    setIsSubmitting(true);
    
    try {
      // Get the cropper instance
      const cropper = (cropperRef.current as any)?.cropper;
      if (!cropper) return;
      
      // Get the cropping data
      const data = cropper.getData();
      
      // Prepare the frame data
      const frameData = {
        originImageUrl: tutorialImage.imageUrl,
        frameX: Math.round(data.x),
        frameY: Math.round(data.y),
        frameWidth: Math.round(data.width),
        frameHeight: Math.round(data.height),
      };
      
      // Save frame data
      setCropData({
        x: frameData.frameX,
        y: frameData.frameY,
        width: frameData.frameWidth,
        height: frameData.frameHeight,
      });
      
      // Submit the frame
      await onSubmit(frameData);
      
      // Calculate score if optimal frame is available
      if (optimalFrame) {
        const imageWidth = cropperRef.current.naturalWidth;
        const imageHeight = cropperRef.current.naturalHeight;
        
        // Calculate intersection area
        const x1 = Math.max(frameData.frameX, optimalFrame.x);
        const y1 = Math.max(frameData.frameY, optimalFrame.y);
        const x2 = Math.min(frameData.frameX + frameData.frameWidth, optimalFrame.x + optimalFrame.width);
        const y2 = Math.min(frameData.frameY + frameData.frameHeight, optimalFrame.y + optimalFrame.height);
        
        const intersectionWidth = Math.max(0, x2 - x1);
        const intersectionHeight = Math.max(0, y2 - y1);
        const intersectionArea = intersectionWidth * intersectionHeight;
        
        // Calculate union area
        const userArea = frameData.frameWidth * frameData.frameHeight;
        const optimalArea = optimalFrame.width * optimalFrame.height;
        const unionArea = userArea + optimalArea - intersectionArea;
        
        // Calculate Intersection over Union (IoU)
        const iou = intersectionArea / unionArea;
        
        // Calculate center point distances
        const userCenterX = frameData.frameX + frameData.frameWidth / 2;
        const userCenterY = frameData.frameY + frameData.frameHeight / 2;
        const optimalCenterX = optimalFrame.x + optimalFrame.width / 2;
        const optimalCenterY = optimalFrame.y + optimalFrame.height / 2;
        
        // Normalize distance by image dimensions
        const distanceX = Math.abs(userCenterX - optimalCenterX) / imageWidth;
        const distanceY = Math.abs(userCenterY - optimalCenterY) / imageHeight;
        
        const centerDistance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
        
        // Score from 0 to 100
        const calculatedScore = Math.round((iou * 0.7 + (1 - centerDistance) * 0.3) * 100);
        
        // Set feedback first
        let feedbackText = "";
        if (calculatedScore >= 90) {
          feedbackText = "Excellent framing! Your eye for composition is spot on.";
        } else if (calculatedScore >= 75) {
          feedbackText = "Great job! Your frame is very close to the optimal composition.";
        } else if (calculatedScore >= 60) {
          feedbackText = "Good effort. Try adjusting your frame slightly for better composition.";
        } else if (calculatedScore >= 40) {
          feedbackText = "You're on the right track. Consider the rule of thirds and try again.";
        } else {
          feedbackText = "Keep practicing! Try focusing on the main subject of the image.";
        }
        
        // Set feedback and score
        setFeedback(feedbackText || "No feedback available");
        setScore(calculatedScore);
        
        // Debug log
        console.log("Setting feedback:", feedbackText || "No feedback available");
        
        // Force a re-render by setting step after a small delay
        setTimeout(() => {
          setStep('results');
          console.log("Step set to results with feedback:", feedbackText || "No feedback available");
        }, 100);
      } else {
        // Default feedback if no optimal frame
        const defaultFeedback = "Thanks for submitting your frame! Since there's no optimal frame for comparison, we can't provide a specific score.";
        setFeedback(defaultFeedback);
        setScore(75);
        
        // Debug log
        console.log("Setting default feedback:", defaultFeedback);
        
        // Force a re-render by setting step after a small delay
        setTimeout(() => {
          setStep('results');
          console.log("Step set to results with default feedback:", defaultFeedback);
        }, 100);
      }
    } catch (error) {
      console.error('Error submitting frame:', error);
      // Set fallback feedback in case of error
      const errorFeedback = "We encountered an issue analyzing your frame. Please try again.";
      setFeedback(errorFeedback);
      setScore(50);
      
      // Debug log
      console.log("Setting error feedback:", errorFeedback);
      
      // Still show results even if there was an error
      setTimeout(() => {
        setStep('results');
        console.log("Step set to results after error with feedback:", errorFeedback);
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    setStep('framing');
    setScore(null);
    setFeedback(null);
  };
  
  // Calculate the scale factor needed to display the frame properly
  const getScaleFactor = (frameWidth: number, frameHeight: number, containerWidth: number, containerHeight: number) => {
    // Calculate the scale needed to fit the frame in the container
    const scaleX = containerWidth / frameWidth;
    const scaleY = containerHeight / frameHeight;
    // Use the smaller scale to ensure the entire frame fits
    return Math.min(scaleX, scaleY);
  };
  
  const renderFramedImage = (image: string, frame: { x: number; y: number; width: number; height: number }, alt: string, id: string) => {
    return (
      <>
        {!imagesLoaded[id] && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        )}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${image})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </div>
      </>
    );
  };
  
  // Add useEffect to log state changes
  useEffect(() => {
    console.log("Step changed:", step);
    console.log("Score:", score);
    console.log("Feedback:", feedback);
    
    // Mark all images as loaded when step changes to results
    if (step === 'results') {
      setTimeout(() => {
        setImagesLoaded({
          'tutorial': true,
          'user-frame': true,
          'ai-frame': true,
          'popular-frame': true,
          'original': true
        });
      }, 500);
    }
  }, [step, score, feedback]);
  
  // Add useEffect to log cropData changes
  useEffect(() => {
    console.log("CropData updated:", cropData);
  }, [cropData]);
  
  return (
    <div className="w-full mx-auto p-6">
      {step === 'framing' ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="flex-1">
              <div className="glass-dark rounded-xl p-8 shadow-lg relative overflow-hidden">
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-600 rounded-full mix-blend-screen filter blur-[80px] opacity-10"></div>
                
                <h1 className="text-3xl font-bold mb-2 text-indigo-100 flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-indigo-400 to-purple-400 mr-4 rounded-full"></div>
                  {tutorialImage.title}
                </h1>
                {tutorialImage.description && (
                  <p className="text-indigo-300 mb-6 text-lg">
                    {tutorialImage.description}
                  </p>
                )}
                
                <div className="border border-indigo-800/30 rounded-lg overflow-hidden shadow-lg glass">
                  <Cropper
                    src={tutorialImage.imageUrl}
                    style={{ height: 600, width: '100%' }}
                    aspectRatio={aspectRatio}
                    guides={true}
                    ref={cropperRef}
                    viewMode={1}
                    dragMode="move"
                    autoCropArea={0.8}
                    responsive={true}
                    restore={false}
                    highlight={false}
                    cropBoxMovable={true}
                    cropBoxResizable={true}
                    zoomOnWheel={false}
                    checkOrientation={true}
                    checkCrossOrigin={true}
                    background={false}
                    initialAspectRatio={aspectRatio}
                    minCropBoxWidth={100}
                    minCropBoxHeight={100}
                  />
                </div>
                
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-4 relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none group"
                  >
                    <span className="relative z-10">
                      {isSubmitting ? 'Analyzing...' : 'Submit Frame'}
                    </span>
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-75 blur transition-opacity duration-300"></span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/3">
              <div className="glass-dark rounded-xl p-8 shadow-lg h-full relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-10"></div>
                
                <h2 className="text-2xl font-bold mb-6 text-indigo-100 flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 mr-4 rounded-full"></div>
                  Photography Tips
                </h2>
                <div className="space-y-4">
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold text-indigo-200">The Rule of Thirds</h3>
                    <p className="text-indigo-300 mt-1">Place key elements along the gridlines or at their intersections.</p>
                  </div>
                  
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold text-indigo-200">Leading Lines</h3>
                    <p className="text-indigo-300 mt-1">Use natural lines to guide the viewer's eye to the main subject.</p>
                  </div>
                  
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold text-indigo-200">Framing</h3>
                    <p className="text-indigo-300 mt-1">Use elements in the scene to create a natural frame around your subject.</p>
                  </div>
                  
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold text-indigo-200">Balance</h3>
                    <p className="text-indigo-300 mt-1">Create visual harmony by distributing visual weight throughout the frame.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : step === 'results' ? (
        <div className="space-y-8" key={`results-${score}`} style={{ opacity: 1, visibility: 'visible' }}>
          <div className="glass-dark rounded-xl p-8 shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-[80px] opacity-10"></div>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[80px] opacity-10"></div>
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-indigo-100 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-400 to-purple-400 mr-4 rounded-full"></div>
                Results & Analysis
              </h2>
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="px-4 py-2 glass text-indigo-100 rounded-lg hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                {showOriginal ? "Hide Original" : "View Original"}
              </button>
            </div>
            
            {showOriginal && (
              <div className="mb-8 border border-indigo-800/30 rounded-lg overflow-hidden relative">
                <div 
                  className="w-full h-[400px] bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${tutorialImage.imageUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 relative">
              {/* Connected journey line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent hidden md:block"></div>
              
              {/* User's Frame */}
              <div className="glass border border-indigo-800/30 rounded-xl overflow-hidden relative h-full flex flex-col">
                <div className="relative w-full" style={{ paddingBottom: isHorizontal ? '56.25%' : '177.78%', height: 0 }}>
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    {!imagesLoaded["user-frame"] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                      </div>
                    )}
                    <img 
                      src={tutorialImage.imageUrl}
                      alt="Your Frame"
                      className="absolute w-full h-full"
                      onLoad={() => handleImageLoad("user-frame")}
                      style={{
                        objectFit: 'cover',
                        objectPosition: `${50 - (cropData.x / 20)}% ${50 - (cropData.y / 20)}%`
                      }}
                    />
                  </div>
                  
                  {/* User Frame Overlay */}
                  <div className="absolute bottom-3 right-3 z-30">
                    <div className="bg-emerald-900/70 backdrop-blur-sm p-1.5 rounded-lg shadow-lg border border-emerald-500/50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-6 relative z-10 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg text-indigo-100">Your Frame</h3>
                  {score !== null && (
                    <div className="mt-4 relative z-10 flex-grow" style={{ position: 'relative', zIndex: 10, opacity: 1 }}>
                      <div className="w-full bg-indigo-900/50 rounded-full h-3 mt-2 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full ${
                            score >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                            score >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                            'bg-gradient-to-r from-rose-400 to-rose-500'
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-indigo-300">Score</span>
                        <span className="font-bold text-indigo-100">{score}/100</span>
                      </div>
                      <div className="mt-4 p-4 bg-indigo-800 rounded-lg border-2 border-indigo-400 shadow-xl relative z-10 min-h-[80px] overflow-auto" style={{ backgroundColor: '#3730a3', borderColor: '#818cf8' }}>
                        {feedback ? (
                          <p className="text-white text-sm md:text-base font-semibold opacity-100 visible" style={{ color: 'white', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>{feedback}</p>
                        ) : (
                          <p className="text-white text-sm md:text-base font-semibold opacity-100 visible" style={{ color: 'white', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>No feedback available</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* AI's Optimal Frame */}
              {optimalFrame && (
                <div className="glass border border-indigo-800/30 rounded-xl overflow-hidden relative h-full flex flex-col">
                  <div className="relative w-full" style={{ paddingBottom: isHorizontal ? '56.25%' : '177.78%', height: 0 }}>
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      {!imagesLoaded["ai-frame"] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                        </div>
                      )}
                      <img 
                        src={tutorialImage.imageUrl}
                        alt="AI's Suggested Frame"
                        className="absolute w-full h-full"
                        onLoad={() => handleImageLoad("ai-frame")}
                        style={{
                          objectFit: 'cover',
                          objectPosition: `${50 - (optimalFrame.x / 20)}% ${50 - (optimalFrame.y / 20)}%`
                        }}
                      />
                    </div>
                    
                    {/* AI Frame Image Overlay */}
                    <div className="absolute bottom-3 right-3 z-30">
                      <div className="bg-indigo-900/70 backdrop-blur-sm p-1.5 rounded-lg shadow-lg border border-indigo-500/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 md:p-6 relative flex-grow">
                    <h3 className="font-bold text-lg text-indigo-100">AI's Suggested Frame</h3>
                    <p className="mt-2 text-sm text-indigo-300">
                      This is the optimal frame calculated by our AI based on photography principles.
                    </p>
                    
                    {/* Sample frame illustration */}
                    <div className="mt-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-700/50">
                      <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-indigo-200">Frame Tips</span>
                      </div>
                      <ul className="space-y-1 text-xs text-indigo-300">
                        <li className="flex items-start">
                          <svg className="h-4 w-4 text-indigo-400 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Follows rule of thirds</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-4 w-4 text-indigo-400 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Balanced composition</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-4 w-4 text-indigo-400 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Clear focal point</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Most Popular Frame */}
              {popularFrame && (
                <div className="glass border border-indigo-800/30 rounded-xl overflow-hidden relative h-full flex flex-col">
                  <div className="relative w-full" style={{ paddingBottom: isHorizontal ? '56.25%' : '177.78%', height: 0 }}>
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      {!imagesLoaded["popular-frame"] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                        </div>
                      )}
                      <img 
                        src={tutorialImage.imageUrl}
                        alt="Community's Favorite Frame"
                        className="absolute w-full h-full"
                        onLoad={() => handleImageLoad("popular-frame")}
                        style={{
                          objectFit: 'cover',
                          objectPosition: `${50 - (popularFrame.frameX / 20)}% ${50 - (popularFrame.frameY / 20)}%`
                        }}
                      />
                    </div>
                    
                    {/* Community Frame Image Overlay */}
                    <div className="absolute bottom-3 right-3 z-30">
                      <div className="bg-rose-900/70 backdrop-blur-sm p-1.5 rounded-lg shadow-lg border border-rose-500/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 md:p-6 relative flex-grow">
                    <h3 className="font-bold text-lg text-indigo-100">Community's Favorite</h3>
                    <p className="mt-2 text-sm text-indigo-300">
                      This frame has received the most likes from the community.
                    </p>
                    <div className="mt-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-indigo-100">{popularFrame.likes} likes</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-12">
              <button
                onClick={handleReset}
                className="px-6 py-3 glass text-indigo-100 rounded-full hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="glass-dark rounded-xl p-8 shadow-lg mb-8 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-indigo-100">Something went wrong</h2>
            <p className="text-indigo-300 mt-4">Please try again.</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 glass text-indigo-100 rounded-full hover:text-white transition-all duration-300 transform hover:scale-105 mt-8"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Learning hints */}
      {step === 'framing' && (
        <div className="mt-8 glass rounded-xl p-6 border border-indigo-800/30 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-indigo-100 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-400 mr-3 rounded-full"></div>
            Photography Framing Challenge
          </h2>
          <p className="text-indigo-300 mb-6">
            Drag the frame to position it over the most visually appealing part of the image. 
            Use the corner handles to resize if needed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-indigo-200 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What to look for:
              </h3>
              <ul className="space-y-2 text-indigo-300">
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Find the main subject and ensure it's properly positioned</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Use the rule of thirds - align key elements with the grid lines</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Look for natural framing opportunities within the scene</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Consider the visual flow and balance of the composition</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-indigo-200 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Common mistakes to avoid:
              </h3>
              <ul className="space-y-2 text-indigo-300">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-rose-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cutting off important elements of the scene</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-rose-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Centering the subject when rule of thirds would work better</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-rose-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Including too many distracting elements</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-rose-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Not considering the visual weight and balance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialFrame; 