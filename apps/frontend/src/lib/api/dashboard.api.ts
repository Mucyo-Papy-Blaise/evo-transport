import { apiClient } from './api-client';
import { DashboardStats, RecentBooking } from '@/types';

export const dashboardApi = {
  // Get dashboard statistics
  getStats: () => apiClient.get<DashboardStats>('/admin/dashboard/stats'),

  // Get recent bookings
  getRecentBookings: (limit: number = 5) => 
    apiClient.get<RecentBooking[]>(`/admin/dashboard/recent?limit=${limit}`),
};