'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { authApi } from '../api/auth-api';
import { tokenStorage } from '@/lib/api/api-client';
import { queryKeys } from '@/lib/query/query-keys';
import { ApiError } from '@/lib/query/query-client';
import type { AuthUser, LoginPayload, RegisterPayload, UpdateProfilePayload } from '@/types';
import { toast } from '@/components/ui/toast';

/**
 * Token presence is read only after mount so the first server and client renders match
 * (avoids hydration mismatches when a token exists in localStorage).
 */
function useHasToken(): boolean {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(tokenStorage.get() !== null);
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'lms_token') {
        setHasToken(e.newValue !== null);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return hasToken;
}

//  useCurrentUser
export function useCurrentUser() {
  const hasToken = useHasToken();

  const query = useQuery<AuthUser, ApiError>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.me(),
    enabled: hasToken,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    retry: (count, error) => {
      if (error.status === 401) return false;
      return count < 2;
    },
  });

  return {
    ...query,
    isLoading: hasToken && query.isLoading,
  };
}

//  useLogin
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),

    onSuccess: ({ accessToken, user }) => {
      tokenStorage.set(accessToken);
      queryClient.setQueryData<AuthUser>(queryKeys.auth.me(), user);
      toast.success('Welcome back!', `Logged in as ${user.fullName || user.email}`);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ accessToken, user }) => {
      tokenStorage.set(accessToken);
      queryClient.setQueryData<AuthUser>(queryKeys.auth.me(), user);
      toast.success('Account created', `Welcome, ${user.fullName || user.email}`);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (res) => {
      queryClient.setQueryData<AuthUser>(queryKeys.auth.me(), res.user);
      toast.success('Profile saved', res.message);
    },
    onError: (error: ApiError) => {
      toast.error('Could not save profile', error.message || 'Please try again.');
    },
  });
}

//  useLogout
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout().catch(() => undefined),

    onSuccess: () => {
      toast.info('Logged out', 'You have been signed out successfully.');
    },

    onError: () => {
      toast.warning('Logged out', 'Session ended, but server sign-out failed.');
    },

    onSettled: () => {
      tokenStorage.remove();
      queryClient.clear();
    },
  });
}
