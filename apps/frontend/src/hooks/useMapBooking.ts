"use client";

import { useState, useCallback, useEffect } from "react";
import { usePricingSettings } from "@/hooks/usePricingSettings";

export interface MapLocation {
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface RoutePriceResult {
  distance: number;
  price: number;
  currency: string;
  estimatedDuration: string;
  isLongDistance: boolean;
}

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversineKm(a: MapLocation, b: MapLocation): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(h)));
}

// ─── Duration estimate ────────────────────────────────────────────────────────
function estimateDuration(km: number): string {
  const totalMins = Math.round((km / 80) * 60);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// ─── Mapbox Reverse Geocoding ─────────────────────────────────────────────────
export async function reverseGeocode(
  lat: number,
  lng: number,
  token: string,
): Promise<MapLocation> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${token}&types=place,locality,neighborhood,address&limit=1`;

  const res = await fetch(url);
  const data = await res.json();
  const feat = data.features?.[0];

  if (!feat) {
    return {
      name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: "Unknown",
      country: "Unknown",
      latitude: lat,
      longitude: lng,
    };
  }

  const context: { id: string; text: string }[] = feat.context ?? [];
  const city =
    context.find((c) => c.id.startsWith("place") || c.id.startsWith("locality"))
      ?.text ?? feat.text;
  const country = context.find((c) => c.id.startsWith("country"))?.text ?? "";

  return {
    name: feat.place_name,
    city,
    country,
    latitude: lat,
    longitude: lng,
  };
}

// ─── Mapbox Forward Geocoding ─────────────────────────────────────────────────
// Key fixes vs original:
//   1. Added `poi` to types  →  airports are POIs in Mapbox, omitting it hid them
//   2. Added proximity bias  →  Brussels coordinates push local results to the top
//   3. Added country bias    →  Belgium + neighbours ranked above global results
//   4. Removed broad bbox    →  proximity handles scoping better than a hard bbox
export async function forwardGeocode(
  query: string,
  token: string,
): Promise<MapLocation[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    access_token: token,
    autocomplete: "true",
    language: "en",
    limit: "6",
    // ↓ Include poi so airports (which are POIs in Mapbox) appear in results
    types: "place,locality,address,poi",
    // ↓ Bias toward Brussels city centre — nearby results rank higher
    proximity: "4.3517,50.8503",
    // ↓ Prefer Belgium + neighbouring countries over the rest of the world
    country: "BE,NL,DE,FR,LU,GB",
  });

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;

  const res = await fetch(url);
  const data = await res.json();

  return (data.features ?? []).map((feat: any) => {
    const context: { id: string; text: string }[] = feat.context ?? [];
    const city =
      context.find(
        (c) => c.id.startsWith("place") || c.id.startsWith("locality"),
      )?.text ?? feat.text;
    const country = context.find((c) => c.id.startsWith("country"))?.text ?? "";
    return {
      name: feat.place_name,
      city: city || feat.text,
      country,
      latitude: feat.center[1],
      longitude: feat.center[0],
    };
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
const FALLBACK_PRICE_PER_KM = 2;
const FALLBACK_CURRENCY = "EUR";

export function useMapBooking() {
  const {
    data: pricing,
    isLoading: isPricingLoading,
    isError: isPricingError,
  } = usePricingSettings();

  const [from, setFromState] = useState<MapLocation | null>(null);
  const [to, setToState] = useState<MapLocation | null>(null);
  const [routeInfo, setRouteInfo] = useState<RoutePriceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinMode, setPinMode] = useState<"from" | "to">("from");

  // ── Route calculation (pure frontend, no backend) ─────────────────────────
  const calculateRoute = useCallback(
    (origin: MapLocation, destination: MapLocation) => {
      setIsLoading(true);
      setError(null);

      try {
        const km = haversineKm(origin, destination);
        const rateRaw = pricing?.effectivePricePerKm;
        const rate =
          typeof rateRaw === "number" && Number.isFinite(rateRaw) && rateRaw > 0
            ? rateRaw
            : FALLBACK_PRICE_PER_KM;
        const price = Math.round(km * rate * 100) / 100;

        setRouteInfo({
          distance: km,
          price,
          currency: pricing?.currency ?? FALLBACK_CURRENCY,
          estimatedDuration: estimateDuration(km),
          // ↓ Changed from 400 → 200 to match the Brussels 200 km service area
          isLongDistance: km > 200,
        });
      } catch {
        setError("Could not calculate route. Please try again.");
        setRouteInfo(null);
      } finally {
        setIsLoading(false);
      }
    },
    [pricing?.effectivePricePerKm, pricing?.currency],
  );

  // Recalculate whenever both pins change
  useEffect(() => {
    if (from && to) calculateRoute(from, to);
    else setRouteInfo(null);
  }, [from, to, calculateRoute]);

  // ── Map click → reverse geocode ───────────────────────────────────────────
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
      setIsGeocoding(true);
      try {
        const location = await reverseGeocode(lat, lng, token);
        if (pinMode === "from") {
          setFromState(location);
          setPinMode("to");
        } else {
          setToState(location);
        }
      } catch {
        setError("Could not identify location. Try clicking again.");
      } finally {
        setIsGeocoding(false);
      }
    },
    [pinMode],
  );

  const setFrom = useCallback((loc: MapLocation | null) => {
    setFromState(loc);
    if (loc) setPinMode("to");
  }, []);

  const setTo = useCallback((loc: MapLocation | null) => {
    setToState(loc);
  }, []);

  const swapLocations = useCallback(() => {
    setFromState(to);
    setToState(from);
  }, [from, to]);

  const clearRoute = useCallback(() => {
    setFromState(null);
    setToState(null);
    setRouteInfo(null);
    setError(null);
    setPinMode("from");
  }, []);

  return {
    from,
    to,
    routeInfo,
    isLoading,
    isGeocoding,
    error,
    pinMode,
    setPinMode,
    setFrom,
    setTo,
    swapLocations,
    clearRoute,
    handleMapClick,
    pricing: pricing ?? null,
    isPricingLoading,
    isPricingError,
  };
}
