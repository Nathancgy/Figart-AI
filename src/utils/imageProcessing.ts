import { HfInference } from '@huggingface/inference';
import { OpenAI } from 'openai';
import sharp from 'sharp';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract features from an image using a pre-trained model
 */
export async function extractImageFeatures(imageUrl: string) {
  try {
    // Analyze image using a computer vision model
    const result = await hf.computerVision({
      data: await fetch(imageUrl).then(r => r.blob()),
      model: 'google/vit-base-patch16-224',
    });
    
    return result;
  } catch (error) {
    console.error('Error extracting image features:', error);
    throw new Error('Failed to extract image features');
  }
}

/**
 * Detect objects and their bounding boxes in an image
 */
export async function detectObjects(imageUrl: string) {
  try {
    // Analyze image using an object detection model
    const result = await hf.objectDetection({
      data: await fetch(imageUrl).then(r => r.blob()),
      model: 'facebook/detr-resnet-50',
    });
    
    return result;
  } catch (error) {
    console.error('Error detecting objects:', error);
    throw new Error('Failed to detect objects in image');
  }
}

/**
 * Find the optimal frame for a photo using AI
 */
export async function findOptimalFrame(imageUrl: string, aspectRatio = 9/16) {
  try {
    // Get image dimensions
    const metadata = await sharp(await fetch(imageUrl).then(r => r.arrayBuffer())).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Failed to get image dimensions');
    }
    
    // Get objects in the image
    const objects = await detectObjects(imageUrl);
    
    // Extract image features for aesthetic analysis
    const features = await extractImageFeatures(imageUrl);
    
    // Use OpenAI to analyze and determine the best frame
    const frameHeight = Math.min(metadata.height, Math.floor(metadata.width / aspectRatio));
    const frameWidth = Math.floor(frameHeight * aspectRatio);
    
    // Prepare the prompt for OpenAI
    const prompt = `
      Analyze this image with dimensions ${metadata.width}x${metadata.height}.
      The image contains the following objects: ${JSON.stringify(objects)}.
      The aesthetic features of the image are: ${JSON.stringify(features)}.
      
      Determine the optimal vertical frame with dimensions ${frameWidth}x${frameHeight} for a mobile phone photo.
      Consider the rule of thirds, leading lines, and focus on main subjects.
      
      Return ONLY a JSON object with coordinates of the top-left corner (x, y) for the optimal frame.
      Format: { "x": number, "y": number }
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        { 
          role: "user", 
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      x: result.x || 0,
      y: result.y || 0,
      width: frameWidth,
      height: frameHeight,
    };
  } catch (error) {
    console.error('Error finding optimal frame:', error);
    throw new Error('Failed to find optimal frame');
  }
}

/**
 * Compare user frame with AI optimal frame and provide feedback
 */
export function evaluateUserFrame(
  userFrame: { x: number, y: number, width: number, height: number },
  optimalFrame: { x: number, y: number, width: number, height: number },
  imageWidth: number,
  imageHeight: number
) {
  // Calculate intersection area
  const x1 = Math.max(userFrame.x, optimalFrame.x);
  const y1 = Math.max(userFrame.y, optimalFrame.y);
  const x2 = Math.min(userFrame.x + userFrame.width, optimalFrame.x + optimalFrame.width);
  const y2 = Math.min(userFrame.y + userFrame.height, optimalFrame.y + optimalFrame.height);
  
  const intersectionWidth = Math.max(0, x2 - x1);
  const intersectionHeight = Math.max(0, y2 - y1);
  const intersectionArea = intersectionWidth * intersectionHeight;
  
  // Calculate union area
  const userArea = userFrame.width * userFrame.height;
  const optimalArea = optimalFrame.width * optimalFrame.height;
  const unionArea = userArea + optimalArea - intersectionArea;
  
  // Calculate Intersection over Union (IoU)
  const iou = intersectionArea / unionArea;
  
  // Calculate center point distances
  const userCenterX = userFrame.x + userFrame.width / 2;
  const userCenterY = userFrame.y + userFrame.height / 2;
  const optimalCenterX = optimalFrame.x + optimalFrame.width / 2;
  const optimalCenterY = optimalFrame.y + optimalFrame.height / 2;
  
  // Normalize distance by image dimensions
  const distanceX = Math.abs(userCenterX - optimalCenterX) / imageWidth;
  const distanceY = Math.abs(userCenterY - optimalCenterY) / imageHeight;
  
  const centerDistance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
  
  // Score from 0 to 100
  const score = Math.round((iou * 0.7 + (1 - centerDistance) * 0.3) * 100);
  
  let feedback;
  if (score >= 90) {
    feedback = "Excellent framing! Your eye for composition is spot on.";
  } else if (score >= 75) {
    feedback = "Great job! Your frame is very close to the optimal composition.";
  } else if (score >= 60) {
    feedback = "Good effort. Try adjusting your frame slightly for better composition.";
  } else if (score >= 40) {
    feedback = "You're on the right track. Consider the rule of thirds and try again.";
  } else {
    feedback = "Keep practicing! Try focusing on the main subject of the image.";
  }
  
  return {
    score,
    feedback,
    iou,
    centerDistance,
  };
} 