// components/landing/Hero.tsx
'use client';

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { containerPadding } from "@/lib/constants/layout";
import { MapPin, ArrowLeftRight, AlertTriangle, Ruler } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Components
import { SearchResultsModal } from "@/components/booking/SearchResultsModal";
import { SearchFilters } from "@/types";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/utils/utils";

// Mock data
import { locations, getRouteDistance, isLongDistance } from "@/lib/mock-data";

export function Hero() {
  const router = useRouter();
  const { user } = useAuth();

  const [fromLocation, setFromLocation] = useState(locations[0].code);
  const [toLocation, setToLocation] = useState(locations[2].code);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);
  const [distance, setDistance] = useState(0);

  // Live distance as user selects locations
  const liveDistance = getRouteDistance(fromLocation, toLocation);
  const liveIsLong = isLongDistance(liveDistance);
  const sameLocation = fromLocation === toLocation;

  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  const handleSearch = () => {
    if (sameLocation) return;

    const fromLoc = locations.find((l) => l.code === fromLocation);
    const toLoc = locations.find((l) => l.code === toLocation);
    if (!fromLoc || !toLoc) return;

    const routeDistance = getRouteDistance(fromLoc.code, toLoc.code);
    setDistance(routeDistance);

    setSearchFilters({
      fromLocation: fromLoc.name,
      toLocation: toLoc.name,
      fromCode: fromLoc.code,
      toCode: toLoc.code,
    });

    // Always open shuttle search modal — long distance check happens on booking page
    setIsModalOpen(true);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1300);
  };

  const handleSelectResult = (result: any) => {
    setIsModalOpen(false);

    sessionStorage.setItem(
      "selectedRoute",
      JSON.stringify({
        fromLocation: searchFilters?.fromLocation,
        toLocation: searchFilters?.toLocation,
        fromCode: searchFilters?.fromCode,
        toCode: searchFilters?.toCode,
        distance,
        shuttle: result,
      })
    );

    router.push("/booking");
  };

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

            {/* Left — headline */}
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

            {/* Right — search card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-2xl shadow-xl p-8 max-w-xl ml-auto w-full border border-border"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Find Your Shuttle
              </h2>

              {/* From */}
              <div className="mb-3">
                <Label className="text-sm font-medium mb-2 block text-muted-foreground">
                  From
                </Label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger className="w-full h-14">
                    <MapPin className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <SelectValue placeholder="Select departure location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.code} value={loc.code}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{loc.name}</span>
                          <span className="text-xs text-muted-foreground">{loc.city}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap */}
              <div className="flex justify-center my-1">
                <button
                  onClick={handleSwap}
                  className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-colors"
                  title="Swap locations"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                </button>
              </div>

              {/* To */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block text-muted-foreground">
                  To
                </Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger className="w-full h-14">
                    <MapPin className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.code} value={loc.code}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{loc.name}</span>
                          <span className="text-xs text-muted-foreground">{loc.city}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Live distance indicator */}
              <AnimatePresence>
                {liveDistance > 0 && !sameLocation && (
                  <motion.div
                    key="distance-pill"
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-5"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 text-xs px-3 py-2 rounded-lg",
                        liveIsLong
                          ? "bg-amber-50 border border-amber-200 text-amber-700"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {liveIsLong
                        ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        : <Ruler className="h-3.5 w-3.5 shrink-0" />
                      }
                      <span>
                        <strong>{liveDistance} km</strong>
                        {liveIsLong
                          ? " — long distance route (special request required at checkout)"
                          : " route distance"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Same location warning */}
              {sameLocation && (
                <p className="text-xs text-destructive mb-4 text-center">
                  Origin and destination must be different
                </p>
              )}

              {/* Search Button */}
              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={handleSearch}
                disabled={sameLocation}
                asChild
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Search Shuttles
                </motion.button>
              </Button>

              {/* Login prompt */}
              {!user && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Already have an account?{" "}
                  <button
                    onClick={() => (window.location.href = "/login")}
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

      {/* Search Results Modal — used for ALL routes, long or short */}
      <SearchResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={searchFilters}
        isLoading={isSearching}
        onSelectResult={handleSelectResult}
        distance={distance}
      />
    </>
  );
}