"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { ApiError } from "@/lib/query/query-client";
import { toast } from "@/components/ui/toast";
import {
  CreateBookingRequest,
  BookingFilterParams,
} from "@/types/booking.types";
import type { PassengerDetail } from "@/types/passenger.types";
import { bookingApi, LongDistanceRequest } from "@/lib/api/booking.api";
import { format } from "date-fns";

//  Create Booking Hook

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.createBooking(data),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.popular() });

      toast.success(
        "Booking Request Received!",
        `Your booking reference is ${response.bookingReference}. We'll confirm it shortly.`,
      );
    },

    onError: (error: ApiError) => {
      toast.error(
        "Booking Failed",
        error.message || "Unable to process your booking. Please try again.",
      );
    },
  });
}

// Send Long Distance Request Hook (>400 km)

export function useSendLongDistanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LongDistanceRequest) =>
      bookingApi.sendLongDistanceRequest(data),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });

      toast.success(
        "Long Distance Request Sent!",
        `Your request reference is ${response.bookingReference}. Our team will contact you shortly to confirm arrangements.`,
      );
    },

    onError: (error: ApiError) => {
      toast.error(
        "Request Failed",
        error.message ||
          "Unable to send your long distance request. Please try again.",
      );
    },
  });
}

//  Get My Bookings Hook

export function useMyBookings(params?: BookingFilterParams) {
  return useQuery({
    queryKey: queryKeys.bookings.myBookings(params),
    queryFn: () => bookingApi.getMyBookings(params),
    staleTime: 1000 * 60 * 5,
  });
}

//  Get Booking by Reference Hook
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

//  Get Popular Routes Hook
export function usePopularRoutes(limit: number = 6) {
  return useQuery({
    queryKey: queryKeys.bookings.popular(limit),
    queryFn: () => bookingApi.getPopularRoutes(limit),
    staleTime: 1000 * 60 * 30,
  });
}

//  Check Availability Hook
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

// Cancel Booking Hook

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
        `Your booking ${response.bookingReference} has been cancelled successfully.`,
      );
    },

    onError: (error: ApiError) => {
      toast.error(
        "Cancellation Failed",
        error.message || "Unable to cancel booking. Please try again.",
      );
    },
  });
}

// Build passengerDetails array from counts (adults, children, wheelchair, etc.)
export function buildPassengerDetails(params: {
  adults: number;
  children: number;
  infants?: number;
  seniors?: number;
  wheelchairCount?: number;
}): PassengerDetail[] {
  const details: PassengerDetail[] = [];
  let wheelchairRemaining = params.wheelchairCount ?? 0;

  for (let i = 0; i < (params.adults ?? 0); i++) {
    details.push({
      type: "adult",
      age: 30,
      requiresAssistance: wheelchairRemaining > 0,
      ...(wheelchairRemaining > 0 && { assistanceType: "wheelchair" }),
    });
    if (wheelchairRemaining > 0) wheelchairRemaining--;
  }
  for (let i = 0; i < (params.children ?? 0); i++) {
    details.push({
      type: "child",
      age: 8,
      requiresAssistance: wheelchairRemaining > 0,
      ...(wheelchairRemaining > 0 && { assistanceType: "wheelchair" }),
    });
    if (wheelchairRemaining > 0) wheelchairRemaining--;
  }
  for (let i = 0; i < (params.infants ?? 0); i++) {
    details.push({ type: "infant", age: 1, requiresAssistance: false });
  }
  for (let i = 0; i < (params.seniors ?? 0); i++) {
    details.push({
      type: "senior",
      age: 65,
      requiresAssistance: wheelchairRemaining > 0,
      ...(wheelchairRemaining > 0 && { assistanceType: "wheelchair" }),
    });
    if (wheelchairRemaining > 0) wheelchairRemaining--;
  }
  return details;
}

// Map form data to API request (passengerDetails + shuttle times)
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
  },
  userInfo?: {
    email?: string;
    name?: string;
    phone: string;
  },
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
    currency: "RWF",
  };
}

// Map form data to long distance request
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
  userInfo?: {
    email?: string;
    name?: string;
    phone: string;
  },
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
    currency: "RWF",
    distance: formData.distance,
    ...(formData.message && { message: formData.message }),
  };
}
