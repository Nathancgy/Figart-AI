'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <nav className={`fixed w-full top-0 z-20 transition-all duration-300 ${
      scrolled ? 'bg-black/40 backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 relative z-10">
          <span className="font-bold text-xl text-white drop-shadow-md">FigArt AI</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-white hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 py-1.5">
            Home
          </Link>
          <Link href="/tutorial" className="text-white hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 py-1.5">
            Tutorials
          </Link>
          <Link href="/ai" className="text-white hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 py-1.5">
            AI Analysis
          </Link>
          <Link href="/community" className="text-white hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 py-1.5">
            Community
          </Link>
          <Link 
            href="/login" 
            className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center"
          >
            Login
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden focus:outline-none text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/80 backdrop-blur-lg w-full py-6 absolute top-full left-0 right-0 border-t border-white/10 transition-all duration-300">
          <div className="flex flex-col space-y-4 px-6">
            <Link 
              href="/" 
              className="text-white hover:text-indigo-300 transition-colors py-2 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/tutorial" 
              className="text-white hover:text-indigo-300 transition-colors py-2 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Tutorials
            </Link>
            <Link 
              href="/ai" 
              className="text-white hover:text-indigo-300 transition-colors py-2 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              AI Analysis
            </Link>
            <Link 
              href="/community" 
              className="text-white hover:text-indigo-300 transition-colors py-2 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
            <Link 
              href="/login" 
              className="text-white bg-indigo-600 hover:bg-indigo-700 py-1.5 rounded-lg transition-colors text-center mx-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 