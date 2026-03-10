export interface NotificationResponse {
  id: string;
  bookingId: string | null;
  bookingReference?: string;
  type: string;
  subject: string;
  content: string | null;
  readAt: Date | null;
  sentAt: Date;
  recipientEmail: string;
  recipientName: string | null;
  recipientType: 'ADMIN' | 'CUSTOMER' | 'GUEST';
  fromLocation?: string;
  toLocation?: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationFilterDto {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
}