'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  BookOpen, 
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/utils/utils';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from '@/components/ui/toast';

interface UserDropdownProps {
  scrolled: boolean;
}

export function UserDropdown({ scrolled }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      logout();
      router.push('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  if (!user) return null;

  const userInitials = user.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  const displayName = user.fullName || user.email.split('@')[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 group',
          scrolled
            ? 'bg-gray-100 hover:bg-gray-200'
            : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20'
        )}
      >
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
          scrolled
            ? 'bg-primary text-white'
            : 'bg-white/20 text-white'
        )}>
          {userInitials}
        </div>
        <div className="hidden lg:block text-left">
          <p className={cn(
            'text-xs font-medium',
            scrolled ? 'text-gray-700' : 'text-white/90'
          )}>
            {displayName}
          </p>
          <p className={cn(
            'text-[10px]',
            scrolled ? 'text-gray-500' : 'text-white/60'
          )}>
            {user.email}
          </p>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform duration-200',
          isOpen && 'rotate-180',
          scrolled ? 'text-gray-500' : 'text-white/70'
        )} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute right-0 top-12 w-64 rounded-xl shadow-xl overflow-hidden z-50',
              scrolled
                ? 'bg-white border border-gray-200'
                : 'bg-gray-900/95 backdrop-blur-xl border border-white/10'
            )}
          >
            {/* User Info - Mobile Only */}
            <div className="lg:hidden p-4 border-b border-white/10">
              <p className={cn(
                'text-sm font-medium',
                scrolled ? 'text-gray-900' : 'text-white'
              )}>
                {displayName}
              </p>
              <p className={cn(
                'text-xs mt-1',
                scrolled ? 'text-gray-500' : 'text-white/60'
              )}>
                {user.email}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  scrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/10'
                )}
              >
                <BookOpen className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {/* <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  scrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/10'
                )}
              >
                <Settings className="w-4 h-4" />
                <span>Profile Settings</span>
              </Link> */}

              {/* <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  scrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/10'
                )}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </Link> */}

              <div className={cn(
                'my-2 h-px',
                scrolled ? 'bg-gray-200' : 'bg-white/10'
              )} />

              <button
                onClick={handleLogout}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm w-full text-left transition-colors',
                  scrolled
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-red-400 hover:bg-white/10'
                )}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}