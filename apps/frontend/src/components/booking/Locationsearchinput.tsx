"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";
import { forwardGeocode, type MapLocation } from "@/hooks/useMapBooking";

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

  // Debounced forward geocode
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
        const locs = await forwardGeocode(query, token);
        setResults(locs);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [query]);

  // Close on outside click
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
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [onChange],
  );

  const colorClass = { emerald: "text-emerald-500", rose: "text-rose-500" }[
    pinColor
  ];
  const ringClass = { emerald: "ring-emerald-300", rose: "ring-rose-300" }[
    pinColor
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      <label
        className="block text-xs font-semibold uppercase tracking-wider
                        text-muted-foreground mb-1.5"
      >
        {label}
      </label>

      <div
        role="combobox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
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
            placeholder={open ? `Type a city or address…` : placeholder}
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
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

      {/* Dropdown */}
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
          ) : results.length === 0 && !searching ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Start typing a city or address…
            </div>
          ) : (
            <ul>
              {results.map((loc, i) => (
                <li
                  key={`${loc.latitude}-${loc.longitude}`}
                  onClick={() => handleSelect(loc)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/70 transition-colors",
                    i !== results.length - 1 && "border-b border-border/50",
                  )}
                >
                  <MapPin
                    className={cn("h-4 w-4 shrink-0 mt-0.5", colorClass)}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {loc.city}
                      {loc.country ? `, ${loc.country}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {loc.name}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
