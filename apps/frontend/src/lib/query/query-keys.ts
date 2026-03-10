import { BookingFilterParams } from "@/types/booking.types";

export const queryKeys = {
  // Auth
  auth: {
    all: () => ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },

  // Bookings
  bookings: {
    all: () => ["bookings"] as const,
    lists: () => ["bookings", "list"] as const,
    list: (params?: BookingFilterParams) => ["bookings", "list", params] as const,
    details: () => ["bookings", "detail"] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
    myBookings: (params?: BookingFilterParams) => ["bookings", "my", params] as const,
    reference: (ref: string) => ["bookings", "reference", ref] as const,
    popular: (limit?: number) => ["bookings", "popular", limit] as const,
    availability: (date: string, route: string) => ["bookings", "availability", date, route] as const,
  },
} as const;
