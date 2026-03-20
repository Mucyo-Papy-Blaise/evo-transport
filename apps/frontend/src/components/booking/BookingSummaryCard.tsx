"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bus,
  Clock,
  Ruler,
  Wallet,
  ArrowRight,
  AlertTriangle,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/utils";
import type { MapLocation, RoutePriceResult } from "@/hooks/useMapBooking";

interface BookingSummaryCardProps {
  from: MapLocation | null;
  to: MapLocation | null;
  routeInfo: RoutePriceResult | null;
  isLoading: boolean;
  error: string | null;
  passengers: number;
  onPassengersChange: (n: number) => void;
  /** Standard route: go straight to /booking */
  onBookNow: () => void;
  /** Long distance >400 km: open admin request modal */
  onLongDistance: () => void;
}

export function BookingSummaryCard({
  from,
  to,
  routeInfo,
  isLoading,
  error,
  passengers,
  onPassengersChange,
  onBookNow,
  onLongDistance,
}: BookingSummaryCardProps) {
  const total = routeInfo ? routeInfo.price * passengers : 0;
  const ready = !!(from && to && routeInfo && !isLoading);

  return (
    <div className="rounded-xl border-2 border-primary/10 bg-card shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 to-transparent px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Bus className="h-4 w-4 text-primary" />
          Trip Summary
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* From → To */}
        <div className="flex items-stretch gap-3">
          <div className="flex flex-col items-center pt-1 gap-1">
            <MapPin
              className="h-4 w-4 text-emerald-500 shrink-0"
              fill="currentColor"
            />
            <div className="w-px flex-1 border-l border-dashed border-muted-foreground/30" />
            <MapPin
              className="h-4 w-4 text-rose-500 shrink-0"
              fill="currentColor"
            />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                From
              </p>
              <p
                className={cn(
                  "text-sm font-medium leading-snug",
                  from ? "text-foreground" : "text-muted-foreground italic",
                )}
              >
                {from
                  ? `${from.city}, ${from.country}`
                  : "Click map or search…"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                To
              </p>
              <p
                className={cn(
                  "text-sm font-medium leading-snug",
                  to ? "text-foreground" : "text-muted-foreground italic",
                )}
              >
                {to ? `${to.city}, ${to.country}` : "Click map or search…"}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <AnimatePresence mode="wait">
          {/* Error */}
          {error && (
            <motion.p
              key="err"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-destructive flex items-center gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {error}
            </motion.p>
          )}

          {/* Loading */}
          {isLoading && !error && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching price from server…
            </motion.div>
          )}

          {/* Route info */}
          {!isLoading && routeInfo && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Long distance banner */}
              {routeInfo.isLongDistance && (
                <div
                  className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30
                                border border-amber-200 dark:border-amber-800 p-3 text-xs
                                text-amber-700 dark:text-amber-400"
                >
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>
                    Route exceeds 400 km — requires{" "}
                    <strong>admin approval</strong>. Submit a request and we'll
                    contact you with a quote.
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    Icon: Ruler,
                    label: "Distance",
                    value: `${routeInfo.distance} km`,
                  },
                  {
                    Icon: Clock,
                    label: "Est. time",
                    value: routeInfo.estimatedDuration,
                  },
                  {
                    Icon: Wallet,
                    label: "Per person",
                    value: `${routeInfo.price.toLocaleString()} ${routeInfo.currency}`,
                    accent: true,
                  },
                ].map(({ Icon, label, value, accent }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                      {label}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        accent && "text-primary font-bold",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Passenger counter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  Passengers
                </div>
                <div className="flex items-center gap-2">
                  {[-1, null, 1].map((delta, i) =>
                    delta === null ? (
                      <span
                        key="val"
                        className="w-6 text-center text-sm font-bold"
                      >
                        {passengers}
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() =>
                          onPassengersChange(
                            Math.min(12, Math.max(1, passengers + delta)),
                          )
                        }
                        disabled={
                          (delta === -1 && passengers <= 1) ||
                          (delta === 1 && passengers >= 12)
                        }
                        className="w-7 h-7 rounded-full border border-border bg-background flex items-center
                                   justify-center font-bold text-sm hover:bg-muted transition-colors disabled:opacity-30"
                      >
                        {delta === -1 ? "−" : "+"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
                <span className="text-sm text-muted-foreground">
                  Total estimate
                </span>
                <span className="text-base font-bold text-primary">
                  {total.toLocaleString()} {routeInfo.currency}
                </span>
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {!isLoading && !routeInfo && !error && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-muted-foreground py-4"
            >
              {!from
                ? "Set a departure point to begin"
                : "Now set your destination"}
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA */}
        {routeInfo?.isLongDistance ? (
          <Button
            className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white gap-2"
            onClick={onLongDistance}
            disabled={!ready}
          >
            <AlertTriangle className="h-4 w-4" />
            Request Long Distance Trip
          </Button>
        ) : (
          <Button
            className="w-full h-11 gap-2"
            onClick={onBookNow}
            disabled={!ready}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Calculating…
              </>
            ) : (
              <>
                Book Now <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
