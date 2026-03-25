"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  RotateCcw,
  ArrowRight,
  MapPin,
  Ruler,
  Clock,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  SunMedium,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

import { useMapBooking } from "@/hooks/useMapBooking";
import { MapView } from "./Mapview";
import { LocationSearchInput } from "./Locationsearchinput";

function seasonLabel(season: string) {
  const s = season.replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function Step({
  num,
  label,
  done,
  active,
}: {
  num: number;
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300",
          done
            ? "bg-primary text-primary-foreground"
            : active
              ? "bg-primary/15 text-primary ring-2 ring-primary/30"
              : "bg-muted text-muted-foreground",
        )}
      >
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : num}
      </div>
      <span
        className={cn(
          "text-xs font-medium transition-colors duration-200",
          active || done ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MapBookingSection() {
  const router = useRouter();

  const {
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
    pricing,
    isPricingLoading,
    isPricingError,
  } = useMapBooking();

  const bothSelected = !!(from && to);
  const currentStep = !from ? 1 : !to ? 2 : 3;

  const handleBookNow = useCallback(() => {
    if (!from || !to || !routeInfo) return;

    // Write exactly what BookingPage reads from sessionStorage
    sessionStorage.setItem(
      "selectedRoute",
      JSON.stringify({
        fromLocation: from.name,
        toLocation: to.name,
        fromCity: from.city,
        toCity: to.city,
        fromCode: "",
        toCode: "",
        distance: routeInfo.distance,
        shuttle: {
          id: "map-booking",
          provider: "EVO Transport",
          vehicleType: "Shuttle",
          departureTime: "09:00",
          arrivalTime: "",
          duration: routeInfo.estimatedDuration,
          price: routeInfo.price,
          currency: routeInfo.currency,
          availableSeats: 12,
          amenities: [],
          distance: routeInfo.distance,
        },
      }),
    );

    router.push("/booking");
  }, [from, to, routeInfo, router]);

  return (
    <section id="map-booking" className="relative py-20 overflow-hidden">
      {/* ── Subtle background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/40 via-background to-primary/5 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
          opacity: 0.4,
        }}
      />

      <div className="relative container max-w-6xl mx-auto px-4">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">
            Route Planner
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Where are you <span className="text-po italic">going?</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Pin your pickup and drop-off directly on the map, or type to search
            any city in Europe.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {isPricingLoading ? (
              <div
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                Loading seasonal rate…
              </div>
            ) : pricing ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs text-foreground shadow-sm">
                <SunMedium className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  <span className="font-semibold">
                    {seasonLabel(pricing.season)}
                  </span>
                  <span className="text-muted-foreground"> season · </span>
                  <span className="font-medium tabular-nums">
                    {pricing.effectivePricePerKm} {pricing.currency}/km
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">
                    {" "}
                    · European meteorological seasons
                  </span>
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground">
                {isPricingError
                  ? "Could not load seasonal rates — estimate uses a default per km."
                  : "Seasonal rates unavailable — estimate uses a default per km."}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Main card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-background shadow-xl overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            {/* ── LEFT: Controls ── */}
            <div
              className="w-full lg:w-[300px] xl:w-[320px] shrink-0 flex flex-col
                            border-b lg:border-b-0 lg:border-r border-border"
            >
              {/* Step progress bar */}
              <div className="px-5 pt-5 pb-4 border-b border-border/60 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Step
                    num={1}
                    label="From"
                    done={!!from}
                    active={currentStep === 1}
                  />
                  <div className="flex-1 h-px bg-border" />
                  <Step
                    num={2}
                    label="To"
                    done={!!to}
                    active={currentStep === 2}
                  />
                  <div className="flex-1 h-px bg-border" />
                  <Step
                    num={3}
                    label="Book"
                    done={false}
                    active={currentStep === 3}
                  />
                </div>
              </div>

              {/* Inputs */}
              <div className="p-5 flex flex-col gap-3 flex-1">
                {/* Pin mode hint */}
                <div
                  className={cn(
                    "flex items-center gap-2 text-[11px] font-semibold px-3 py-2 rounded-lg transition-all duration-300",
                    pinMode === "from"
                      ? "bg-emerald-50 text-button"
                      : "bg-rose-50  text-rose-700 dark:text-rose-400",
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      pinMode === "from" ? "bg-emerald-500" : "bg-rose-500",
                    )}
                  />
                  {pinMode === "from"
                    ? "Click map to set departure point"
                    : "Click map to set destination"}
                </div>

                {/* From field */}
                <div className="relative">
                  <LocationSearchInput
                    label="Departure"
                    placeholder="Search city or click map…"
                    value={from}
                    onChange={(loc) => {
                      setFrom(loc);
                      if (loc) setPinMode("to");
                    }}
                    pinColor="emerald"
                  />
                </div>

                {/* Swap button */}
                <div className="flex items-center gap-3 -my-1">
                  <div className="flex-1 h-px border-t border-dashed border-border" />
                  <button
                    onClick={swapLocations}
                    disabled={!from && !to}
                    title="Swap locations"
                    className="p-1.5 rounded-full border border-border bg-background
                               hover:bg-muted hover:border-primary/30 transition-all
                               disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <div className="flex-1 h-px border-t border-dashed border-border" />
                </div>

                {/* To field */}
                <LocationSearchInput
                  label="Destination"
                  placeholder="Search city or click map…"
                  value={to}
                  onChange={setTo}
                  pinColor="rose"
                />

                {/* ── Route info ── */}
                <AnimatePresence>
                  {bothSelected && (
                    <motion.div
                      key="route-info"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isLoading ? (
                        <div
                          className="flex items-center justify-center gap-2 py-3
                                        text-xs text-muted-foreground rounded-xl bg-muted/30 border border-border"
                        >
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Calculating route…
                        </div>
                      ) : routeInfo ? (
                        <div
                          className={cn(
                            "rounded-xl border overflow-hidden",
                            routeInfo.isLongDistance
                              ? "border-amber-200 dark:border-amber-800"
                              : "border-primary/20",
                          )}
                        >
                          {/* Locations summary */}
                          <div className="px-3 py-2.5 bg-muted/30 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <MapPin
                                className="h-3 w-3 text-emerald-500 shrink-0"
                                fill="currentColor"
                              />
                              <span className="text-xs text-foreground font-medium truncate">
                                {from?.city}, {from?.country}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin
                                className="h-3 w-3 text-rose-500 shrink-0"
                                fill="currentColor"
                              />
                              <span className="text-xs text-foreground font-medium truncate">
                                {to?.city}, {to?.country}
                              </span>
                            </div>
                          </div>

                          {/* Stats row */}
                          <div
                            className={cn(
                              "grid grid-cols-3 divide-x divide-border text-center",
                              routeInfo.isLongDistance
                                ? "bg-amber-50/80 dark:bg-amber-950/20"
                                : "bg-primary/5",
                            )}
                          >
                            {[
                              {
                                icon: Ruler,
                                value: `${routeInfo.distance} km`,
                                label: "Distance",
                              },
                              {
                                icon: Clock,
                                value: routeInfo.estimatedDuration,
                                label: "Est. time",
                              },
                              {
                                icon: null,
                                value: `${routeInfo.price.toLocaleString()} ${routeInfo.currency}`,
                                label: "From /person",
                                accent: true,
                              },
                            ].map(({ icon: Icon, value, label, accent }) => (
                              <div key={label} className="py-2.5 px-1">
                                <div
                                  className={cn(
                                    "text-sm font-bold leading-tight",
                                    accent ? "text-primary" : "text-foreground",
                                  )}
                                >
                                  {value}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  {label}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Long distance warning */}
                          {routeInfo.isLongDistance && (
                            <div
                              className="flex items-start gap-2 px-3 py-2.5
                                            bg-amber-50 dark:bg-amber-950/20
                                            border-t border-amber-200 dark:border-amber-800
                                            text-[11px] text-amber-700 dark:text-amber-400"
                            >
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px text-amber-500" />
                              Over 400 km — admin approval needed.
                            </div>
                          )}
                        </div>
                      ) : error ? (
                        <p
                          className="text-xs text-destructive px-3 py-2 rounded-lg
                                      bg-destructive/5 border border-destructive/20"
                        >
                          {error}
                        </p>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Spacer */}
                <div className="flex-1" />

                {/* CTA — same button for all routes, long distance handled on booking page */}
                <div className="space-y-2 pt-1">
                  {
                    <Button
                      className="w-full h-10 text-sm gap-2"
                      onClick={handleBookNow}
                      disabled={!bothSelected || isLoading || !routeInfo}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                          Calculating…
                        </>
                      ) : (
                        <>
                          Continue to Booking{" "}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  }

                  {(from || to) && (
                    <button
                      onClick={clearRoute}
                      className="w-full flex items-center justify-center gap-1.5 text-xs
                                 text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Clear and start over
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Map (compact, fixed height) ── */}
            <div className="flex-1 relative" style={{ height: 460 }}>
              {/* Map label badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
                {from && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm
                               border border-border rounded-full px-2.5 py-1 shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[11px] font-semibold text-foreground max-w-[140px] truncate">
                      {from.city}
                    </span>
                  </motion.div>
                )}
                {to && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm
                               border border-border rounded-full px-2.5 py-1 shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-[11px] font-semibold text-foreground max-w-[140px] truncate">
                      {to.city}
                    </span>
                  </motion.div>
                )}
              </div>

              <MapView
                from={from}
                to={to}
                pinMode={pinMode}
                isGeocoding={isGeocoding}
                onMapClick={handleMapClick}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Bottom hint ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center text-xs text-muted-foreground"
        >
          Routes over 400 km are handled as special requests and reviewed by our
          team within 24h.
        </motion.p>
      </div>
    </section>
  );
}
