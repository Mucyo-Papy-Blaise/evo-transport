import type { MapLocation } from "@/hooks/useMapBooking";

/**
 * Curated shuttle-style stops (airports + major stations), Flibco-style.
 * Extend this list as you add real EVO routes.
 */
type HubDef = {
  id: string;
  listTitle: string;
  listSubtitle?: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  code?: string;
  kind: "airport" | "station";
  latitude: number;
  longitude: number;
  /** Extra strings to match user typing (lowercase) */
  aliases: string[];
};

const HUBS: HubDef[] = [
  // ── Belgium (Flibco reference set) ─────────────────────────────────────
  {
    id: "be-bru-airport",
    listTitle: "Brussels Airport Zaventem (BRU)",
    listSubtitle:
      "Brussels Airport Zaventem — Intercity bus parking P16",
    name: "Brussels Airport Zaventem, Belgium",
    city: "Brussels",
    country: "Belgium",
    countryCode: "BE",
    code: "BRU",
    kind: "airport",
    latitude: 50.9014,
    longitude: 4.4844,
    aliases: [
      "zaventem",
      "brussel airport",
      "brussels airport",
      "bruxelles airport",
      "bru",
    ],
  },
  {
    id: "be-crl-airport",
    listTitle: "Charleroi Airport (CRL)",
    listSubtitle:
      "Brussels South Charleroi Airport — Shuttle bus terminal (in front of terminal 1)",
    name: "Brussels South Charleroi Airport, Belgium",
    city: "Charleroi",
    country: "Belgium",
    countryCode: "BE",
    code: "CRL",
    kind: "airport",
    latitude: 50.4592,
    longitude: 4.4538,
    aliases: [
      "charleroi",
      "brussels south",
      "south charleroi",
      "crl",
      "gosselies",
    ],
  },
  {
    id: "be-brussels-midi",
    listTitle: "Brussels Midi Station",
    listSubtitle: "Gare du Midi / Zuidstation (Rue de France)",
    name: "Brussels-South railway station, Belgium",
    city: "Brussels",
    country: "Belgium",
    countryCode: "BE",
    kind: "station",
    latitude: 50.8352,
    longitude: 4.335,
    aliases: [
      "midi",
      "zuidstation",
      "gare du midi",
      "brussel midi",
      "brussels south station",
      "south station",
    ],
  },
  {
    id: "be-antwerp-central",
    listTitle: "Antwerp Central Station",
    listSubtitle: "Antwerpen-Centraal",
    name: "Antwerp Central Station, Belgium",
    city: "Antwerp",
    country: "Belgium",
    countryCode: "BE",
    kind: "station",
    latitude: 51.2172,
    longitude: 4.4211,
    aliases: ["antwerp", "antwerpen", "anvers"],
  },
  {
    id: "be-brussels-central",
    listTitle: "Brussels Central Station",
    listSubtitle: "Bruxelles-Central / Brussel-Centraal",
    name: "Brussels Central Station, Belgium",
    city: "Brussels",
    country: "Belgium",
    countryCode: "BE",
    kind: "station",
    latitude: 50.845,
    longitude: 4.357,
    aliases: ["brussel central", "brussels central", "centraal"],
  },
  // ── United Kingdom ───────────────────────────────────────────────────
  {
    id: "gb-stn",
    listTitle: "London Stansted Airport (STN)",
    listSubtitle: "Stansted Airport coach & bus station",
    name: "London Stansted Airport, United Kingdom",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    code: "STN",
    kind: "airport",
    latitude: 51.886,
    longitude: 0.2389,
    aliases: ["stansted", "stn", "london stansted"],
  },
  {
    id: "gb-lgw",
    listTitle: "London Gatwick Airport (LGW)",
    name: "London Gatwick Airport, United Kingdom",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    code: "LGW",
    kind: "airport",
    latitude: 51.1537,
    longitude: -0.1821,
    aliases: ["gatwick", "lgw"],
  },
  {
    id: "gb-lhr",
    listTitle: "London Heathrow Airport (LHR)",
    name: "London Heathrow Airport, United Kingdom",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    code: "LHR",
    kind: "airport",
    latitude: 51.47,
    longitude: -0.4543,
    aliases: ["heathrow", "lhr"],
  },
  {
    id: "gb-ltn",
    listTitle: "London Luton Airport (LTN)",
    name: "London Luton Airport, United Kingdom",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    code: "LTN",
    kind: "airport",
    latitude: 51.8747,
    longitude: -0.3683,
    aliases: ["luton", "ltn"],
  },
  // ── France ───────────────────────────────────────────────────────────
  {
    id: "fr-cdg",
    listTitle: "Paris Charles de Gaulle Airport (CDG)",
    name: "Paris Charles de Gaulle Airport, France",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    code: "CDG",
    kind: "airport",
    latitude: 49.0097,
    longitude: 2.5479,
    aliases: ["cdg", "charles de gaulle", "roissy"],
  },
  {
    id: "fr-ory",
    listTitle: "Paris Orly Airport (ORY)",
    name: "Paris Orly Airport, France",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    code: "ORY",
    kind: "airport",
    latitude: 48.7262,
    longitude: 2.3652,
    aliases: ["orly", "ory"],
  },
  // ── Germany ──────────────────────────────────────────────────────────
  {
    id: "de-fra",
    listTitle: "Frankfurt Airport (FRA)",
    name: "Frankfurt Airport, Germany",
    city: "Frankfurt",
    country: "Germany",
    countryCode: "DE",
    code: "FRA",
    kind: "airport",
    latitude: 50.0379,
    longitude: 8.5622,
    aliases: ["frankfurt airport", "fra", "frankfurt am main flughafen"],
  },
  {
    id: "de-hhn",
    listTitle: "Frankfurt-Hahn Airport (HHN)",
    listSubtitle: "Shuttle hub — Hahn",
    name: "Frankfurt-Hahn Airport, Germany",
    city: "Hahn",
    country: "Germany",
    countryCode: "DE",
    code: "HHN",
    kind: "airport",
    latitude: 49.9487,
    longitude: 7.2639,
    aliases: ["hahn", "hhn", "frankfurt hahn"],
  },
  {
    id: "de-muc",
    listTitle: "Munich Airport (MUC)",
    name: "Munich Airport, Germany",
    city: "Munich",
    country: "Germany",
    countryCode: "DE",
    code: "MUC",
    kind: "airport",
    latitude: 48.3538,
    longitude: 11.7861,
    aliases: ["munich", "münchen", "muc", "flughafen münchen"],
  },
  // ── Italy ────────────────────────────────────────────────────────────
  {
    id: "it-mxp",
    listTitle: "Milan Malpensa Airport (MXP)",
    name: "Milan Malpensa Airport, Italy",
    city: "Milan",
    country: "Italy",
    countryCode: "IT",
    code: "MXP",
    kind: "airport",
    latitude: 45.6306,
    longitude: 8.7281,
    aliases: ["malpensa", "mxp", "milano malpensa"],
  },
  {
    id: "it-bgx",
    listTitle: "Milan Bergamo Airport (BGY)",
    name: "Orio al Serio International Airport, Italy",
    city: "Bergamo",
    country: "Italy",
    countryCode: "IT",
    code: "BGY",
    kind: "airport",
    latitude: 45.6739,
    longitude: 9.7042,
    aliases: ["bergamo", "orio al serio", "bgy", "milan bergamo"],
  },
  {
    id: "it-lin",
    listTitle: "Milan Linate Airport (LIN)",
    name: "Milan Linate Airport, Italy",
    city: "Milan",
    country: "Italy",
    countryCode: "IT",
    code: "LIN",
    kind: "airport",
    latitude: 45.4451,
    longitude: 9.2767,
    aliases: ["linate", "lin"],
  },
  {
    id: "it-tsf",
    listTitle: "Venice Treviso Airport (TSF)",
    name: "Treviso Airport, Italy",
    city: "Treviso",
    country: "Italy",
    countryCode: "IT",
    code: "TSF",
    kind: "airport",
    latitude: 45.6504,
    longitude: 12.1944,
    aliases: ["treviso", "tsf", "venice treviso"],
  },
  // ── Netherlands ──────────────────────────────────────────────────────
  {
    id: "nl-ams",
    listTitle: "Amsterdam Schiphol Airport (AMS)",
    name: "Amsterdam Airport Schiphol, Netherlands",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    code: "AMS",
    kind: "airport",
    latitude: 52.3105,
    longitude: 4.7683,
    aliases: ["schiphol", "ams", "amsterdam airport"],
  },
  // ── Spain ────────────────────────────────────────────────────────────
  {
    id: "es-mad",
    listTitle: "Madrid-Barajas Airport (MAD)",
    name: "Adolfo Suárez Madrid–Barajas Airport, Spain",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    code: "MAD",
    kind: "airport",
    latitude: 40.4983,
    longitude: -3.5676,
    aliases: ["barajas", "mad", "madrid airport"],
  },
  {
    id: "es-bcn",
    listTitle: "Barcelona El Prat Airport (BCN)",
    name: "Barcelona–El Prat Airport, Spain",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    code: "BCN",
    kind: "airport",
    latitude: 41.2974,
    longitude: 2.0833,
    aliases: ["el prat", "bcn", "barcelona airport"],
  },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function scoreHub(hub: HubDef, qRaw: string): number {
  const q = normalize(qRaw.trim());
  if (q.length < 2) return 0;

  const parts = [
    hub.id,
    hub.code ?? "",
    hub.city,
    hub.country,
    hub.listTitle,
    hub.listSubtitle ?? "",
    hub.name,
    ...hub.aliases,
  ]
    .join(" ")
    .toLowerCase();

  const blob = normalize(parts);

  if (hub.code && normalize(hub.code) === q) return 1200;

  const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
  let score = 0;

  for (const t of tokens) {
    if (blob.includes(t)) score += 80;
    if (hub.aliases.some((a) => normalize(a).includes(t))) score += 120;
    if (normalize(hub.city).startsWith(t)) score += 100;
    if (normalize(hub.listTitle).startsWith(t)) score += 90;
  }

  if (blob.includes(q)) score += 200;
  if (normalize(hub.listTitle).includes(q)) score += 150;

  return score;
}

function hubToMapLocation(h: HubDef): MapLocation {
  return {
    name: h.name,
    city: h.city,
    country: h.country,
    latitude: h.latitude,
    longitude: h.longitude,
    listTitle: h.listTitle,
    listSubtitle: h.listSubtitle,
    code: h.code,
    kind: h.kind,
    countryCode: h.countryCode,
  };
}

/** Ranked curated hubs for the query (shuttle / airport style). */
export function searchTransportHubs(query: string, max = 10): MapLocation[] {
  const q = query.trim();
  if (q.length < 2) return [];

  return HUBS.map((hub) => ({ hub, score: scoreHub(hub, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => hubToMapLocation(x.hub));
}
