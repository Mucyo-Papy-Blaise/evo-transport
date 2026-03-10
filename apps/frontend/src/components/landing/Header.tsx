'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { containerPadding } from '@/lib/constants/layout';
import { cn } from '@/utils/utils';
import { Menu, X } from 'lucide-react';
import { UserDropdown } from './UserDropdown';
import { useAuth } from '@/lib/auth/auth-context';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '#explore', label: 'Explore' },
    { href: '#popular', label: 'Popular' },
    { href: '#articles', label: 'Articles' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg py-3 border-b border-gray-200/50' 
          : 'bg-transparent py-5'
      )}
    >
      <div className={`mx-auto max-w-7xl ${containerPadding.default}`}>
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link href="/" className="relative group">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className={cn(
                'text-2xl font-bold tracking-tight transition-colors duration-300',
                scrolled ? 'text-gray-900' : 'text-white'
              )}
            >
              Boking
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </motion.span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 group',
                  scrolled 
                    ? 'text-gray-700 hover:text-primary' 
                    : 'text-white/90 hover:text-white'
                )}
              >
                {link.label}
                <span className={cn(
                  'absolute inset-x-4 bottom-1 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300',
                  scrolled ? 'bg-primary' : 'bg-white'
                )} />
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserDropdown scrolled={scrolled} />
            ) : (
              <Link
                href="/login"
                className={cn(
                  'px-5 py-2 rounded text-sm font-medium transition-all duration-300 hover:shadow-lg',
                  scrolled
                    ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-primary/25'
                    : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                )}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'md:hidden p-2 rounded transition-colors duration-300',
              scrolled 
                ? 'text-gray-900 hover:bg-gray-100' 
                : 'text-white hover:bg-white/10'
            )}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300',
                      scrolled
                        ? 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                        : 'text-white hover:bg-white/10'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 mt-2 border-t border-gray-200/20">
                  {user ? (
                    <div className="space-y-2">
                      <div className="px-4 py-2">
                        <p className={cn(
                          'text-sm font-medium',
                          scrolled ? 'text-gray-900' : 'text-white'
                        )}>
                          {user.fullName || user.email}
                        </p>
                        <p className={cn(
                          'text-xs mt-1',
                          scrolled ? 'text-gray-500' : 'text-white/60'
                        )}>
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300',
                          scrolled
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-white hover:bg-white/10'
                        )}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300',
                          scrolled
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-white hover:bg-white/10'
                        )}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          // Handle logout
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          'block w-full text-left px-4 py-3 text-base font-medium rounded-lg transition-all duration-300',
                          scrolled
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-red-400 hover:bg-white/10'
                        )}
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-3 text-base font-medium rounded text-center transition-all duration-300',
                        scrolled
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                      )}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}