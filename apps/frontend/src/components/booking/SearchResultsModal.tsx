"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bus,
  Clock,
  Users,
  Wifi,
  Coffee,
  BatteryCharging,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { SearchResult, SearchFilters } from "@/types";
import { cn } from "@/utils/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { Label } from "@/components/ui/label"; // Fixed import
import { Input } from "@/components/ui/input";

// Mock results for demo
const mockResults: SearchResult[] = [
  {
    id: "1",
    provider: "Royal Express",
    vehicleType: "Luxury Bus",
    departureTime: "08:00",
    arrivalTime: "10:30",
    duration: "2h 30m",
    price: 15000,
    currency: "RWF",
    availableSeats: 12,
    amenities: ["WiFi", "AC", "Refreshments", "USB Charger"],
  },
  {
    id: "2",
    provider: "Volcano Safari",
    vehicleType: "Electric SUV",
    departureTime: "09:15",
    arrivalTime: "11:15",
    duration: "2h 00m",
    price: 25000,
    currency: "RWF",
    availableSeats: 4,
    amenities: ["WiFi", "AC", "Water", "Charging", "Panoramic Roof"],
  },
  {
    id: "3",
    provider: "Kigali Express",
    vehicleType: "Minibus",
    departureTime: "10:30",
    arrivalTime: "13:00",
    duration: "2h 30m",
    price: 12000,
    currency: "RWF",
    availableSeats: 8,
    amenities: ["AC", "USB Charger"],
  },
  {
    id: "4",
    provider: "Royal Express",
    vehicleType: "Luxury Bus",
    departureTime: "12:00",
    arrivalTime: "14:30",
    duration: "2h 30m",
    price: 15000,
    currency: "RWF",
    availableSeats: 18,
    amenities: ["WiFi", "AC", "Refreshments", "USB Charger"],
  },
  {
    id: "5",
    provider: "Volcano Safari",
    vehicleType: "Electric Sedan",
    departureTime: "14:00",
    arrivalTime: "16:00",
    duration: "2h 00m",
    price: 22000,
    currency: "RWF",
    availableSeats: 3,
    amenities: ["WiFi", "AC", "Water", "Charging"],
  },
];

// Amenity icons mapping
const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3 w-3" />,
  AC: <Coffee className="h-3 w-3" />,
  Refreshments: <Coffee className="h-3 w-3" />,
  "USB Charger": <BatteryCharging className="h-3 w-3" />,
  Charging: <BatteryCharging className="h-3 w-3" />,
  Water: <Coffee className="h-3 w-3" />,
  "Panoramic Roof": <Coffee className="h-3 w-3" />,
};

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters | null;
  isLoading: boolean;
  results?: SearchResult[];
  onSelectResult: (result: SearchResult & { guestEmail?: string }) => void;
}

export function SearchResultsModal({
  isOpen,
  onClose,
  filters,
  isLoading,
  results = mockResults,
  onSelectResult,
}: SearchResultsModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestEmailError, setGuestEmailError] = useState("");
  const { user } = useAuth();

  const validateEmail = () => {
    if (!user && !guestEmail) {
      setGuestEmailError("Email is required");
      return false;
    }
    if (!user && !/\S+@\S+\.\S+/.test(guestEmail)) {
      setGuestEmailError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleBook = () => {
    const selected = results.find((r) => r.id === selectedId);
    if (selected) {
      onSelectResult(selected);
    }
  };

  const handleSelect = (result: SearchResult) => {
    setSelectedId(result.id);
  };

  const getRouteDisplay = () => {
    if (!filters) return "";
    return `${filters.fromLocation} → ${filters.toLocation}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0 flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            Available Shuttles
          </DialogTitle>
          {filters && (
            <DialogDescription className="text-muted-foreground mt-1">
              {getRouteDisplay()}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6 py-2 min-h-0 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4 py-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-7 w-24" />
                      <Skeleton className="h-9 w-28 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Shuttles Found
              </h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                We couldn&lsquo;t find any shuttles matching your search
                criteria. Please try different locations.
              </p>
              <Button variant="outline" onClick={onClose}>
                Modify Search
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {results.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "bg-card border rounded-xl p-5 transition-all cursor-pointer hover:shadow-md",
                    selectedId === result.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50",
                  )}
                  onClick={() => handleSelect(result)}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {result.provider}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {result.vehicleType}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-center">
                          <div className="font-bold text-foreground">
                            {result.departureTime}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Depart
                          </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center px-4">
                          <div className="h-0.5 flex-1 bg-border relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-muted-foreground bg-card px-1" />
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-foreground">
                            {result.arrivalTime}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Arrive
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground ml-2">
                          {result.duration}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {result.amenities.map((amenity: any) => (
                          <Badge
                            key={amenity}
                            variant="secondary"
                            className="bg-muted text-muted-foreground flex items-center gap-1"
                          >
                            {amenityIcons[amenity]}
                            <span>{amenity}</span>
                          </Badge>
                        ))}
                        <Badge
                          variant="outline"
                          className="border-border text-muted-foreground flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" />
                          {result.availableSeats} seats left
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:gap-2 md:min-w-[140px]">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {result.price.toLocaleString()} FRw
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per person
                        </div>
                      </div>
                      <Button
                        variant={
                          selectedId === result.id ? "default" : "outline"
                        }
                        className={cn(
                          "min-w-25",
                          selectedId === result.id &&
                            "bg-primary text-primary-foreground",
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(result);
                        }}
                      >
                        {selectedId === result.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Fixed Footer */}
        {results.length > 0 && (
          <div className="border-t border-border p-6 bg-muted/50 shrink-0 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {selectedId
                  ? "1 item selected"
                  : "Select a shuttle to continue"}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBook}
                  disabled={!selectedId}
                  className="min-w-30"
                >
                  Continue to Book
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
