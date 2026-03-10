import { apiClient } from "./api-client";
import {
  NotificationListResponse,
  UnreadCountResponse,
  NotificationFilter,
} from "@/types/notification.types";

export const notificationApi = {
  getAdminNotifications: (params?: NotificationFilter) => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.unreadOnly)
        queryParams.append("unreadOnly", params.unreadOnly.toString());
      if (params.type) queryParams.append("type", params.type);
    }
    const url = queryParams.toString()
      ? `/notifications/admin?${queryParams.toString()}`
      : "/notifications/admin";
    return apiClient.get<NotificationListResponse>(url);
  },

  // User endpoints
  getUserNotifications: (params?: NotificationFilter) => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.unreadOnly)
        queryParams.append("unreadOnly", params.unreadOnly.toString());
      if (params.type) queryParams.append("type", params.type);
    }
    const url = queryParams.toString()
      ? `/notifications/user?${queryParams.toString()}`
      : "/notifications/user";
    return apiClient.get<NotificationListResponse>(url);
  },

  // Common endpoints
  getUnreadCount: () =>
    apiClient.get<UnreadCountResponse>("/notifications/unread-count"),

  getNotificationById: (id: string) =>
    apiClient.get<Notification>(`/notifications/${id}`),

  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),

  markAllAsRead: () => apiClient.patch("/notifications/mark-all-read", {}),

  markAsUnread: (id: string) =>
    apiClient.patch(`/notifications/${id}/unread`, {}),
};
