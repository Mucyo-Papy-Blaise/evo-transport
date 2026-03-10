import { apiClient } from "@/lib/api/api-client";
import {
  CreateBookingRequest,
  Booking,
  BookingListResponse,
  MessageResponse,
  PopularRoute,
  AvailabilityResponse,
  BookingFilterParams,
} from "@/types/booking.types";

export const bookingApi = {
  // Create a new booking
  createBooking: (data: CreateBookingRequest) =>
    apiClient.post<Booking>("/bookings", data),

  // Get all bookings
  getAllBookings: (params?: BookingFilterParams & { status?: string }) => {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.status) {
        queryParams.append("status", params.status);
      }

      // Handle other params
      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);
      if (params.search) queryParams.append("search", params.search);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    }

    const url = queryParams.toString()
      ? `/bookings?${queryParams.toString()}`
      : "/bookings";
    return apiClient.get<BookingListResponse>(url);
  },

  // Get current user's bookings
  getMyBookings: (params?: BookingFilterParams) => {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    const url = queryString
      ? `/bookings/my-bookings?${queryString}`
      : "/bookings/my-bookings";
    return apiClient.get<BookingListResponse>(url);
  },

  // Get booking by reference
  getBookingByReference: (reference: string) =>
    apiClient.get<Booking>(`/bookings/reference/${reference}`),

  // Get booking by ID
  getBookingById: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),

  // Get popular routes
  getPopularRoutes: (limit: number = 6) =>
    apiClient.get<PopularRoute[]>(`/bookings/popular-routes?limit=${limit}`),

  // Check availability
  checkAvailability: (departureDate: string, route: string) =>
    apiClient.get<AvailabilityResponse>(
      `/bookings/check-availability?departureDate=${departureDate}&route=${encodeURIComponent(route)}`,
    ),

  // Update booking status
  updateBookingStatus: (id: string, status: string, reason?: string) =>
    apiClient.patch<Booking>(`/bookings/${id}/status`, { status, reason }),

  // Admin respond to booking
  adminRespond: (id: string, message: string, sendEmail: boolean = true) =>
    apiClient.post<MessageResponse>(`/bookings/${id}/respond`, {
      message,
      sendEmail,
    }),

  // Cancel booking
  cancelBooking: (id: string, reason?: string) =>
    apiClient.post<Booking>(`/bookings/${id}/cancel`, { reason }),
};
