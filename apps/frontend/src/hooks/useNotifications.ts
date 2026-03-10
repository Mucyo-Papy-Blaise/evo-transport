"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api/notification-api";
import { toast } from "@/components/ui/toast";

export const notificationKeys = {
  all: ["notifications"] as const,
  admin: (params?: any) => ["notifications", "admin", params] as const,
  user: (params?: any) => ["notifications", "user", params] as const,
  unreadCount: () => ["notifications", "unread"] as const,
};

export function useAdminNotifications(params?: {
  limit?: number;
  unreadOnly?: boolean;
}) {
  return useQuery({
    queryKey: notificationKeys.admin(params),
    queryFn: () => notificationApi.getAdminNotifications(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
  });
}
