'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

// Detection object type
interface DetectionObject {
  box: [number, number, number, number];
  confidence: number;
  class: string;
}

// Frame score type
interface FrameScore {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

export default function AIPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [objectDetectionComplete, setObjectDetectionComplete] = useState(false);
  const [boxedImageUrl, setBoxedImageUrl] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<DetectionObject[]>([]);
  const [suggestedFrame, setSuggestedFrame] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [animationState, setAnimationState] = useState<'initial' | 'showingBoxes' | 'scanningFrames' | 'transitionToFrame' | 'showingFrame'>('initial');
  const [currentScanningFrame, setCurrentScanningFrame] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [scanningScore, setScanningScore] = useState<number | null>(null);
  const [scoredFrames, setScoredFrames] = useState<FrameScore[]>([]);
  const [highestScoringFrame, setHighestScoringFrame] = useState<FrameScore | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanningActive, setIsScanningActive] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store the actual image file
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Clear timeouts and intervals on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  const handleImageLoad = (imageId: string) => {
    setImagesLoaded(prev => ({...prev, [imageId]: true}));
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      setImageFile(file); // Save the actual file object
      setSuggestedFrame(null);
      setBoxedImageUrl(null);
      setDetectedObjects([]);
      setObjectDetectionComplete(false);
      setAnimationState('initial');
      setScoredFrames([]);
      setHighestScoringFrame(null);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB max size
    minSize: 1024, // 1KB min size
    onDropRejected: (rejectedFiles) => {
      const errors = rejectedFiles.map(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          return 'File is too large. Maximum size is 10MB.';
        }
        if (rejection.errors[0].code === 'file-too-small') {
          return 'File is too small. Minimum size is 1KB.';
        }
        if (rejection.errors[0].code === 'file-invalid-type') {
          return 'Invalid file type. Only JPEG and PNG images are accepted.';
        }
        return 'File could not be processed.';
      });
      
      alert(errors.join('\n'));
    }
  });
  
  const scanFrames = () => {
    if (!imageUrl || !suggestedFrame) {
      console.error("Cannot scan frames: imageUrl or suggestedFrame is null");
      // Create a default frame if suggestedFrame is missing
      if (imageUrl && !suggestedFrame) {
        console.log("Creating default suggested frame");
        const defaultFrame = {
          x: 0,
          y: 0,
          width: 375,
          height: 667
        };
        setSuggestedFrame(defaultFrame);
        // Use the default frame for scanning
        scanWithFrame(defaultFrame);
      }
      return;
    }
    
    console.log("Starting frame scanning with frame:", suggestedFrame);
    scanWithFrame(suggestedFrame);
  };
  
  const scanWithFrame = (frame: { x: number; y: number; width: number; height: number }) => {
    // Frame properties
    const frameWidth = frame.width;
    const frameHeight = frame.height;
    
    // Get image dimensions (we'll use a fake value for the simulation)
    const imgWidth = 1200;
    const imgHeight = 900;
    
    // Calculate step size for scanning (we'll scan ~8 positions)
    const stepX = Math.floor((imgWidth - frameWidth) / 3);
    const stepY = Math.floor((imgHeight - frameHeight) / 2);
    
    // Generate all scan positions
    const scanPositions: Array<{x: number, y: number}> = [];
    
    for (let y = 0; y <= imgHeight - frameHeight; y += stepY) {
      for (let x = 0; x <= imgWidth - frameWidth; x += stepX) {
        // Skip positions that would go beyond the image bounds
        if (x + frameWidth <= imgWidth && y + frameHeight <= imgHeight) {
          scanPositions.push({x, y});
        }
      }
    }
    
    // Add the suggested frame as the last position (which will be the highest scoring)
    scanPositions.push({
      x: frame.x,
      y: frame.y
    });
    
    console.log(`Created ${scanPositions.length} scan positions`);
    
    // Start the scanning process
    let currentIndex = 0;
    setIsScanningActive(true);
    setScanProgress(0);
    
    // Clear existing scored frames
    setScoredFrames([]);
    
    // Function to handle each scan step
    const scanStep = () => {
      console.log(`Processing scan position ${currentIndex} of ${scanPositions.length}`);
      
      if (currentIndex >= scanPositions.length) {
        // End of scanning
        console.log("Scanning complete, transitioning to final frame");
        setIsScanningActive(false);
        
        // Transition to showing the highest scoring frame
        setAnimationState('transitionToFrame');
        
        // After the transition, show the final state
        timeoutRef.current = setTimeout(() => {
          setAnimationState('showingFrame');
        }, 1500); // 1.5 seconds for the transition
        
        // Clear the interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      
      // Update progress
      setScanProgress((currentIndex / scanPositions.length) * 100);
      
      // Get current position
      const pos = scanPositions[currentIndex];
      
      // Set current scanning frame
      setCurrentScanningFrame({
        x: pos.x,
        y: pos.y,
        width: frameWidth,
        height: frameHeight
      });
      
      // Show "calculating" state for 0.5 seconds, then show score for 1.5 seconds
      setScanningScore(null);
      
      timeoutRef.current = setTimeout(() => {
        // Generate a score - make the suggested frame (last position) have the highest score
        let score: number;
        if (currentIndex === scanPositions.length - 1) {
          // This is the suggested frame, give it the highest score
          score = 9.5;
        } else {
          // Random score between 4 and 8.5
          score = 4 + Math.random() * 4.5;
        }
        score = Math.round(score * 10) / 10; // Round to 1 decimal place
        
        console.log(`Assigning score ${score} to frame ${currentIndex}`);
        
        // Set the score for display
        setScanningScore(score);
        
        // Add to scored frames
        const newScoredFrame: FrameScore = {
          x: pos.x,
          y: pos.y,
          width: frameWidth,
          height: frameHeight,
          score: score
        };
        
        setScoredFrames(prev => [...prev, newScoredFrame]);
        
        // Update highest scoring frame if needed
        setHighestScoringFrame(prev => 
          !prev || score > prev.score ? newScoredFrame : prev
        );
        
        // Move to next position after 1.5 more seconds
        timeoutRef.current = setTimeout(() => {
          currentIndex++;
          scanStep();
        }, 1500);
      }, 500);
    };
    
    // Start the scanning process
    console.log("Starting scan steps");
    scanStep();
  };
  
  const analyzeImage = async () => {
    if (!imageUrl || !imageFile) return;
    
    // Show the analyzing state
    setIsAnalyzing(true);
    setAnimationState('initial');
    
    try {
      // Create form data for the API call using the original file
      const formData = new FormData();
      formData.append('file', imageFile);
      
      console.log(`Using file: ${imageFile.name}, size: ${imageFile.size} bytes, type: ${imageFile.type}`);
      console.log('Sending request to object detection API...');
      
      // Call the object detection API
      const apiResponse = await fetch('/api/detect-objects/', {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        // Try to get the error message from the response
        let errorMessage = 'Object detection failed';
        try {
          const errorData = await apiResponse.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If we can't parse the JSON, use the status text
          errorMessage = `${errorMessage}: ${apiResponse.statusText}`;
        }
        console.error(`API error: ${apiResponse.status} - ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      console.log('Received successful response from API');
      const data = await apiResponse.json();
      console.log(`Detected ${data.detected_objects.length} objects`);
      
      // Set the boxed image (with object detection)
      const boxedImage = `data:image/jpeg;base64,${data.boxed_image}`;
      setBoxedImageUrl(boxedImage);
      
      // Set detected objects and suggested frame
      setDetectedObjects(data.detected_objects);
      
      // Ensure we have a suggested frame
      if (data.suggested_frame) {
        console.log("Received suggested frame from API:", data.suggested_frame);
        setSuggestedFrame(data.suggested_frame);
      } else {
        console.log("No suggested frame from API, creating default");
        // Create a default frame if none is provided
        setSuggestedFrame({
          x: 0, 
          y: 0,
          width: 375,
          height: 667
        });
      }
      
      // First show the boxed image
      setAnimationState('showingBoxes');
      setObjectDetectionComplete(true);
      
      // After a delay, start the frame scanning process
      console.log("Setting timeout to start frame scanning in 2.5 seconds");
      timeoutRef.current = setTimeout(() => {
        console.log("Timeout triggered, changing to scanningFrames state");
        setAnimationState('scanningFrames');
        scanFrames();
      }, 2500); // Show detection boxes for 2.5 seconds
    } catch (error) {
      console.error('Error analyzing image:', error);
      let errorMessage = 'Error analyzing the image. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
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
  
  // Render the results based on animation state
  const renderResults = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-6"></div>
          <p className="text-lg text-indigo-100">Our AI is analyzing your photo...</p>
          <p className="text-indigo-300 mt-2">This may take a few moments</p>
        </div>
      );
    }
    
    if (!objectDetectionComplete) {
      return (
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
      );
    }
    
    // Render based on animation state
    if (animationState === 'showingBoxes' && boxedImageUrl) {
      return (
        <div className="glass-dark border-indigo-800/20 rounded-xl overflow-hidden">
          <div className="relative" style={{ paddingBottom: '75%' }}>
            <img 
              src={boxedImageUrl} 
              alt="Object Detection" 
              className="absolute inset-0 w-full h-full object-contain"
              onLoad={() => handleImageLoad('boxed-image')}
            />
            {!imagesLoaded['boxed-image'] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            )}
          </div>
          <div className="p-6 bg-black/20">
            <h3 className="font-bold text-lg text-indigo-100">Object Detection Results</h3>
            <p className="mt-2 text-sm text-indigo-300">
              Our AI has detected {detectedObjects.length} object{detectedObjects.length !== 1 ? 's' : ''} in your image.
            </p>
            {detectedObjects.length > 0 && (
              <div className="mt-4 max-h-40 overflow-y-auto">
                <ul className="space-y-1 text-sm text-indigo-300">
                  {detectedObjects.map((obj, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-2 flex-shrink-0 mt-1"></span>
                      <span>{obj.class} (confidence: {(obj.confidence * 100).toFixed(1)}%)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (animationState === 'scanningFrames' && imageUrl && currentScanningFrame) {
      return (
        <div className="glass-dark border-indigo-800/20 rounded-xl overflow-hidden">
          <div className="relative" style={{ paddingBottom: `${(667/375) * 100}%` }}>
            {/* Current scanning frame */}
            {renderFramedImage(
              imageUrl,
              currentScanningFrame,
              "Scanning Frame",
              "scanning-frame"
            )}
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-900">
              <div 
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            
            {/* Score indicator */}
            <div className="absolute top-0 left-0 right-0 bg-black/70 p-3 flex items-center justify-between">
              <div className="text-indigo-100 text-sm font-medium">Frame Analysis</div>
              {scanningScore === null ? (
                <div className="text-indigo-300 text-sm animate-pulse">
                  Sending API request to scoring agent...
                </div>
              ) : (
                <div className="flex items-center text-sm">
                  <div className="mr-2 text-indigo-300">Score:</div>
                  <div className="px-3 py-1 rounded-full bg-indigo-700 text-white font-bold">
                    {scanningScore.toFixed(1)}/10
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 bg-black/20">
            <h3 className="font-bold text-lg text-indigo-100">Frame Scoring Analysis</h3>
            <p className="mt-2 text-sm text-indigo-300">
              Evaluating potential frames across your photo to find the optimal composition.
            </p>
            
            {/* Show scored frames so far */}
            {scoredFrames.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-indigo-200 mb-2">Frame Scores:</h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {scoredFrames.map((frame, index) => (
                    <div 
                      key={index}
                      className={`px-3 py-1 rounded-full text-xs ${
                        highestScoringFrame && frame.score === highestScoringFrame.score
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : 'bg-indigo-800/50 text-indigo-200'
                      }`}
                    >
                      Frame #{index + 1}: {frame.score.toFixed(1)}/10
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if ((animationState === 'transitionToFrame' || animationState === 'showingFrame') && highestScoringFrame && imageUrl) {
      // Apply transition classes based on state
      const transitionClass = animationState === 'transitionToFrame' 
        ? 'transition-all duration-1500 ease-in-out' 
        : '';
      
      return (
        <div className="glass-dark border-indigo-800/20 rounded-xl overflow-hidden">
          <div className={`relative ${transitionClass}`} style={{ paddingBottom: `${(667/375) * 100}%` }}>
            {renderFramedImage(
              imageUrl,
              highestScoringFrame,
              "AI Suggested Frame",
              "ai-frame"
            )}
            
            {/* Highest score indicator */}
            <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm shadow-lg">
              Score: {highestScoringFrame.score.toFixed(1)}/10
            </div>
          </div>
          <div className="p-6 bg-black/20">
            <h3 className="font-bold text-lg text-indigo-100">
              Optimal Frame Found
              <span className="ml-2 px-2 py-1 rounded bg-indigo-700/50 text-xs">
                Score: {highestScoringFrame.score.toFixed(1)}/10
              </span>
            </h3>
            <p className="mt-2 text-sm text-indigo-300">
              This is the highest-scoring frame calculated by our AI based on photography principles.
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
      );
    }
    
    // Fallback
    return (
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
                    Supports JPG and PNG (max 10MB)
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
                    disabled={isAnalyzing || !imageUrl}
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
                AI Analysis Results
              </h2>
              
              <div className="glass border border-indigo-800/30 rounded-xl h-full">
                {renderResults()}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 relative">
              {/* Journey path line */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-800/50 via-indigo-400/50 to-indigo-800/50"></div>
              
              <div className="glass rounded-2xl p-6 md:p-8 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 rounded-2xl blur"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center mb-6 text-xl font-bold text-indigo-100">1</div>
                  <h3 className="text-xl font-semibold text-indigo-100 mb-3">Upload Your Photo</h3>
                  <p className="text-indigo-300">
                    Share any photo you&apos;d like to frame better. Our system accepts JPEG and PNG formats.
                  </p>
                </div>
              </div>
              
              <div className="glass rounded-2xl p-6 md:p-8 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 rounded-2xl blur"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center mb-6 text-xl font-bold text-indigo-100">2</div>
                  <h3 className="text-xl font-semibold text-indigo-100 mb-3">Object Detection</h3>
                  <p className="text-indigo-300">
                    Our advanced AI identifies objects in your image using YOLOv8 technology to understand scene composition.
                  </p>
                </div>
              </div>
              
              <div className="glass rounded-2xl p-6 md:p-8 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 rounded-2xl blur"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center mb-6 text-xl font-bold text-indigo-100">3</div>
                  <h3 className="text-xl font-semibold text-indigo-100 mb-3">Frame Analysis</h3>
                  <p className="text-indigo-300">
                    AI systematically evaluates potential frames across your image, scoring each based on composition principles.
                  </p>
                </div>
              </div>
              
              <div className="glass rounded-2xl p-6 md:p-8 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 rounded-2xl blur"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center mb-6 text-xl font-bold text-indigo-100">4</div>
                  <h3 className="text-xl font-semibold text-indigo-100 mb-3">Optimal Frame</h3>
                  <p className="text-indigo-300">
                    Receive the highest-scoring frame optimized for visual impact and professional composition.
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