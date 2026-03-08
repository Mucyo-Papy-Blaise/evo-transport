'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { cn } from '@/utils/utils';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      // Auto remove toast after duration
      if (toast.duration !== 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 4000);
      }
    },
    [removeToast]
  );

  // Set up global toast function via callback
  useEffect(() => {
    setGlobalToast(addToast);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          accent: 'bg-green-500',
          icon: 'text-green-600',
          iconComponent: <CheckCircle className="h-5 w-5" />,
        };
      case 'error':
        return {
          accent: 'bg-red-500',
          icon: 'text-red-600',
          iconComponent: <XCircle className="h-5 w-5" />,
        };
      case 'warning':
        return {
          accent: 'bg-yellow-500',
          icon: 'text-yellow-600',
          iconComponent: <AlertCircle className="h-5 w-5" />,
        };
      case 'info':
        return {
          accent: 'bg-blue-500',
          icon: 'text-blue-600',
          iconComponent: <Info className="h-5 w-5" />,
        };
      case 'loading':
        return {
          accent: 'bg-gray-500',
          icon: 'text-gray-600',
          iconComponent: <Loader2 className="h-5 w-5 animate-spin" />,
        };
      default:
        return {
          accent: 'bg-gray-500',
          icon: 'text-gray-600',
          iconComponent: <Info className="h-5 w-5" />,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={cn(
        'relative min-w-[320px] max-w-[420px] bg-white rounded-xl shadow-lg border border-gray-200 p-4 transition-all duration-300 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      {/* Colored accent on bottom right */}
      <div
        className={cn('absolute bottom-0 right-0 w-2 h-2 rounded-tl-lg opacity-20', styles.accent)}
      />

      <div className="flex items-start space-x-3">
        <div className={cn('flex-shrink-0', styles.icon)}>{styles.iconComponent}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
          {toast.description && <p className="text-sm text-gray-600 mt-1">{toast.description}</p>}
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

let globalAddToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function setGlobalToast(fn: (toast: Omit<Toast, 'id'>) => void) {
  globalAddToast = fn;
}

export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    globalAddToast?.({ type: 'success', title, description, duration });
  },
  error: (title: string, description?: string, duration?: number) => {
    globalAddToast?.({ type: 'error', title, description, duration });
  },
  warning: (title: string, description?: string, duration?: number) => {
    globalAddToast?.({ type: 'warning', title, description, duration });
  },
  info: (title: string, description?: string, duration?: number) => {
    globalAddToast?.({ type: 'info', title, description, duration });
  },
  loading: (title: string, description?: string) => {
    globalAddToast?.({ type: 'loading', title, description, duration: 0 });
  },
};
