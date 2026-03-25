import type { Booking } from "@/types/booking.types";
import type { SearchResult } from "@/types/search.types";

/**
 * Pre-fills the public booking flow (`/booking`) using a past trip.
 */
export function writeRebookSessionFromBooking(booking: Booking): void {
  const distanceNum = booking.distance ? Number(booking.distance) : 0;
  const distance = Number.isFinite(distanceNum) ? distanceNum : 0;
  const passengers = Math.max(1, booking.passengers || 1);
  const perPerson =
    passengers > 0 ? Math.round((booking.price / passengers) * 100) / 100 : booking.price;

  const shuttle: SearchResult = {
    id: "rebook",
    provider: "EVO Transport",
    vehicleType: "Shuttle",
    departureTime: booking.departureTime || "09:00",
    arrivalTime: "",
    duration: "",
    price: perPerson,
    currency: booking.currency,
    availableSeats: 12,
    amenities: [],
    distance,
    fromCity: booking.fromCity ?? "",
  };

  const payload = {
    fromLocation: booking.fromLocation,
    toLocation: booking.toLocation,
    fromCity: booking.fromCity ?? "",
    toCity: booking.toCity ?? "",
    fromCode: booking.fromCode ?? "",
    toCode: booking.toCode ?? "",
    distance,
    shuttle,
  };

  sessionStorage.setItem("selectedRoute", JSON.stringify(payload));
}
