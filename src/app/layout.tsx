import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Figart AI - Photography Tutorials and Community',
  description: 'Learn photography composition with AI-powered tutorials and join a community of photographers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-x-hidden flex flex-col`}>
        {/* Dynamic background elements */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {/* Abstract light shapes */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-float-slow"></div>
        </div>
        
        <AuthProvider>
          <Navbar />
          <main className="pt-16 relative z-10 flex-grow">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="relative z-10 mt-auto py-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                  <Link href="/" className="flex items-center">
                    <span className="text-xl font-bold text-white">Figart AI</span>
                  </Link>
                  <p className="mt-2 text-sm text-indigo-200 max-w-md">
                    Helping photographers improve their composition skills with AI-powered analysis and a supportive community.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Features</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/tutorial" className="text-indigo-200 hover:text-white transition-colors">
                          Tutorials
                        </Link>
                      </li>
                      <li>
                        <Link href="/ai" className="text-indigo-200 hover:text-white transition-colors">
                          AI Analysis
                        </Link>
                      </li>
                      <li>
                        <Link href="/community" className="text-indigo-200 hover:text-white transition-colors">
                          Community
                        </Link>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Legal</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/privacy" className="text-indigo-200 hover:text-white transition-colors">
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link href="/terms" className="text-indigo-200 hover:text-white transition-colors">
                          Terms of Service
                        </Link>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Connect</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="https://github.com/Nathancgy/Figart-AI" target="_blank" rel="noopener noreferrer" className="text-indigo-200 hover:text-white transition-colors flex items-center">
                          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                          GitHub
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-indigo-200">
                  © {new Date().getFullYear()} Figart AI. All rights reserved.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="https://github.com/Nathancgy/Figart-AI" target="_blank" rel="noopener noreferrer" className="text-indigo-200 hover:text-white">
                    <span className="sr-only">GitHub</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
        
        {/* Visual journey path */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50 top-20 hidden lg:block"></div>
      </body>
    </html>
  );
} 