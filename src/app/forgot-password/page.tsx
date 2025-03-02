'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Show modal when the page loads
  useEffect(() => {
    setShowModal(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This function won't actually do anything since the feature is disabled
    setIsLoading(true);
    
    // Simulate loading for a better UX
    setTimeout(() => {
      setIsLoading(false);
      setShowModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Redirect to login page after closing the modal
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-indigo-950">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-black/40 border border-white/10 animate-fade-in">
            <div className="text-center mb-4">
              <svg 
                className="mx-auto h-12 w-12 text-yellow-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <h3 className="text-xl font-medium text-white mt-2">Feature Not Available</h3>
            </div>
            <p className="text-white/80 mb-6 text-center">
              The password recovery feature is not supported at this time. Please contact an administrator if you need assistance with your account.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleCloseModal}
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              FigArt <span className="text-indigo-400">AI</span>
            </h1>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-black/40 border border-white/10">
          <h2 className="text-xl text-white font-medium mb-6">
            Reset your password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                placeholder="Enter your email address"
                required
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-white/50">
                We'll send a password reset link to this email
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending reset link...
                </div>
              ) : (
                <span>Send reset link</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Return to login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-white/40">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
} 