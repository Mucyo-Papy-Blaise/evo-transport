"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";
import type { MapLocation } from "@/hooks/useMapBooking";
import {
  groupSearchResults,
  searchBookingLocations,
} from "@/lib/bookingLocationSearch";

export type LocationFieldVariant = "departure" | "destination";

const BRUSSELS_AIRPORTS: MapLocation[] = [
  {
    latitude: 50.901389,
    longitude: 4.484444,
    city: "Brussels",
    country: "Belgium",
    listTitle: "Brussels Airport (BRU)",
    name: "Brussels-Zaventem",
  },
  {
    latitude: 50.477222,
    longitude: 4.461389,
    city: "Brussels",
    country: "Belgium",
    listTitle: "Brussels South (CRL)",
    name: "Brussels-Charleroi",
  },
];

interface LocationSearchInputProps {
  value: MapLocation | null;
  onChange: (loc: MapLocation | null) => void;
  placeholder: string;
  label: string;
  /** Departure uses `--button` (brand green); destination uses `--primary`. */
  variant: LocationFieldVariant;
  disabled?: boolean;
}

export function LocationSearchInput({
  value,
  onChange,
  placeholder,
  label,
  variant,
  disabled = false,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const grouped = useMemo(() => groupSearchResults(results), [results]);

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
        const locs = await searchBookingLocations(query, token);
        setResults(locs);
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

  const accent =
    variant === "departure"
      ? {
          icon: "text-button",
          ring: "ring-button/45",
          borderOpen: "border-button/50",
        }
      : {
          icon: "text-primary",
          ring: "ring-primary/40",
          borderOpen: "border-primary/45",
        };

  return (
    <div ref={containerRef} className="relative z-[1] w-full">
      <label className="block text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
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
          "relative flex items-center gap-3 min-h-[3.25rem] w-full rounded-xl border bg-background px-4 py-3.5",
          "cursor-text transition-all duration-150",
          open
            ? cn("ring-2 ring-offset-0", accent.ring, accent.borderOpen)
            : "border-input",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <MapPin className={cn("h-5 w-5 shrink-0", accent.icon)} />

        {open || !value ? (
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-base leading-normal outline-none placeholder:text-muted-foreground min-w-0"
            placeholder={
              open
                ? "Airport, station, or city…"
                : placeholder
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
          <span className="flex-1 text-base truncate">
            {value.listTitle ?? `${value.city}, ${value.country}`}
          </span>
        )}

        {searching && (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
        )}
        {value && !open && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full p-1 hover:bg-muted transition-colors text-muted-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute left-0 right-0 z-[200] mt-2 rounded-xl border border-border bg-popover",
            "shadow-2xl ring-1 ring-black/5 dark:ring-white/10",
            "max-h-[min(26rem,calc(100vh-10rem))] overflow-y-auto overscroll-contain",
            "scroll-pb-4 pb-1",
            "animate-in fade-in-0 zoom-in-95 duration-150",
          )}
        >
          {results.length === 0 && !searching && query.length > 1 ? (
            <div className="flex flex-col items-center py-8 gap-2 text-sm text-muted-foreground">
              <Search className="h-5 w-5 opacity-40" />
              No results for &quot;{query}&quot;
            </div>
          ) : results.length === 0 && !searching ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Start typing an airport, station, or city…
            </div>
          ) : (
            <div className="pb-3">
              {grouped.map((group) => (
                <div key={group.country}>
                  <div
                    className="sticky top-0 z-[1] px-4 py-2 text-[11px] font-bold uppercase tracking-wider
                              text-muted-foreground bg-muted/90 backdrop-blur-sm border-b border-border/60"
                  >
                    {group.country}
                  </div>
                  <ul className="pb-0">
                    {group.items.map((loc) => {
                      const primary =
                        loc.listTitle ??
                        `${loc.city}${loc.country ? `, ${loc.country}` : ""}`;
                      const secondary = loc.listSubtitle ?? loc.name;
                      return (
                        <li
                          key={`${loc.latitude}-${loc.longitude}-${primary}`}
                          role="option"
                          onClick={() => handleSelect(loc)}
                          className="flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-muted/70 transition-colors border-b border-border/40 last:border-b-0"
                        >
                          <MapPin
                            className={cn(
                              "h-5 w-5 shrink-0 mt-0.5",
                              accent.icon,
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold text-foreground leading-snug">
                              {primary}
                            </p>
                            {secondary && secondary !== primary && (
                              <p className="text-sm text-muted-foreground mt-1 leading-snug line-clamp-2">
                                {secondary}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
