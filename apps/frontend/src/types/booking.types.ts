import { BookingStatus, Currency, TripType, UserType } from "./enum";

export interface CreateBookingRequest {
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
  departureDate: string; 
  returnDate?: string;    
  departureTime: string;  
  returnTime?: string;  
  passengers: number;
  price: number;
  currency?: Currency;
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

// ==================== Response Types ====================

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
  departureDate: string;
  returnDate: string | null;
  departureTime: string;
  returnTime: string | null;
  passengers: number;
  
  // Pricing
  price: number;
  currency: Currency;
  
  // Status
  status: BookingStatus;
  adminNotes: string | null;
  adminRespondedAt: string | null;
  adminRespondedBy: string | null;
  
  // Timestamps
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  
  // User object if registered
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