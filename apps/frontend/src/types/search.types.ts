export interface SearchFilters {
  fromLocation: string;
  toLocation: string;
  fromCode: string;
  toCode: string;
}

export interface SearchResult {
  id: string;
  provider: string;
  vehicleType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  availableSeats: number;
  amenities: string[];
  
}

export interface BookingDetails {
  // Route info
  fromLocation: string;
  toLocation: string;
  fromCode: string;
  toCode: string;
  
  // Selected shuttle
  shuttle: SearchResult;
  
  // Trip details (to be filled on booking page)
  tripType: 'ONE_WAY' | 'ROUND_TRIP';
  departureDate: Date;
  returnDate?: Date;
  departureTime: string;
  returnTime?: string;
  passengers: number;
}