"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, MapPin, Loader2, PlaneLanding } from "lucide-react";
import { cn } from "@/utils/utils";
import { forwardGeocode, type MapLocation } from "@/hooks/useMapBooking";

// ─── Brussels-area airports — always surfaced first ───────────────────────────
const BRUSSELS_AIRPORTS: MapLocation[] = [
  {
    name: "Brussels Airport (BRU) — Zaventem",
    city: "Brussels Airport",
    country: "Belgium",
    latitude: 50.9014,
    longitude: 4.4844,
  },
  {
    name: "Brussels South Charleroi Airport (CRL)",
    city: "Brussels South Charleroi Airport",
    country: "Belgium",
    latitude: 50.4592,
    longitude: 4.4537,
  },
];

/** Returns the two Brussels airports whose name/city matches the query */
function matchAirports(q: string): MapLocation[] {
  if (!q.trim()) return BRUSSELS_AIRPORTS; // show both when field is empty/focused
  const lower = q.toLowerCase();
  return BRUSSELS_AIRPORTS.filter(
    (a) =>
      a.name.toLowerCase().includes(lower) ||
      a.city.toLowerCase().includes(lower) ||
      // common shorthand: "bru", "crl", "charleroi", "zaventem", "airport"
      lower.includes("airport") ||
      lower.includes("bru") ||
      lower.includes("crl") ||
      lower.includes("zaventem") ||
      lower.includes("charleroi") ||
      lower.includes("brussels"),
  );
}

interface LocationSearchInputProps {
  value: MapLocation | null;
  onChange: (loc: MapLocation | null) => void;
  placeholder: string;
  label: string;
  pinColor: "emerald" | "rose";
  disabled?: boolean;
}

export function LocationSearchInput({
  value,
  onChange,
  placeholder,
  label,
  pinColor,
  disabled = false,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounced search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // No query → just show the two airports
    if (!query.trim()) {
      setResults(BRUSSELS_AIRPORTS);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

        // Build URL manually so we can add proximity + country bias
        const params = new URLSearchParams({
          access_token: token,
          autocomplete: "true",
          language: "en",
          limit: "6",
          // Bias results toward the Brussels region
          proximity: "4.3517,50.8503",
          // Prefer Belgium + neighbouring countries
          country: "BE,NL,DE,FR,LU,GB",
          types: "place,locality,address,poi",
        });

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query,
        )}.json?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();

        const geocoded: MapLocation[] = (data.features ?? []).map((f: any) => ({
          name: f.place_name,
          city: f.text || f.place_name.split(",")[0],
          country:
            f.context?.find((c: any) => c.id.startsWith("country"))?.text ?? "",
          latitude: f.center[1],
          longitude: f.center[0],
        }));

        // Pinned airports that match the query come first, then geocoded results
        const pinned = matchAirports(query);
        // Deduplicate: remove geocoded entries that overlap with a pinned airport
        const deduped = geocoded.filter(
          (g) =>
            !pinned.some(
              (a) =>
                Math.abs(a.latitude - g.latitude) < 0.05 &&
                Math.abs(a.longitude - g.longitude) < 0.05,
            ),
        );

        setResults([...pinned, ...deduped]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [query]);

  // ── Close on outside click ──────────────────────────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (loc: MapLocation) => {
      onChange(loc);
      setOpen(false);
      setQuery("");
      setResults([]);
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setQuery("");
      setResults(BRUSSELS_AIRPORTS);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [onChange],
  );

  const isAirport = (loc: MapLocation) =>
    BRUSSELS_AIRPORTS.some(
      (a) =>
        Math.abs(a.latitude - loc.latitude) < 0.05 &&
        Math.abs(a.longitude - loc.longitude) < 0.05,
    );

  const colorClass = { emerald: "text-emerald-500", rose: "text-rose-500" }[
    pinColor
  ];
  const ringClass = { emerald: "ring-emerald-300", rose: "ring-rose-300" }[
    pinColor
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>

      <div
        role="combobox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            // Show airports immediately on focus
            if (!query.trim()) setResults(BRUSSELS_AIRPORTS);
            inputRef.current?.focus();
          }
        }}
        className={cn(
          "relative flex items-center gap-2 h-12 w-full rounded-lg border border-input bg-background px-3",
          "cursor-text transition-all duration-150",
          open && `ring-2 ${ringClass} border-transparent`,
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <MapPin className={cn("h-4 w-4 shrink-0", colorClass)} />

        {open || !value ? (
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder={
              open ? "Type a city, address or airport…" : placeholder
            }
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
              if (!query.trim()) setResults(BRUSSELS_AIRPORTS);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
              }
              if (e.key === "Enter" && results.length > 0)
                handleSelect(results[0]);
            }}
          />
        ) : (
          <span className="flex-1 text-sm truncate">
            {value.city}, {value.country}
          </span>
        )}

        {searching && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        )}
        {value && !open && (
          <button
            onClick={handleClear}
            className="rounded-full p-0.5 hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl border border-border
                     bg-popover shadow-xl max-h-64 overflow-y-auto
                     animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {results.length === 0 && !searching && query.length > 1 ? (
            <div className="flex flex-col items-center py-8 gap-2 text-sm text-muted-foreground">
              <Search className="h-5 w-5 opacity-40" />
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <ul>
              {/* Section header when airports are shown */}
              {results.some(isAirport) && (
                <li className="px-4 pt-2.5 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Brussels Airports
                  </span>
                </li>
              )}

              {results.map((loc, i) => {
                const airport = isAirport(loc);
                const isLastAirport =
                  airport &&
                  (i === results.length - 1 || !isAirport(results[i + 1]));

                return (
                  <li key={`${loc.latitude}-${loc.longitude}`}>
                    {/* Divider between airports and regular results */}
                    {isLastAirport && i < results.length - 1 && (
                      <div className="mx-4 my-1 border-t border-border/60" />
                    )}
                    {/* Section header for regular results */}
                    {!airport && (i === 0 || isAirport(results[i - 1])) && (
                      <div className="px-4 pt-1 pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Other locations
                        </span>
                      </div>
                    )}

                    <div
                      onClick={() => handleSelect(loc)}
                      className={cn(
                        "flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                        airport ? "hover:bg-primary/5" : "hover:bg-muted/70",
                        i !== results.length - 1 && "border-b border-border/40",
                      )}
                    >
                      {airport ? (
                        <PlaneLanding
                          className={cn("h-4 w-4 shrink-0 mt-0.5", colorClass)}
                        />
                      ) : (
                        <MapPin
                          className={cn("h-4 w-4 shrink-0 mt-0.5", colorClass)}
                        />
                      )}
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            airport ? "text-foreground" : "text-foreground",
                          )}
                        >
                          {loc.city}
                          {loc.country ? `, ${loc.country}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {loc.name}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
