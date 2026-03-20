"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api/booking.api";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/query/query-client";
import type { SendMessageRequest } from "@/types/booking.types";

/** Fetch all messages for a booking — polls every 30s */
export function useBookingMessages(bookingId: string) {
  return useQuery({
    queryKey: ["bookings", bookingId, "messages"],
    queryFn: () => bookingApi.getBookingMessages(bookingId),
    enabled: !!bookingId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}

/** Admin sends a message to the customer */
export function useSendAdminMessage(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      bookingApi.sendAdminMessage(bookingId, data),
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

/** Mark messages as read when admin opens the thread */
export function useMarkAdminMessagesRead(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bookingApi.markMessagesRead(bookingId, "ADMIN"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings", bookingId, "messages"],
      });
    },
  });
}