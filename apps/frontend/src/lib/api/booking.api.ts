import { apiClient } from "@/lib/api/api-client";
import {
  CreateBookingRequest,
  Booking,
  BookingListResponse,
  BookingMessage,
  SendMessageRequest,
  GuestReplyRequest,
  MessageResponse,
  PopularRoute,
  AvailabilityResponse,
  BookingFilterParams,
} from "@/types/booking.types";

// ─── Long Distance ─────────────────────────────────────────────────────────────

export interface LongDistanceRequest {
  guestEmail?: string;
  guestName?: string;
  guestPhone: string;
  fromLocation: string;
  toLocation: string;
  fromCode?: string;
  toCode?: string;
  fromCity?: string;
  toCity?: string;
  tripType: "ONE_WAY" | "ROUND_TRIP";
  departureDate: string;
  returnDate?: string;
  departureTime: string;
  returnTime?: string;
  passengerDetails: Array<{
    type: string;
    age: number;
    requiresAssistance: boolean;
    assistanceType?: string;
  }>;
  price: number;
  currency?: string;
  distance: number;
  message?: string;
}

export interface LongDistanceResponse {
  message: string;
  requestId: string;
  bookingReference: string;
  bookingId: string;
  createdAt: string;
}

// ─── Booking API ──────────────────────────────────────────────────────────────

export const bookingApi = {
  // ── Bookings CRUD ────────────────────────────────────────────────────────

  createBooking: (data: CreateBookingRequest) =>
    apiClient.post<Booking>("/bookings", data),

  getAllBookings: (params?: BookingFilterParams & { status?: string }) => {
    const q = new URLSearchParams();
    if (params) {
      if (params.status) q.append("status", params.status);
      if (params.fromDate) q.append("fromDate", params.fromDate);
      if (params.toDate) q.append("toDate", params.toDate);
      if (params.search) q.append("search", params.search);
      if (params.page) q.append("page", params.page.toString());
      if (params.limit) q.append("limit", params.limit.toString());
      if (params.sortBy) q.append("sortBy", params.sortBy);
      if (params.sortOrder) q.append("sortOrder", params.sortOrder);
    }
    const url = q.toString() ? `/bookings?${q}` : "/bookings";
    return apiClient.get<BookingListResponse>(url);
  },

  getMyBookings: (params?: BookingFilterParams) => {
    const q = params ? new URLSearchParams(params as any).toString() : "";
    return apiClient.get<BookingListResponse>(
      q ? `/bookings/my-bookings?${q}` : "/bookings/my-bookings",
    );
  },

  getBookingByReference: (reference: string) =>
    apiClient.get<Booking>(`/bookings/reference/${reference}`),

  getBookingById: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),

  // Reason is now required — shown to the customer
  updateBookingStatus: (id: string, status: string, reason: string) =>
    apiClient.patch<Booking>(`/bookings/${id}/status`, { status, reason }),

  // PATCH (not POST) — matches new controller
  cancelBooking: (id: string, reason?: string) =>
    apiClient.patch<Booking>(`/bookings/${id}/cancel`, { reason }),

  sendLongDistanceRequest: (data: LongDistanceRequest) =>
    apiClient.post<LongDistanceResponse>("/bookings/long-distance", data),

  // Legacy: kept for backwards compat — use sendAdminMessage instead
  adminRespond: (id: string, message: string, sendEmail = true) =>
    apiClient.post<MessageResponse>(`/bookings/${id}/respond`, {
      message,
      sendEmail,
    }),

  // ── Booking messages (chat) ───────────────────────────────────────────────

  // Get full message thread for a booking
  getBookingMessages: (bookingId: string) =>
    apiClient.get<BookingMessage[]>(`/bookings/${bookingId}/messages`),

  // Admin sends a message to the customer
  sendAdminMessage: (bookingId: string, data: SendMessageRequest) =>
    apiClient.post<BookingMessage>(`/bookings/${bookingId}/messages`, data),

  // Registered customer replies from their dashboard
  sendCustomerMessage: (bookingId: string, data: SendMessageRequest) =>
    apiClient.post<BookingMessage>(
      `/bookings/${bookingId}/messages/customer`,
      data,
    ),

  // Guest replies using the one-time token from their email
  sendGuestReply: (data: GuestReplyRequest) =>
    apiClient.post<BookingMessage>(`/bookings/messages/guest-reply`, data),

  // Mark messages as read
  markMessagesRead: (
    bookingId: string,
    as: "ADMIN" | "CUSTOMER" | "GUEST" = "CUSTOMER",
  ) => apiClient.patch(`/bookings/${bookingId}/messages/read?as=${as}`, {}),

  // ── Other ─────────────────────────────────────────────────────────────────

  getPopularRoutes: (limit = 6) =>
    apiClient.get<PopularRoute[]>(`/bookings/popular-routes?limit=${limit}`),

  checkAvailability: (departureDate: string, route: string) =>
    apiClient.get<AvailabilityResponse>(
      `/bookings/check-availability?departureDate=${departureDate}&route=${encodeURIComponent(route)}`,
    ),

  sendGuestMessage: (
    bookingId: string,
    data: { bookingReference: string; content: string; senderName?: string },
  ) =>
    apiClient.post<BookingMessage>(
      `/bookings/${bookingId}/messages/guest`,
      data,
    ),
};
