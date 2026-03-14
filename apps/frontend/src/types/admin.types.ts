import { BookingStatus, TripType } from './enum';
import { BookingUser } from './booking.types';
import type { PassengerDetail } from './passenger.types';

export interface AdminBooking {
  id: string;
  bookingReference: string;

  // Customer info
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  guestPhone: string | null;
  userType: 'REGISTERED' | 'GUEST';

  // Trip details
  tripType: TripType;
  fromLocation: string;
  toLocation: string;
  fromCode: string | null;
  toCode: string | null;
  fromCity: string | null;
  toCity: string | null;
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
  currency: string;

  // Status
  status: BookingStatus;
  adminNotes: string | null;
  adminRespondedAt: string | null;
  adminRespondedBy: string | null;

  // Timestamps
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;

  // User info if registered
  user?: BookingUser | null;
}

export interface AdminBookingFilter {
  status?: BookingStatus; // Single status, not array
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'departureDate' | 'price';
  sortOrder?: 'asc' | 'desc';
}


export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeVehicles: number;
  totalCustomers: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rejectedBookings?: number;
  revenueChange: number;
  bookingsChange: number;
  customersChange: number;
}

export interface RecentBooking {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  currency: string;
  status: BookingStatus
  createdAt: string;
}