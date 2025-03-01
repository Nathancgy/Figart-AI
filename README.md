# Figart AI - Photography Tutorial and Community

A web application that helps users improve their photography skills through interactive tutorials, AI-powered analysis, and community feedback.

## Features

- **Interactive Photography Tutorials**: Practice framing and composition by finding the best frame in large landscape images.
- **AI-Powered Analysis**: Our AI algorithms analyze photos to suggest optimal framing based on composition principles.
- **Community and Feedback**: Share your photos and frames, receive likes and feedback from other photographers.

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **AI and Image Processing**: OpenAI API, Hugging Face Inference API, Sharp
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Hugging Face API key
- OpenAI API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/figart-ai.git
   cd figart-ai
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   HUGGINGFACE_API_KEY=your_huggingface_key
   OPENAI_API_KEY=your_openai_key
   ```

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/app`: Next.js App Router pages and layouts
- `/src/components`: Reusable React components
- `/src/utils`: Utility functions including AI image processing
- `/src/models`: Database models
- `/src/types`: TypeScript interfaces and types
- `/src/lib`: Library code for database connections and authentication

## AI Algorithm Overview

The core AI algorithm for finding the optimal frame in a photo:

1. **Image Analysis**: Uses computer vision models to detect objects and features in the image
2. **Composition Principles**: Applies photography principles like rule of thirds and leading lines
3. **Frame Calculation**: Determines the optimal vertical frame based on the analysis
4. **Score Calculation**: Evaluates user frames against the AI's suggested frame using IoU (Intersection over Union) and center distance metrics

## Community Guidelines

We encourage users to:
- Provide constructive feedback on others' photos
- Share high-quality, original images
- Respect copyright and intellectual property
- Be supportive and positive in all interactions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Image examples from Unsplash
- Icon designs from Heroicons 