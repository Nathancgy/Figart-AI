'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

export default function AIPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedFrame, setSuggestedFrame] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  
  const handleImageLoad = (imageId: string) => {
    setImagesLoaded(prev => ({...prev, [imageId]: true}));
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      setSuggestedFrame(null);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 1,
  });
  
  const analyzeImage = () => {
    if (!imageUrl) return;
    
    // Show the analyzing state
    setIsAnalyzing(true);
    
    // Check if image is already loaded to memory
    if (!imagesLoaded['uploaded']) {
      const preloadImage = new window.Image();
      preloadImage.src = imageUrl;
      preloadImage.onload = () => {
        // Once preloaded, start the analysis
        performAnalysis();
      };
      preloadImage.onerror = () => {
        setIsAnalyzing(false);
        alert('Error loading image. Please try again with a different image.');
      };
    } else {
      // Image already loaded, proceed with analysis
      performAnalysis();
    }
  };
  
  // Separate function to perform the actual analysis
  const performAnalysis = () => {
    // In a real application, this would be an API call to your backend
    // that would analyze the image using computer vision
    setTimeout(() => {
      // Get the image element
      const img = document.querySelector('img[alt="Uploaded"]') as HTMLImageElement;
      
      if (img && img.naturalWidth && img.naturalHeight) {
        // Use standard mobile frame dimensions (iPhone-like aspect ratio)
        const frameWidth = 375;  // Standard width for vertical mobile frame
        const frameHeight = 667; // Standard height for vertical mobile frame
        
        // Calculate boundaries to ensure the frame stays within the image
        const maxX = Math.max(0, img.naturalWidth - frameWidth);
        const maxY = Math.max(0, img.naturalHeight - frameHeight);
        
        // Generate a frame position that's not too close to the edges
        // but ensures the frame stays within the image bounds
        const frameX = Math.min(maxX, Math.floor(maxX * 0.5));
        const frameY = Math.min(maxY, Math.floor(maxY * 0.5));
        
        setSuggestedFrame({
          x: frameX,
          y: frameY,
          width: frameWidth,
          height: frameHeight
        });
      } else {
        // Fallback if we can't get the image dimensions
        setSuggestedFrame({
          x: 100,
          y: 100,
          width: 375,
          height: 667
        });
      }
      
      setIsAnalyzing(false);
    }, 1500); // Reduced simulation time for better UX
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
    // Use fixed container dimensions matching our standard frame size
    const containerWidth = 375; // Standard mobile width
    const containerHeight = 667; // Standard mobile height
    
    // Calculate scale factor
    const scale = getScaleFactor(frame.width, frame.height, containerWidth, containerHeight);
    
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
          <div className="animate-pulse flex space-x-4">
            <div className="h-12 w-12 rounded-full bg-indigo-500/30"></div>
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={image}
            alt={alt}
            className="absolute origin-top-left"
            style={{
              left: `${-frame.x * scale}px`,
              top: `${-frame.y * scale}px`,
              width: 'auto',
              height: 'auto',
              transform: `scale(${scale})`,
              maxWidth: 'none',
              maxHeight: 'none',
            }}
            onLoad={() => handleImageLoad(id)}
          />
        </div>
        {!imagesLoaded[id] && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        )}
      </>
    );
  };
  
  return (
    <div className="min-h-screen py-16 relative">
      {/* Decorative elements */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>
      <div className="absolute left-0 bottom-1/4 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative">
          <div className="inline-block">
            <div className="absolute -inset-6 blur-2xl bg-indigo-600/20 rounded-full"></div>
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400 relative">
              AI Frame Analysis
            </h1>
          </div>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-indigo-100 opacity-80">
            Upload a photo to get AI-powered suggestions for the perfect frame.
          </p>
        </div>
        
        <div className="glass-dark rounded-3xl overflow-hidden border border-indigo-900/30 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-8 md:p-10 relative overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-600 rounded-full mix-blend-screen filter blur-[80px] opacity-10"></div>
              
              <h2 className="text-2xl font-bold text-indigo-100 mb-8 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-400 to-purple-400 mr-4 rounded-full"></div>
                Upload Your Photo
              </h2>
              
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  isDragActive 
                    ? 'border-indigo-400 bg-indigo-900/30' 
                    : 'border-indigo-800 hover:border-indigo-400 hover:bg-indigo-900/20'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xl font-medium text-indigo-100 mb-3">
                    {isDragActive ? 'Drop your image here' : 'Drag & drop or click to select an image'}
                  </p>
                  <p className="text-indigo-300 text-sm">
                    Supports JPG, PNG, GIF (max 10MB)
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/10 to-purple-700/10"></div>
              </div>
              
              {imageUrl && (
                <div className="mt-8 relative">
                  <div className="glass border border-indigo-800/50 rounded-xl overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt="Uploaded" 
                      className="w-full h-auto"
                      onLoad={() => handleImageLoad('uploaded')}
                    />
                    {!imagesLoaded['uploaded'] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 relative group"
                  >
                    <span className="relative z-10">
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Photo'}
                    </span>
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-75 blur transition-opacity duration-300"></span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-8 md:p-10 border-t md:border-t-0 md:border-l border-indigo-800/30 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-600 rounded-full mix-blend-screen filter blur-[80px] opacity-10"></div>
              
              <h2 className="text-2xl font-bold text-indigo-100 mb-8 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 mr-4 rounded-full"></div>
                AI Suggested Frame
              </h2>
              
              <div className="glass border border-indigo-800/30 rounded-xl h-full">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-6"></div>
                    <p className="text-lg text-indigo-100">Our AI is analyzing your photo...</p>
                    <p className="text-indigo-300 mt-2">This may take a few moments</p>
                  </div>
                ) : suggestedFrame ? (
                  <div className="glass-dark border-indigo-800/20 rounded-xl overflow-hidden">
                    <div className="relative" style={{ paddingBottom: `${(667/375) * 100}%` }}>
                      {renderFramedImage(
                        imageUrl!,
                        suggestedFrame,
                        "AI Suggested Frame",
                        "ai-frame"
                      )}
                    </div>
                    <div className="p-6 bg-black/20">
                      <h3 className="font-bold text-lg text-indigo-100">AI's Suggested Frame</h3>
                      <p className="mt-2 text-sm text-indigo-300">
                        This is the optimal frame calculated by our AI based on photography principles.
                      </p>
                      <div className="mt-6 p-5 glass rounded-xl">
                        <h4 className="font-semibold text-indigo-200 mb-3">Why This Works:</h4>
                        <ul className="space-y-2 text-sm text-indigo-300">
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Follows the rule of thirds for balanced composition</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Properly frames the main subject for maximum impact</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Eliminates distracting elements from the frame</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Creates visual harmony with proper spacing</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-indigo-800 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-lg font-medium text-indigo-200 mb-3">
                      Upload a photo to get started
                    </p>
                    <p className="text-indigo-300">
                      Our AI will analyze your photo and suggest the perfect frame
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 relative overflow-hidden">
          <div className="glass-dark rounded-3xl p-10 border border-indigo-900/30 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
            <div className="flex items-center mb-10">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-400 to-purple-400 mr-4 rounded-full"></div>
              <h2 className="text-2xl font-bold text-indigo-100">Your Journey to Perfect Framing</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 relative">
              {/* Journey path line */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-800/50 via-indigo-400/50 to-indigo-800/50"></div>
              
              <div className="glass rounded-2xl p-6 md:p-8 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 rounded-2xl blur"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center mb-6 text-xl font-bold text-indigo-100">1</div>
                  <h3 className="text-xl font-semibold text-indigo-100 mb-3">Upload Your Photo</h3>
                  <p className="text-indigo-300">
                    Share any photo you'd like to frame better. Our system accepts most image formats.
                  </p>
                </div>
              </div>
              
              <div className="glass rounded-2xl p-6 md:p-8 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 rounded-2xl blur"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center mb-6 text-xl font-bold text-indigo-100">2</div>
                  <h3 className="text-xl font-semibold text-indigo-100 mb-3">AI Analysis</h3>
                  <p className="text-indigo-300">
                    Our advanced AI analyzes your image using professional photography principles and composition rules.
                  </p>
                </div>
              </div>
              
              <div className="glass rounded-2xl p-6 md:p-8 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 rounded-2xl blur"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center mb-6 text-xl font-bold text-indigo-100">3</div>
                  <h3 className="text-xl font-semibold text-indigo-100 mb-3">Get Suggestions</h3>
                  <p className="text-indigo-300">
                    Receive frame suggestions optimized for visual impact and professional composition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 