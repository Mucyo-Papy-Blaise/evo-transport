'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard.api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  recent: (limit?: number) => [...dashboardKeys.all, 'recent', limit] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRecentBookings(limit: number = 5) {
  return useQuery({
    queryKey: dashboardKeys.recent(limit),
    queryFn: () => dashboardApi.getRecentBookings(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}