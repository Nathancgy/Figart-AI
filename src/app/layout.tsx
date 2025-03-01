import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

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
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-x-hidden`}>
        {/* Dynamic background elements */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {/* Abstract light shapes */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-float-slow"></div>
        </div>
        
        <Navbar />
        <main className="pt-16 relative z-10">
          {children}
        </main>
        
        {/* Visual journey path */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50 top-20 hidden lg:block"></div>
      </body>
    </html>
  );
} 