"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { ApiError } from "@/lib/query/query-client";
import { toast } from "@/components/ui/toast";
import {
  CreateBookingRequest,
  BookingFilterParams,
  SendMessageRequest,
  GuestReplyRequest,
} from "@/types/booking.types";
import type { PassengerDetail } from "@/types/passenger.types";
import { bookingApi, LongDistanceRequest } from "@/lib/api/booking.api";
import { format } from "date-fns";

//  Create Booking 
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.popular() });
    },
    onError: (error: ApiError) => {
      toast.error(
        "Booking Failed",
        error.message || "Unable to process your booking.",
      );
    },
  });
}

// ─── Long Distance Request ────────────────────────────────────────────────────

export function useSendLongDistanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LongDistanceRequest) =>
      bookingApi.sendLongDistanceRequest(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      // Backend returns `requestId` (REQ-YYYYMMDD-XXXXX), not `bookingReference`
      toast.success(
        "Long Distance Request Sent!",
        `Reference: ${response.requestId}. Our team will contact you shortly.`,
      );
    },
    onError: (error: ApiError) => {
      toast.error(
        "Request Failed",
        error.message || "Unable to send your request.",
      );
    },
  });
}

// ─── My Bookings ──────────────────────────────────────────────────────────────

export function useMyBookings(params?: BookingFilterParams) {
  return useQuery({
    queryKey: queryKeys.bookings.myBookings(params),
    queryFn: () => bookingApi.getMyBookings(params),
    staleTime: 1000 * 60 * 5,
  });
}

/** Single booking for the logged-in customer (dashboard detail page). */
export function usePassengerBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.myPassengerDetail(id),
    queryFn: () => bookingApi.getMyBookingById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: (count, error: ApiError) => {
      if (error.status === 404 || error.status === 403) return false;
      return count < 2;
    },
  });
}

// ─── Booking by Reference ─────────────────────────────────────────────────────

export function useBookingByReference(reference: string) {
  return useQuery({
    queryKey: queryKeys.bookings.reference(reference),
    queryFn: () => bookingApi.getBookingByReference(reference),
    enabled: !!reference,
    staleTime: 1000 * 60 * 5,
    retry: (count, error: ApiError) => {
      if (error.status === 404) return false;
      return count < 2;
    },
  });
}

// ─── Popular Routes ───────────────────────────────────────────────────────────

export function usePopularRoutes(limit = 6) {
  return useQuery({
    queryKey: queryKeys.bookings.popular(limit),
    queryFn: () => bookingApi.getPopularRoutes(limit),
    staleTime: 1000 * 60 * 30,
  });
}

// ─── Check Availability ───────────────────────────────────────────────────────

export function useCheckAvailability() {
  return useMutation({
    mutationFn: ({
      departureDate,
      route,
    }: {
      departureDate: string;
      route: string;
    }) => bookingApi.checkAvailability(departureDate, route),
  });
}

// ─── Cancel Booking ───────────────────────────────────────────────────────────

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingApi.cancelBooking(id, reason),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.myBookings(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(response.id),
      });
      toast.success(
        "Booking Cancelled",
        `Booking ${response.bookingReference} has been cancelled.`,
      );
    },
    onError: (error: ApiError) => {
      toast.error(
        "Cancellation Failed",
        error.message || "Unable to cancel booking.",
      );
    },
  });
}

export function useRequestRebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      note,
    }: {
      bookingId: string;
      note?: string;
    }) => bookingApi.requestRebook(bookingId, note ? { note } : undefined),
    onSuccess: (response, { bookingId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.myPassengerDetail(bookingId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.myBookings(),
      });
      toast.success(
        response.message || "Request sent",
        "Our team will get back to you shortly.",
      );
    },
    onError: (error: ApiError) => {
      toast.error(
        "Request failed",
        error.message || "Could not send re-booking request.",
      );
    },
  });
}

// ─── Booking Messages (Chat) ──────────────────────────────────────────────────

/** Fetch the full message thread for a booking */
export function useBookingMessages(bookingId: string) {
  return useQuery({
    queryKey: ["bookings", bookingId, "messages"],
    queryFn: () => bookingApi.getBookingMessages(bookingId),
    enabled: !!bookingId,
    staleTime: 1000 * 30, // re-fetch after 30s (near-realtime feel)
    refetchInterval: 1000 * 30, // poll every 30s when window is focused
  });
}

/** Registered customer sends a message from their dashboard */
export function useSendCustomerMessage(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      bookingApi.sendCustomerMessage(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings", bookingId, "messages"],
      });
    },
    onError: (error: ApiError) => {
      toast.error("Send Failed", error.message || "Could not send message.");
    },
  });
}

/**
 * Guest replies via the one-time token from their email.
 * Used on the public /booking/reply?token=xxx page.
 */
