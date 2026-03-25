import { apiClient } from "@/lib/api/api-client";

export interface UserNotification {
  id: string;
  bookingId: string | null;
  bookingReference?: string;
  fromLocation?: string;
  toLocation?: string;
  type: string;
  subject: string;
  content: string | null;
  readAt: string | null;
  sentAt: string;
  recipientEmail: string;
  recipientName: string | null;
  recipientType: string;
}

export interface NotificationListResult {
  notifications: UserNotification[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const notificationsApi = {
  listAdmin: (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.unreadOnly === true) q.set("unreadOnly", "true");
    if (params?.type) q.set("type", params.type);
    const qs = q.toString();
    return apiClient.get<NotificationListResult>(
      qs ? `/notifications/admin?${qs}` : "/notifications/admin",
    );
  },

  listUser: (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.unreadOnly === true) q.set("unreadOnly", "true");
    if (params?.type) q.set("type", params.type);
    const qs = q.toString();
    return apiClient.get<NotificationListResult>(
      qs ? `/notifications/user?${qs}` : "/notifications/user",
    );
  },

  getUnreadCount: () =>
    apiClient.get<{ count: number }>("/notifications/unread-count"),

  markRead: (id: string) =>
    apiClient.patch<{ success?: boolean }>(`/notifications/${id}/read`, {}),

  markAllRead: () =>
    apiClient.patch<{ success?: boolean }>("/notifications/mark-all-read", {}),
};
