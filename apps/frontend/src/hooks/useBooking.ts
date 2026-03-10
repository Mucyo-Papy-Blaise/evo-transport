'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { ApiError } from '@/lib/query/query-client';
import { toast } from '@/components/ui/toast';
import { CreateBookingRequest, BookingFilterParams } from '@/types/booking.types';
import { bookingApi } from '@/lib/api/booking.api';
import { format } from 'date-fns';

//  Create Booking Hook 

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.createBooking(data),

    onSuccess: (response) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.popular() });

      // Show success toast
      toast.success(
        'Booking Request Received!',
        `Your booking reference is ${response.bookingReference}. We'll confirm it shortly.`
      );
    },

    onError: (error: ApiError) => {
      toast.error(
        'Booking Failed',
        error.message || 'Unable to process your booking. Please try again.'
      );
    },
  });
}

//  Get My Bookings Hook 

export function useMyBookings(params?: BookingFilterParams) {
  return useQuery({
    queryKey: queryKeys.bookings.myBookings(params),
    queryFn: () => bookingApi.getMyBookings(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

//  Get Booking by Reference Hook 
export function useBookingByReference(reference: string) {
  return useQuery({
    queryKey: queryKeys.bookings.reference(reference),
    queryFn: () => bookingApi.getBookingByReference(reference),
    enabled: !!reference,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// ==================== Check Availability Hook ====================

export function useCheckAvailability() {
  return useMutation({
    mutationFn: ({ departureDate, route }: { departureDate: string; route: string }) =>
      bookingApi.checkAvailability(departureDate, route),
  });
}

// ==================== Cancel Booking Hook ====================

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingApi.cancelBooking(id, reason),

    onSuccess: (response) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.myBookings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(response.id) });

      toast.success(
        'Booking Cancelled',
        `Your booking ${response.bookingReference} has been cancelled successfully.`
      );
    },

    onError: (error: ApiError) => {
      toast.error(
        'Cancellation Failed',
        error.message || 'Unable to cancel booking. Please try again.'
      );
    },
  });
}

//  Helper function to map form data to API request 
export function mapFormToBookingRequest(
  formData: {
    tripType: 'oneWay' | 'roundTrip';
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
    passengers: string;
  },
  userInfo?: {
    email?: string;
    name?: string;
    phone?: string;
  }
): CreateBookingRequest {
  const basePrice = 45000; // RWF
  const pricePerPassenger = basePrice * parseInt(formData.passengers);

  return {
    ...(userInfo?.email && { guestEmail: userInfo.email }),
    ...(userInfo?.name && { guestName: userInfo.name }),
    ...(userInfo?.phone && { guestPhone: userInfo.phone }),

    // Booking details
    tripType: formData.tripType === 'oneWay' ? 'ONE_WAY' : 'ROUND_TRIP',
    fromLocation: formData.fromLocation,
    toLocation: formData.toLocation,
    fromCode: formData.fromCode,
    toCode: formData.toCode,
    fromCity: formData.fromCity,
    toCity: formData.toCity,
    departureDate: format(formData.departureDate, 'yyyy-MM-dd'),
    ...(formData.returnDate && { returnDate: format(formData.returnDate, 'yyyy-MM-dd') }),
    departureTime: formData.departureTime,
    ...(formData.returnTime && { returnTime: formData.returnTime }),
    passengers: parseInt(formData.passengers),
    price: pricePerPassenger,
    currency: 'RWF',
  };
}