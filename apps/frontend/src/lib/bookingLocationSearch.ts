import type { MapLocation } from "@/hooks/useMapBooking";
import { searchBelgiumShuttleLocations } from "@/data/belgiumShuttleLocations";
import { searchTransportHubs } from "@/data/transportHubs";

export type GroupedSearchResults = { country: string; items: MapLocation[] };

/** Flibco-style country sections in the dropdown. */
export function groupSearchResults(items: MapLocation[]): GroupedSearchResults[] {
  const order: string[] = [];
  const byCountry = new Map<string, MapLocation[]>();

  for (const item of items) {
    const label = item.country?.trim() || "Other";
    if (!byCountry.has(label)) {
      byCountry.set(label, []);
      order.push(label);
    }
    byCountry.get(label)!.push(item);
  }

  return order.map((country) => ({
    country,
    items: byCountry.get(country)!,
  }));
}

/** Europe-ish bounds (same spirit as existing map booking). */
const GEOCODE_BBOX = "-25,34,45,72";

const TRANSPORT_HINT =
  /airport|airfield|\bstation\b|terminal|gare|flughafen|aeroport|aéroport|\bhbf\b|shuttle|coach|bus\s+station/i;

function haversineKm(a: MapLocation, b: MapLocation): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function countryCodeFromContext(
  context: { id: string; short_code?: string }[] | undefined,
): string | undefined {
  const c = context?.find((x) => String(x.id).startsWith("country"));
  const sc = c?.short_code;
  return typeof sc === "string" ? sc.toUpperCase() : undefined;
}

function inferKind(label: string): MapLocation["kind"] {
  const s = label.toLowerCase();
  if (/\bairport\b|airfield|\bintl\b|\binternational\b/i.test(s)) return "airport";
  if (/\bstation\b|gare|bahnhof|stazione|centraal|central station/i.test(s))
    return "station";
  return "poi";
}

interface MapboxGeocodeFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
  context?: { id: string; text: string; short_code?: string }[];
  properties?: { category?: string; maki?: string };
}

function mapboxFeatureToLocation(feat: MapboxGeocodeFeature): MapLocation {
  const [lng, lat] = feat.center;
  const ctx = feat.context ?? [];
  const country = ctx.find((c) => c.id.startsWith("country"))?.text ?? "";
  const place =
    ctx.find(
      (c) =>
        c.id.startsWith("place") ||
        c.id.startsWith("locality") ||
        c.id.startsWith("district"),
    )?.text ?? "";

  const primary = feat.text || feat.place_name;
  const kind =
    feat.properties?.category === "airport"
      ? "airport"
      : inferKind(`${feat.text} ${feat.place_name}`);

  return {
    name: feat.place_name,
    city: place || primary,
    country,
    latitude: lat,
    longitude: lng,
    listTitle: primary,
    listSubtitle:
      feat.place_name !== primary ? feat.place_name : undefined,
    kind,
    countryCode: countryCodeFromContext(ctx),
  };
}

async function forwardGeocodePoi(
  query: string,
  token: string,
): Promise<MapLocation[]> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${token}&types=poi&limit=14&bbox=${GEOCODE_BBOX}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const features = (data.features ?? []) as MapboxGeocodeFeature[];

  const mapped = features.map((f) => mapboxFeatureToLocation(f));

  const ranked = mapped.sort((a, b) => {
    const sa =
      TRANSPORT_HINT.test(`${a.listTitle} ${a.listSubtitle ?? ""} ${a.name}`)
        ? 1
        : 0;
    const sb =
      TRANSPORT_HINT.test(`${b.listTitle} ${b.listSubtitle ?? ""} ${b.name}`)
        ? 1
        : 0;
    return sb - sa;
  });

  return ranked;
}

async function forwardGeocodePlaces(
  query: string,
  token: string,
): Promise<MapLocation[]> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${token}&types=place,locality&limit=2&bbox=${GEOCODE_BBOX}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const features = (data.features ?? []) as MapboxGeocodeFeature[];

  return features.map((f) => {
    const loc = mapboxFeatureToLocation(f);
    return { ...loc, kind: "city" as const };
  });
}

/**
 * Prefer curated airports/stations (Flibco-style), then Mapbox POI.
 * When hubs already match, skip generic city rows — same idea as Flibco’s stop list.
 */
const MAX_MERGED_RESULTS = 20;

export async function searchBookingLocations(
  query: string,
  token: string,
): Promise<MapLocation[]> {
  const q = query.trim();
  if (!q) return [];

  const belgium = searchBelgiumShuttleLocations(q, 24);
  const hubs = searchTransportHubs(q, 12);

  const merged: MapLocation[] = [...belgium];

  const nearAny = (loc: MapLocation, km: number) =>
    merged.some((o) => haversineKm(o, loc) < km);

  for (const h of hubs) {
    if (nearAny(h, 1.2)) continue;
    merged.push(h);
  }

  if (!token) {
    return merged.slice(0, MAX_MERGED_RESULTS);
  }

  const [pois, places] = await Promise.all([
    forwardGeocodePoi(q, token),
    forwardGeocodePlaces(q, token),
  ]);

  for (const p of pois) {
    if (nearAny(p, 2.5)) continue;
    merged.push(p);
  }

  if (belgium.length === 0 && hubs.length === 0) {
    for (const p of places) {
      if (nearAny(p, 1.5)) continue;
      merged.push(p);
    }
  }

  return merged.slice(0, MAX_MERGED_RESULTS);
}
