'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

export default function AuthErrorHandler({ children }: AuthErrorHandlerProps) {
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for session expired events
    const handleSessionExpired = (event: CustomEvent) => {
      const message = event.detail?.message || 'Your session has expired. Please log in again.';
      
      // Show notification
      setNotification({
        message,
        type: 'error'
      });
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };

    // Add event listener
    window.addEventListener('auth:sessionExpired', handleSessionExpired as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired as EventListener);
    };
  }, [router]);

  return (
    <>
      {children}
      
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in">
          <div className={`rounded-lg shadow-lg p-4 ${
            notification.type === 'error' 
              ? 'bg-red-600 text-white' 
              : 'bg-amber-500 text-white'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'error' ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotification(null)}
                  className="inline-flex text-white hover:text-gray-200 focus:outline-none"
                  aria-label="Close notification"
                  title="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 