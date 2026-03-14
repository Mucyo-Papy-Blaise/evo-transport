'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bus,
  Clock,
  Users,
  Wifi,
  BatteryCharging,
  Coffee,
  ChevronRight,
  MapPin,
  Zap,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/utils';
import { mockShuttles, type Shuttle } from '@/lib/mock-data';
import type { SearchFilters } from '@/types';

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters | null;
  isLoading: boolean;
  onSelectResult: (shuttle: Shuttle) => void;
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3 w-3" />,
  AC: <Zap className="h-3 w-3" />,
  Refreshments: <Coffee className="h-3 w-3" />,
  'USB Charger': <BatteryCharging className="h-3 w-3" />,
  Charging: <BatteryCharging className="h-3 w-3" />,
  Water: <Coffee className="h-3 w-3" />,
  'Panoramic Roof': <Star className="h-3 w-3" />,
};

const vehicleTypeColor: Record<string, string> = {
  'Luxury Bus': 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'Electric SUV': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Minibus: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'Electric Sedan': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
};

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="h-7 w-24 bg-muted rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchResultsModal({
  isOpen,
  onClose,
  filters,
  isLoading,
  onSelectResult,
}: SearchResultsModalProps) {
  const [results, setResults] = useState<Shuttle[]>([]);

  useEffect(() => {
    if (!filters?.fromCode || !filters?.toCode) {
      setResults([]);
      return;
    }

    const routeKey = `${filters.fromCode}-${filters.toCode}`;
    const reverseKey = `${filters.toCode}-${filters.fromCode}`;

    const shuttle = mockShuttles[routeKey] || mockShuttles[reverseKey];

    // If there's a direct match, return it. Otherwise fall back to all shuttles
    // so the user always sees options (real API would filter properly)
    if (shuttle) {
      setResults([shuttle]);
    } else {
      // No direct route found — show all available options as alternatives
      setResults(Object.values(mockShuttles));
    }
  }, [filters]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet — slides up from bottom on mobile, centered on desktop */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'fixed z-50 bg-background shadow-2xl',
              // Mobile: full-width sheet from bottom
              'bottom-0 left-0 right-0 rounded-t-2xl max-h-[90dvh]',
              // Desktop: centered dialog
              'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
              'md:rounded-2xl md:w-full md:max-w-2xl md:max-h-[85vh]',
            )}
          >
            {/* Drag handle (mobile) */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Available Shuttles
                </h2>
                {filters && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate max-w-[160px]">{filters.fromLocation}</span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate max-w-[160px]">{filters.toLocation}</span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results list */}
            <div className="overflow-y-auto px-6 py-4 space-y-3"
              style={{ maxHeight: 'calc(90dvh - 100px)' }}
            >
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : results.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bus className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No shuttles found for this route</p>
                  <p className="text-sm mt-1">Try a different origin or destination</p>
                </div>
              ) : (
                <>
                  {results.length === 1 ? null : (
                    <p className="text-xs text-muted-foreground pb-1">
                      No direct shuttle found for this exact route. Showing all available options.
                    </p>
                  )}

                  {results.map((shuttle, idx) => (
                    <motion.div
                      key={shuttle.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className={cn(
                        'group relative rounded-xl border border-border bg-card hover:border-primary/50',
                        'hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden',
                      )}
                      onClick={() => onSelectResult(shuttle)}
                    >
                      {/* Availability indicator stripe */}
                      <div
                        className={cn(
                          'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
                          shuttle.availableSeats <= 3
                            ? 'bg-amber-400'
                            : shuttle.availableSeats <= 8
                              ? 'bg-emerald-400'
                              : 'bg-primary',
                        )}
                      />

                      <div className="pl-4 pr-5 py-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Bus className="h-5 w-5 text-primary" />
                          </div>

                          {/* Main content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-foreground leading-tight">
                                  {shuttle.provider}
                                </p>
                                <span
                                  className={cn(
                                    'inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5',
                                    vehicleTypeColor[shuttle.vehicleType] ??
                                      'bg-muted text-muted-foreground',
                                  )}
                                >
                                  {shuttle.vehicleType}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xl font-bold text-primary leading-tight">
                                  {shuttle.price.toLocaleString()}
                                  <span className="text-xs font-normal text-muted-foreground ml-1">
                                    FRw
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">per person</p>
                              </div>
                            </div>

                            {/* Times & duration */}
                            <div className="flex items-center gap-3 mt-2.5 text-sm">
                              <div className="flex items-center gap-1 text-foreground font-medium">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                {shuttle.departureTime}
                              </div>
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              <span className="text-foreground font-medium">
                                {shuttle.arrivalTime}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                ({shuttle.duration})
                              </span>
                              {shuttle.distance && (
                                <span className="text-muted-foreground text-xs ml-auto">
                                  {shuttle.distance} km
                                </span>
                              )}
                            </div>

                            {/* Seats & amenities */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-wrap gap-1.5">
                                {shuttle.amenities.map((a) => (
                                  <span
                                    key={a}
                                    className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                                  >
                                    {amenityIcons[a]}
                                    {a}
                                  </span>
                                ))}
                              </div>
                              <div
                                className={cn(
                                  'flex items-center gap-1 text-xs font-medium shrink-0 ml-2',
                                  shuttle.availableSeats <= 3
                                    ? 'text-amber-600'
                                    : 'text-emerald-600',
                                )}
                              >
                                <Users className="h-3 w-3" />
                                {shuttle.availableSeats <= 3
                                  ? `Only ${shuttle.availableSeats} left`
                                  : `${shuttle.availableSeats} seats`}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CTA row */}
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Tap to select this shuttle
                          </p>
                          <Button
                            size="sm"
                            className="h-8 text-xs gap-1 group-hover:gap-2 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectResult(shuttle);
                            }}
                          >
                            Select
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}