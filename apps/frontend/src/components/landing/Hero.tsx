"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { containerPadding } from "@/lib/constants/layout";
import { MapPin } from "lucide-react";

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
import { toast } from "../ui/toast";

// Mock location data
const locations = [
  { code: "KGL", name: "Kigali International Airport", city: "Kigali" },
  { code: "KGL-C", name: "Kigali Central Station", city: "Kigali" },
  { code: "MZN", name: "Musanze", city: "Musanze" },
  { code: "RUB", name: "Rubavu", city: "Rubavu" },
  { code: "HYE", name: "Huye", city: "Huye" },
  { code: "KAY", name: "Kayonza", city: "Kayonza" },
  { code: "NYA", name: "Nyagatare", city: "Nyagatare" },
  { code: "RUS", name: "Rusizi", city: "Rusizi" },
];

export function Hero() {
  const router = useRouter();
  const { user } = useAuth();
  const [fromLocation, setFromLocation] = useState(locations[0].code);
  const [toLocation, setToLocation] = useState(locations[1].code);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(
    null,
  );

  const handleSearch = async () => {
    // Find selected location objects
    const fromLoc = locations.find((l) => l.code === fromLocation);
    const toLoc = locations.find((l) => l.code === toLocation);

    if (!fromLoc || !toLoc) return;

    // Set search filters
    setSearchFilters({
      fromLocation: fromLoc.name,
      toLocation: toLoc.name,
      fromCode: fromLoc.code,
      toCode: toLoc.code,
    });

    // Show modal with loading
    setIsModalOpen(true);
    setIsSearching(true);

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
    }, 1500);
  };

  const handleSelectResult = (result: any) => {
    // Close modal
    setIsModalOpen(false);

    // Store selected route and shuttle in sessionStorage
    sessionStorage.setItem(
      "selectedRoute",
      JSON.stringify({
        fromLocation: searchFilters?.fromLocation,
        toLocation: searchFilters?.toLocation,
        fromCode: searchFilters?.fromCode,
        toCode: searchFilters?.toCode,
        shuttle: result,
      }),
    );

    // Navigate to booking page
    router.push("/booking");
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center pt-10 overflow-hidden">
        {/* Background Image with Overlay */}
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

        <div
          className={`mx-auto max-w-7xl w-full ${containerPadding.default} relative z-10`}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
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

            {/* Right Content - Search Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-2xl shadow-xl p-8 max-w-xl ml-auto w-full border border-border"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Find Your Shuttle
              </h2>

              {/* From Location */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block text-muted-foreground">
                  From
                </Label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger className="w-full h-14">
                    <MapPin className="h-5 w-5 text-primary mr-2" />
                    <SelectValue placeholder="Select departure location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.code} value={loc.code}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{loc.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {loc.city}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To Location */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block text-muted-foreground">
                  To
                </Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger className="w-full h-14">
                    <MapPin className="h-5 w-5 text-primary mr-2" />
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.code} value={loc.code}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{loc.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {loc.city}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={handleSearch}
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

      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={searchFilters}
        isLoading={isSearching}
        onSelectResult={handleSelectResult}
      />
    </>
  );
}
