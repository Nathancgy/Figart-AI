import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Regex to match static assets
const STATIC_ASSETS = /\.(jpg|jpeg|png|gif|webp|svg|ico|ttf|woff|woff2|css|js)$/;

// Function to determine if a URL is for a static asset
function isStaticAsset(url: string): boolean {
  return STATIC_ASSETS.test(url);
}

// Middleware function
export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;
  const response = NextResponse.next();

  // Add caching headers for static assets
  if (isStaticAsset(url)) {
    // Cache static assets for 7 days (604800 seconds)
    response.headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    
    // Add ETag support for conditional requests
    response.headers.set('Vary', 'Accept-Encoding');
    
    // Set content type based on file extension
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
      response.headers.set('Content-Type', 'image/jpeg');
    } else if (url.endsWith('.png')) {
      response.headers.set('Content-Type', 'image/png');
    } else if (url.endsWith('.webp')) {
      response.headers.set('Content-Type', 'image/webp');
    }
  }

  // For tutorial images that are loaded from Unsplash
  if (url.includes('/tutorial') || url.includes('/api/photos')) {
    // Cache for 1 day (86400 seconds) with revalidation
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
  }

  return response;
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Match all static asset routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Match image optimization routes
    '/_next/image',
    // Match API routes for photos
    '/api/photos/:path*',
  ],
}; 