"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Ticket, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/utils/utils";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";


export function TrackBooking() {
  const router = useRouter();
  const [bookingRef, setBookingRef] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const validateReference = (ref: string) => {
    const pattern = /^EVO-\d{8}-[A-Z0-9]{5}$/i;
    if (!ref) {
      return "Please enter a booking reference";
    }
    if (!pattern.test(ref.toUpperCase())) {
      return "Invalid booking reference format (e.g., EVO-20260310-70F27)";
    }
    return "";
  };

  const handleSearch = async () => {
    const error = validateReference(bookingRef);
    if (error) {
      setSearchError(error);
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      router.push(`/booking/lookup?ref=${bookingRef.toUpperCase()}`);
    } catch  {
      toast.error("Search failed", "Please try again later");
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="py-24 bg-linear-to-b from-background to-muted/30">
      <div className="container max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Track Your <span className="text-primary">Booking</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter your booking reference to view your trip details, status, and make changes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b border-border">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Ticket className="h-5 w-5 text-primary" />
                Find Your Booking
              </CardTitle>
              <CardDescription>
                Enter your 16-character booking reference (e.g., EVO-20260310-70F27)
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="booking-ref" className="text-sm font-medium">
                    Booking Reference
                  </Label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="booking-ref"
                      type="text"
                      placeholder="EVO-xxxx-xxxx"
                      value={bookingRef}
                      onChange={(e) => {
                        setBookingRef(e.target.value);
                        setSearchError("");
                      }}
                      onKeyPress={handleKeyPress}
                      className={cn(
                        "pl-10 h-12 font-mono text-sm",
                        searchError && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  {searchError && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {searchError}
                    </p>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full md:w-auto h-12 px-8"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>Searching...</>
                  ) : (
                    <>
                      Track Booking
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/30 border-t border-border px-6 py-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>You can find your booking reference in your confirmation email</span>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}