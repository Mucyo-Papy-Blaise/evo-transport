'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { colors } from '@/lib/constants';
import { containerPadding } from '@/lib/constants/layout';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className={`mx-auto max-w-7xl ${containerPadding.default}`}>
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold tracking-wide" style={{ color: colors.hmexDark }}>
              Boking
            </span>
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center space-x-12">
            <Link 
              href="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
              style={{ color: colors.hmexText }}
            >
              Home
            </Link>
            <Link 
              href="#explore" 
              className="text-sm font-medium transition-colors hover:text-primary"
              style={{ color: colors.hmexText }}
            >
              Explore
            </Link>
            <Link 
              href="#popular" 
              className="text-sm font-medium transition-colors hover:text-primary"
              style={{ color: colors.hmexText }}
            >
              Popular
            </Link>
            <Link 
              href="#articles" 
              className="text-sm font-medium transition-colors hover:text-primary"
              style={{ color: colors.hmexText }}
            >
              Articles
            </Link>
          </div>

          {/* Login Button - Right */}
          <Link
            href="/login"
            className="px-5 py-1.5 rounded text-sm font-medium transition-all hover:opacity-90"
            style={{
              backgroundColor: colors.hmexGreen,
              color: 'white',
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </motion.header>
  );
}