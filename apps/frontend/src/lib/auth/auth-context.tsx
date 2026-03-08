'use client';

import React, { createContext, useContext } from 'react';
import { useCurrentUser, useLogin, useLogout } from '@/lib/auth/auth-queries';
import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import type { AuthUser, LoginPayload, LoginResponse } from '@/lib/types/auth';

interface AuthContextValue {
  user:    AuthUser | null;
  loading: boolean;
  login:   UseMutateAsyncFunction<LoginResponse, Error, LoginPayload>;
  logout:  () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

//  Provider 
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user = null, isLoading } = useCurrentUser();
  const loginMutation  = useLogin();
  const logoutMutation = useLogout();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading,
        login:   loginMutation.mutateAsync,
        logout:  () => logoutMutation.mutate(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

//  Hook 
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}