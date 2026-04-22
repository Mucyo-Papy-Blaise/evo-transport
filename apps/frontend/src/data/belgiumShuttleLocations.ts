import type { MapLocation } from "@/hooks/useMapBooking";
import raw from "@/config/belgiumShuttleLocations.json";

/**
 * Curated Belgium stops for map booking (Flibco-style coverage).
 * Source of truth: `src/config/belgiumShuttleLocations.json`
 */
type BelgiumKind = "airport" | "station" | "hotel" | "poi";

type BelgiumShuttleEntry = {
  id: string;
  featured?: boolean;
  listTitle: string;
  listSubtitle?: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  kind: BelgiumKind;
  latitude: number;
  longitude: number;
  code?: string;
  aliases: string[];
};

type BelgiumShuttleFile = {
  description?: string;
  locations: BelgiumShuttleEntry[];
};

const DATA = raw as BelgiumShuttleFile;

const ENTRIES: BelgiumShuttleEntry[] = DATA.locations ?? [];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function scoreEntry(entry: BelgiumShuttleEntry, qRaw: string): number {
  const q = normalize(qRaw.trim());
  if (q.length < 2) return 0;

  const parts = [
    entry.id,
    entry.code ?? "",
    entry.city,
    entry.country,
    entry.listTitle,
    entry.listSubtitle ?? "",
    entry.name,
    ...entry.aliases,
  ]
    .join(" ")
    .toLowerCase();

  const blob = normalize(parts);

  if (entry.code && normalize(entry.code) === q) return 1200;

  const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
  let score = 0;

  for (const t of tokens) {
    if (blob.includes(t)) score += 80;
    if (entry.aliases.some((a) => normalize(a).includes(t))) score += 120;
    if (normalize(entry.city).startsWith(t)) score += 100;
    if (normalize(entry.listTitle).startsWith(t)) score += 90;
  }

  if (blob.includes(q)) score += 200;
  if (normalize(entry.listTitle).includes(q)) score += 150;

  return score;
}

function entryToMapLocation(e: BelgiumShuttleEntry): MapLocation {
  return {
    name: e.name,
    city: e.city,
    country: e.country,
    latitude: e.latitude,
    longitude: e.longitude,
    listTitle: e.listTitle,
    listSubtitle: e.listSubtitle,
    code: e.code,
    kind: e.kind === "hotel" ? "hotel" : e.kind,
    countryCode: e.countryCode,
  };
}

/** Ranked matches from the Belgium JSON catalog. */
export function searchBelgiumShuttleLocations(
  query: string,
  max = 20,
): MapLocation[] {
  const q = query.trim();
  if (q.length < 2) return [];

  return ENTRIES.map((entry) => ({ entry, score: scoreEntry(entry, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => entryToMapLocation(x.entry));
}

/**
 * Shown when the search box is open with no query — set `"featured": true` on
 * rows in the JSON to include them here (airports + main stations by default).
 */
export function getDefaultBelgiumShuttleSuggestions(): MapLocation[] {
  const featured = ENTRIES.filter((e) => e.featured).map(entryToMapLocation);
  if (featured.length > 0) return featured;

  return ENTRIES.filter((e) => e.kind === "airport").map(entryToMapLocation);
}

/** All configured Belgium stops (for tests or admin tools). */
export function getAllBelgiumShuttleLocations(): MapLocation[] {
  return ENTRIES.map(entryToMapLocation);
}
