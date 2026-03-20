export interface SearchFilters {
  fromLocation: string;
  toLocation: string;
  fromCode: string;
  toCode: string;
  departureDate?: string;
  passengers?: number;
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
  distance: number;
  fromCity: string;
}

export interface BookingDetails {
  // Route info
  fromLocation: string;
  toLocation: string;
  fromCode: string;
  toCode: string;

  // Selected shuttle
  shuttle: SearchResult;

  // Trip details 
  tripType: "ONE_WAY" | "ROUND_TRIP";
  departureDate: Date;
  returnDate?: Date;
  departureTime: string;
  returnTime?: string;
  passengers: number;
}
