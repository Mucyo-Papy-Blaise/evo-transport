// components/landing/Hero.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format, startOfDay } from 'date-fns';
import { containerPadding } from '@/lib/constants/layout';
import {
  MapPin,
  ArrowLeftRight,
  CalendarIcon,
  Users,
  AlertTriangle,
} from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Modals
import { SearchResultsModal } from '@/components/booking/SearchResultsModal';
import { LongDistanceModal } from '@/components/booking/LongDistanceModal';

// Types & mock data
import type { SearchFilters } from '@/types';
import type { Shuttle } from '@/lib/mock-data';
import { locations, getRouteDistance, isLongDistance } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/utils/utils';

export function Hero() {
  const router = useRouter();
  const { user } = useAuth();

  // Search form state
  const [fromLocation, setFromLocation] = useState(locations[0].code);
  const [toLocation, setToLocation] = useState(locations[2].code); // default to a different location
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [passengers, setPassengers] = useState(1);
  const [dateOpen, setDateOpen] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLongDistanceModalOpen, setIsLongDistanceModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);
  const [distance, setDistance] = useState(0);

  // Swap from/to
  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  const handleSearch = () => {
    const fromLoc = locations.find((l) => l.code === fromLocation);
    const toLoc = locations.find((l) => l.code === toLocation);

    if (!fromLoc || !toLoc) return;
    if (fromLoc.code === toLoc.code) return; // same location — do nothing

    const routeDistance = getRouteDistance(fromLoc.code, toLoc.code);
    setDistance(routeDistance);

    setSearchFilters({
      fromLocation: fromLoc.name,
      toLocation: toLoc.name,
      fromCode: fromLoc.code,
      toCode: toLoc.code,
      departureDate: format(departureDate, 'yyyy-MM-dd'),
      passengers,
    });

    if (isLongDistance(routeDistance)) {
      setIsLongDistanceModalOpen(true);
    } else {
      setIsModalOpen(true);
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 1200);
    }
  };

  const handleSelectResult = (shuttle: Shuttle) => {
    setIsModalOpen(false);

    sessionStorage.setItem(
      'selectedRoute',
      JSON.stringify({
        fromLocation: searchFilters?.fromLocation,
        toLocation: searchFilters?.toLocation,
        fromCode: searchFilters?.fromCode,
        toCode: searchFilters?.toCode,
        distance,
        shuttle: {
          ...shuttle,
          // pass through the passenger count so booking page can pre-fill
          selectedPassengers: passengers,
        },
      }),
    );

    router.push('/booking');
  };

  // Derive current route distance to show indicator on the form in real-time
  const currentDistance = getRouteDistance(fromLocation, toLocation);
  const currentIsLong = isLongDistance(currentDistance);

  return (
    <>
      <section className="relative min-h-screen flex items-center pt-10 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/heroo.jpg"
            alt="background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/70" />
        </div>

        <div className={`mx-auto max-w-7xl w-full ${containerPadding.default} relative z-10`}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Book Your Shuttle <br />
                <span className="text-header-bg">with Ease</span>
              </h1>
              <p className="mt-4 text-lg text-white/80 max-w-lg">
                Reliable airport and city transfers across Rwanda. Travel
                comfortably with our premium shuttle service.
              </p>
            </motion.div>

            {/* Right: search card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-2xl shadow-xl p-8 max-w-xl ml-auto w-full border border-border"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Find Your Shuttle
              </h2>

              {/* From / To with swap */}
              <div className="relative mb-6">
                <div className="space-y-3">
                  {/* From */}
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                      From
                    </Label>
                    <Select value={fromLocation} onValueChange={setFromLocation}>
                      <SelectTrigger className="w-full h-12">
                        <MapPin className="h-4 w-4 text-primary mr-2 shrink-0" />
                        <SelectValue placeholder="Select departure" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.code} value={loc.code}>
                            <div className="flex flex-col py-0.5">
                              <span className="font-medium">{loc.name}</span>
                              <span className="text-xs text-muted-foreground">{loc.city}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Swap button */}
                  <div className="flex justify-center -my-1">
                    <button
                      onClick={handleSwap}
                      className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors border border-primary/20"
                      title="Swap locations"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                    </button>
                  </div>

                  {/* To */}
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                      To
                    </Label>
                    <Select value={toLocation} onValueChange={setToLocation}>
                      <SelectTrigger className="w-full h-12">
                        <MapPin className="h-4 w-4 text-primary mr-2 shrink-0" />
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.code} value={loc.code}>
                            <div className="flex flex-col py-0.5">
                              <span className="font-medium">{loc.name}</span>
                              <span className="text-xs text-muted-foreground">{loc.city}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Distance indicator */}
              {currentDistance > 0 && (
                <motion.div
                  key={`${fromLocation}-${toLocation}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    'mb-4 flex items-center gap-2 text-xs px-3 py-2 rounded-lg',
                    currentIsLong
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {currentIsLong && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                  <span>
                    {currentDistance} km
                    {currentIsLong
                      ? ' — long distance route, special arrangements needed'
                      : ' route distance'}
                  </span>
                </motion.div>
              )}

              {/* Date & Passengers row */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Date picker */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    Date
                  </Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full h-12 justify-start text-left font-normal text-sm',
                          !departureDate && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="h-4 w-4 text-primary mr-2 shrink-0" />
                        {departureDate ? format(departureDate, 'MMM d') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={(d) => {
                          if (d) {
                            setDepartureDate(d);
                            setDateOpen(false);
                          }
                        }}
                        disabled={(date) => date < startOfDay(new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Passengers */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    Passengers
                  </Label>
                  <Select
                    value={passengers.toString()}
                    onValueChange={(v) => setPassengers(parseInt(v, 10))}
                  >
                    <SelectTrigger className="w-full h-12">
                      <Users className="h-4 w-4 text-primary mr-2 shrink-0" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} {n === 1 ? 'passenger' : 'passengers'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={handleSearch}
                disabled={fromLocation === toLocation}
                asChild
              >
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {currentIsLong ? 'Request Arrangement' : 'Search Shuttles'}
                </motion.button>
              </Button>

              {fromLocation === toLocation && (
                <p className="text-xs text-center text-destructive mt-2">
                  Origin and destination must be different
                </p>
              )}

              {/* Login prompt */}
              {!user && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Already have an account?{' '}
                  <button
                    onClick={() => (window.location.href = '/login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Log in
                  </button>
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-linear-to-t from-background to-transparent" />
      </section>

      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={searchFilters}
        isLoading={isSearching}
        onSelectResult={handleSelectResult}
      />

      {/* Long Distance Modal */}
      <LongDistanceModal
        isOpen={isLongDistanceModalOpen}
        onClose={() => setIsLongDistanceModalOpen(false)}
        fromLocation={searchFilters?.fromLocation ?? ''}
        toLocation={searchFilters?.toLocation ?? ''}
        fromCode={searchFilters?.fromCode ?? ''}
        toCode={searchFilters?.toCode ?? ''}
        distance={distance}
      />
    </>
  );
}