export function useGuestReply() {
  return useMutation({
    mutationFn: (data: GuestReplyRequest) => bookingApi.sendGuestReply(data),
    onSuccess: () => {
      toast.success("Reply Sent", "Your message has been sent successfully.");
    },
    onError: (error: ApiError) => {
      toast.error(
        "Reply Failed",
        error.message ||
          "Invalid or expired reply link. Please contact support.",
      );
    },
  });
}

/** Mark messages as read when the user opens the thread */
export function useMarkMessagesRead(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (as: "ADMIN" | "CUSTOMER" | "GUEST" = "CUSTOMER") =>
      bookingApi.markMessagesRead(bookingId, as),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings", bookingId, "messages"],
      });
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build passengerDetails array from simple counts */
export function buildPassengerDetails(params: {
  adults: number;
  children: number;
  infants?: number;
  seniors?: number;
  wheelchairCount?: number;
}): PassengerDetail[] {
  const details: PassengerDetail[] = [];
  let wheelchairLeft = params.wheelchairCount ?? 0;

  const push = (type: PassengerDetail["type"], count: number) => {
    for (let i = 0; i < count; i++) {
      details.push({
        type,
        requiresAssistance: wheelchairLeft > 0,
        ...(wheelchairLeft > 0 && { assistanceType: "wheelchair" as const }),
      });
      if (wheelchairLeft > 0) wheelchairLeft--;
    }
  };

  push("adult", params.adults ?? 0);
  push("child", params.children ?? 0);
  push("infant", params.infants ?? 0);
  push("senior", params.seniors ?? 0);

  return details;
}

/** Map booking form state to API request shape */
export function mapFormToBookingRequest(
  formData: {
    tripType: "oneWay" | "roundTrip";
    fromLocation: string;
    toLocation: string;
    fromCode: string;
    toCode: string;
    fromCity: string;
    toCity: string;
    departureDate: Date;
    returnDate?: Date;
    departureTime: string;
    returnTime?: string;
    passengerDetails: PassengerDetail[];
    price: number;
    distance?: string;
  },
  userInfo?: { email?: string; name?: string; phone: string },
): CreateBookingRequest {
  return {
    ...(userInfo?.email && { guestEmail: userInfo.email }),
    ...(userInfo?.name && { guestName: userInfo.name }),
    guestPhone: userInfo?.phone ?? "",
    tripType: formData.tripType === "oneWay" ? "ONE_WAY" : "ROUND_TRIP",
    fromLocation: formData.fromLocation,
    toLocation: formData.toLocation,
    fromCode: formData.fromCode,
    toCode: formData.toCode,
    fromCity: formData.fromCity,
    toCity: formData.toCity,
    departureDate: format(formData.departureDate, "yyyy-MM-dd"),
    ...(formData.returnDate && {
      returnDate: format(formData.returnDate, "yyyy-MM-dd"),
    }),
    departureTime: formData.departureTime,
    ...(formData.returnTime && { returnTime: formData.returnTime }),
    passengerDetails: formData.passengerDetails,
    price: formData.price,
    currency: "EUR",
    ...(formData.distance && { distance: formData.distance }),
  };
}

/** Map form state to long distance request shape */
export function mapFormToLongDistanceRequest(
  formData: {
    tripType: "oneWay" | "roundTrip";
    fromLocation: string;
    toLocation: string;
    fromCode: string;
    toCode: string;
    fromCity: string;
    toCity: string;
    departureDate: Date;
    returnDate?: Date;
    departureTime: string;
    returnTime?: string;
    passengerDetails: PassengerDetail[];
    price: number;
    distance: number;
    message?: string;
  },
  userInfo?: { email?: string; name?: string; phone: string },
): LongDistanceRequest {
  return {
    ...(userInfo?.email && { guestEmail: userInfo.email }),
    ...(userInfo?.name && { guestName: userInfo.name }),
    guestPhone: userInfo?.phone ?? "",
    tripType: formData.tripType === "oneWay" ? "ONE_WAY" : "ROUND_TRIP",
    fromLocation: formData.fromLocation,
    toLocation: formData.toLocation,
    fromCode: formData.fromCode,
    toCode: formData.toCode,
    fromCity: formData.fromCity,
    toCity: formData.toCity,
    departureDate: format(formData.departureDate, "yyyy-MM-dd"),
    ...(formData.returnDate && {
      returnDate: format(formData.returnDate, "yyyy-MM-dd"),
    }),
    departureTime: formData.departureTime,
    ...(formData.returnTime && { returnTime: formData.returnTime }),
    passengerDetails: formData.passengerDetails,
    price: formData.price,
    currency: "EUR",
    distance: formData.distance,
    ...(formData.message && { message: formData.message }),
  };
}
