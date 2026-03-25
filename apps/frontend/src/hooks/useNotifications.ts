"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { notificationsApi } from "@/lib/api/notifications-api";
import { ApiError } from "@/lib/query/query-client";
import { toast } from "@/components/ui/toast";

// ─── Passenger (dashboard) ───────────────────────────────────────────────────

export function useUserNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.notifications.userList(page),
    queryFn: () => notificationsApi.listUser({ page, limit }),
    staleTime: 1000 * 30,
  });
}

/** Unread count for the current user (admin or passenger, based on JWT). */
export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });
}

/** @deprecated use useUnreadCount */
export const useUnreadNotificationCount = useUnreadCount;

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
    onError: (e: ApiError) => {
      toast.error("Update failed", e.message);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      toast.success("Done", "All notifications marked as read.");
    },
    onError: (e: ApiError) => {
      toast.error("Update failed", e.message);
    },
  });
}

/** Admin popover — aliases for existing component names */
export const useMarkAsRead = useMarkNotificationRead;
export const useMarkAllAsRead = useMarkAllNotificationsRead;

export function useAdminNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
}) {
  return useQuery({
    queryKey: ["notifications", "admin", params] as const,
    queryFn: () => notificationsApi.listAdmin(params),
    staleTime: 1000 * 30,
  });
}
