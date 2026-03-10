export interface Notification {
  id: string;
  bookingId: string | null;
  bookingReference?: string;
  type: string;
  subject: string;
  content: string | null;
  readAt: string | null;
  sentAt: string;
  recipientEmail: string;
  recipientName: string | null;
  recipientType: 'ADMIN' | 'CUSTOMER' | 'GUEST';
  fromLocation?: string;
  toLocation?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationFilter {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
}
