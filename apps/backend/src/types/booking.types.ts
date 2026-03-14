import { BookingStatus, TripType, Currency } from '@prisma/client';
import { PassengerDetail } from './passenger.types';

export interface CreateBookingDto {
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;

  // Booking details
  tripType: TripType;
  fromLocation: string;
  toLocation: string;
  fromCode?: string;
  toCode?: string;
  fromCity?: string;
  toCity?: string;
  departureDate: Date;
  returnDate?: Date;
  departureTime: string;
  returnTime?: string;
  passengers: number;
  price: number;
  currency?: Currency;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
  reason?: string;
}

export interface AdminRespondDto {
  message: string;
  sendEmail?: boolean;
}

export interface BookingResponse {
  id: string;
  bookingReference: string;

  // User info
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  guestPhone: string | null;
  userType: 'REGISTERED' | 'GUEST';

  // Booking details
  tripType: TripType;
  fromLocation: string;
  toLocation: string;
  fromCode: string | null;
  toCode: string | null;
  fromCity: string | null;
  message: string | null;
  toCity: string | null;
  departureDate: Date;
  returnDate: Date | null;
  departureTime: string;
  returnTime: string | null;

  // Passenger Information
  passengers: number; // Total count
  passengerDetails: PassengerDetail[]; // Detailed passenger info

  // Pricing
  price: number;
  currency: Currency;

  // Status
  status: BookingStatus;
  adminNotes: string | null;
  adminRespondedAt: Date | null;
  adminRespondedBy: string | null;

  // Timestamps
  createdAt: Date;
  confirmedAt: Date | null;
  cancelledAt: Date | null;

  // User object if registered
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;

  // Computed fields
  passengerSummary?: {
    adultCount: number;
    childCount: number;
    infantCount: number;
    seniorCount: number;
    requiresAssistanceCount: number;
  };
}

export interface BookingListResponse {
  bookings: BookingResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MessageResponse {
  message: string;
}

export interface BookingNotificationResponse {
  bookingId: string;
  customerNotified: boolean;
  adminNotified: boolean;
}

export interface BookingFilter {
  status?: BookingStatus;
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'departureDate' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerBookingEmailData {
  bookingReference: string;
  customerName: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  passengers: number;
  price: number;
  currency: string;
}

export interface AdminBookingEmailData {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  userType: 'REGISTERED' | 'GUEST';
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  passengers: number;
  price: number;
  currency: string;
  createdAt: string;
  adminUrl: string;
}

export interface StatusUpdateEmailData {
  bookingReference: string;
  customerName: string;
  status: BookingStatus;
  reason?: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
}
