"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X, MapPin, Loader2, PenLine } from "lucide-react";
import { cn } from "@/utils/utils";
import type { MapLocation } from "@/hooks/useMapBooking";
import { getDefaultBelgiumShuttleSuggestions } from "@/data/belgiumShuttleLocations";
import {
  geocodeFreeformAddress,
  groupSearchResults,
  searchBookingLocations,
} from "@/lib/bookingLocationSearch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type LocationFieldVariant = "departure" | "destination";

/** Open dropdown with no query — airports + featured stations from JSON config. */
const DEFAULT_SUGGESTIONS = getDefaultBelgiumShuttleSuggestions();

function parseGoogleMapsCoordinates(input: string): { lat: number; lng: number } | null {
  const text = input.trim();
  if (!text) return null;

  // Matches ".../@50.8503,4.3517,..." links.
  const atMatch = text.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) };
  }

  // Matches "...?q=50.8503,4.3517" or "...?ll=50.8503,4.3517".
  const pairMatch = text.match(/[?&](?:q|ll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (pairMatch) {
    return { lat: Number(pairMatch[1]), lng: Number(pairMatch[2]) };
  }

  return null;
}

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
  const [showManualPanel, setShowManualPanel] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResults, setManualResults] = useState<MapLocation[]>([]);
  const [manualError, setManualError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const grouped = useMemo(() => groupSearchResults(results), [results]);
  const groupedManual = useMemo(
    () => groupSearchResults(manualResults),
    [manualResults],
  );

  useEffect(() => {
    if (!open) {
      setShowManualPanel(false);
      setManualAddress("");
      setManualResults([]);
      setManualError(null);
      setManualLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (results.length > 0) setShowManualPanel(false);
  }, [results.length]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // No query → featured stops from src/config/belgiumShuttleLocations.json
    if (!query.trim()) {
      setResults(DEFAULT_SUGGESTIONS);
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
      setResults(DEFAULT_SUGGESTIONS);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [onChange],
  );

  const openManualPanel = useCallback(() => {
    setShowManualPanel(true);
    setManualAddress(query.trim());
    setManualResults([]);
    setManualError(null);
  }, [query]);

  const runManualLookup = useCallback(async () => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
    const text = manualAddress.trim();
    if (!text) {
      setManualError("Enter a full street address, city, and country.");
      return;
    }
    if (!token) {
      setManualError(
        "Address lookup needs a Mapbox token. You can still set this stop by clicking the map.",
      );
      return;
    }
    setManualLoading(true);
    setManualError(null);
    setManualResults([]);
    try {
      const locs = await geocodeFreeformAddress(text, token);
      if (locs.length === 0) {
        setManualError(
          "No match found. Add postal code and country, or set the pin on the map.",
        );
        return;
      }
      if (locs.length === 1) {
        handleSelect(locs[0]);
        return;
      }
      setManualResults(locs);
    } catch {
      setManualError("Lookup failed. Try again or use the map.");
    } finally {
      setManualLoading(false);
    }
  }, [manualAddress, handleSelect]);

  const useManualAsEntered = useCallback(() => {
    const text = manualAddress.trim();
    if (!text) {
      setManualError("Enter an address or a Google Maps link first.");
      return;
    }

    const coords = parseGoogleMapsCoordinates(text);
    const loc: MapLocation = {
      name: text,
      listTitle: text.length > 70 ? `${text.slice(0, 67)}...` : text,
      listSubtitle: coords
        ? "Manual location (Google Maps coordinates detected)"
        : "Manual location (exact text as entered by customer)",
      city: "Manual entry",
      country: "Unspecified",
      latitude: coords?.lat ?? Number.NaN,
      longitude: coords?.lng ?? Number.NaN,
      kind: "manual",
      countryCode: "ZZ",
    };

    handleSelect(loc);
  }, [manualAddress, handleSelect]);

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
            // Show featured config stops immediately on focus
            if (!query.trim()) setResults(DEFAULT_SUGGESTIONS);
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
            placeholder={open ? "Airport, station, or city…" : placeholder}
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
              if (!query.trim()) setResults(DEFAULT_SUGGESTIONS);
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
          {showManualPanel ? (
            <div
              className="px-4 py-4 space-y-3 border-t border-border/60"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Textarea
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="e.g. Rue de la Loi 42, 1040 Brussels, Belgium"
                className="min-h-[5.5rem] resize-y text-sm"
                disabled={disabled || manualLoading}
                aria-label="Full address for manual lookup"
              />
              {manualError && (
                <p className="text-xs text-destructive leading-snug">
                  {manualError}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5"
                  disabled={disabled || manualLoading}
                  onClick={() => void runManualLookup()}
                >
                  {manualLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Looking up…
                    </>
                  ) : (
                    "Use this address & continue"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={manualLoading}
                  onClick={() => {
                    setShowManualPanel(false);
                    setManualResults([]);
                    setManualError(null);
                  }}
                >
                  Back to search
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={disabled || manualLoading}
                  onClick={useManualAsEntered}
                >
                  Use exactly as entered
                </Button>
              </div>
              {manualResults.length > 0 && (
                <div className="pt-2 border-t border-border/50 max-h-48 overflow-y-auto">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2">
                    Pick the best match
                  </p>
                  <div className="space-y-0">
                    {groupedManual.map((group) => (
                      <div key={`m-${group.country}`}>
                        {groupedManual.length > 1 && (
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-1">
                            {group.country}
                          </div>
                        )}
                        {group.items.map((loc) => {
                          const primary =
                            loc.listTitle ??
                            `${loc.city}${loc.country ? `, ${loc.country}` : ""}`;
                          const secondary = loc.listSubtitle ?? loc.name;
                          return (
                            <div
                              key={`m-${loc.latitude}-${loc.longitude}-${primary}`}
                            >
                              <button
                                type="button"
                                className={cn(
                                  "w-full text-left flex items-start gap-2 px-2 py-2.5 rounded-lg",
                                  "hover:bg-muted/80 text-sm transition-colors",
                                )}
                                onClick={() => handleSelect(loc)}
                              >
                                <MapPin
                                  className={cn(
                                    "h-4 w-4 shrink-0 mt-0.5",
                                    accent.icon,
                                  )}
                                />
                                <span className="min-w-0">
                                  <span className="font-medium text-foreground block leading-snug">
                                    {primary}
                                  </span>
                                  {secondary && secondary !== primary && (
                                    <span className="text-xs text-muted-foreground line-clamp-2">
                                      {secondary}
                                    </span>
                                  )}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tip: you can also click the map to set{" "}
                {variant === "departure" ? "departure" : "destination"}.
              </p>
            </div>
          ) : (
            <>
              <div
                className="sticky bottom-0 px-4 py-1 rounded-2xl border-t border-border/60 bg-primary cursor-pointer backdrop-blur-sm"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
                  <p className="mt-2 text-xs text-center text-muted-foreground">
                    Mapbox token is not configured — use the map to drop a pin
                    for this stop.
                  </p>
                )}
              </div>
              {results.length === 0 && !searching && query.length > 1 ? (
                <div className="flex flex-col items-center py-8 gap-2 text-sm text-muted-foreground text-center px-4">
                  <Search className="h-5 w-5 opacity-40" />
                  <span>
                    No exact results for &quot;{query}&quot;. You can enter a
                    full address manually below.
                  </span>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
