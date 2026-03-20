import { BookingStatus, Currency, TripType } from '@prisma/client';
import { UserType } from './enum';
import type { PassengerDetail } from './passenger.types';

// ─── Request Types ────────────────────────────────────────────────────────────

export interface CreateBookingRequest {
  guestEmail?: string;
  guestName?: string;
  guestPhone: string;
  tripType: TripType;
  fromLocation: string;
  toLocation: string;
  fromCode?: string;
  toCode?: string;
  fromCity?: string;
  toCity?: string;
  departureDate: string;
  returnDate?: string;
  departureTime: string;
  returnTime?: string;
  passengerDetails: PassengerDetail[];
  price: number;
  currency?: Currency;
  distance?: string;
}

export interface BookingFilterParams {
  status?: BookingStatus;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'departureDate' | 'price';
  sortOrder?: 'asc' | 'desc';
}

// ─── Booking Messages (chat thread) ──────────────────────────────────────────

export type MessageSenderType = 'ADMIN' | 'CUSTOMER' | 'GUEST';

export interface BookingMessage {
  id: string;
  bookingId: string;
  senderType: MessageSenderType;
  senderId: string | null;
  senderName: string | null;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

export interface SendMessageRequest {
  content: string;
}

// Used by guests replying via the one-time link in their email
export interface GuestReplyRequest {
  replyToken: string;
  content: string;
  senderName?: string;
}

// ─── Core Booking Type ────────────────────────────────────────────────────────

export interface BookingUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt?: string;
}

export interface Booking {
  id: string;
  bookingReference: string;

  // User info
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  guestPhone: string | null;
  userType: UserType;

  // Booking details
  tripType: TripType;
  fromLocation: string;
  toLocation: string;
  fromCode: string | null;
  toCode: string | null;
  fromCity: string | null;
  toCity: string | null;
  distance: string | null; // km stored as string
  requestMessage: string | null; // customer's message for long-distance requests

  departureDate: string;
  returnDate: string | null;
  departureTime: string;
  returnTime: string | null;

  passengers: number;
  passengerDetails?: PassengerDetail[];
  passengerSummary?: {
    adultCount: number;
    childCount: number;
    infantCount: number;
    seniorCount: number;
    requiresAssistanceCount: number;
  };

  // Pricing
  price: number;
  currency: Currency;

  // Status
  status: BookingStatus;
  statusReason: string | null; // reason shown to customer when status changes
  adminNotes: string | null;
  adminRespondedAt: string | null;
  adminRespondedBy: string | null;

  // Timestamps
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  rejectedAt: string | null;

  // Relations
  user?: BookingUser | null;
}

export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MessageResponse {
  message: string;
}

export interface PopularRoute {
  fromLocation: string;
  toLocation: string;
  fromCode: string | null;
  toCode: string | null;
  fromCity: string | null;
  toCity: string | null;
  bookingCount: number;
}

export interface AvailabilityResponse {
  available: boolean;
  remainingSpots: number;
  totalBookings: number;
  date: string;
}
