'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, signup } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { setUsername } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      // Validate passwords match for signup
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      // Validate password strength
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await signup(username, password);
      }
      // Store username and update context
      localStorage.setItem('username', username);
      setUsername(username);
      // Redirect to home page after successful login/signup
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-indigo-950">
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
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>

          {error && (
            <div className="mb-6 text-sm text-red-400 bg-red-950/50 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-1.5">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                placeholder={isLogin ? "Enter your password" : "Create a password"}
                required
                disabled={isLoading}
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-white/50">
                  Must be at least 8 characters long
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

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
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                <span>{isLogin ? 'Sign in' : 'Create account'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleModeSwitch}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              disabled={isLoading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
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