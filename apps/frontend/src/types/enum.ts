export enum UserRole {
  PASSENGER = "PASSENGER",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
}

export type TripType = 'ONE_WAY' | 'ROUND_TRIP';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type UserType = 'REGISTERED' | 'GUEST';
export type Currency = 'USD' | 'EUR' | 'RWF' | 'GBP';