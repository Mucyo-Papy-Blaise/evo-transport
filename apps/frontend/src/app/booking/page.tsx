"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  Bus,
  Clock,
  Users,
  Calendar as CalendarIcon,
  MapPin,
  Mail,
  User,
  Phone,
  ChevronRight,
} from "lucide-react";

// Hooks
import { useAuth } from "@/lib/auth/auth-context";
import { useCreateBooking, mapFormToBookingRequest } from "@/hooks/useBooking";
import { toast } from "@/components/ui/toast";
import { cn } from "@/utils/utils";

export default function BookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createBooking = useCreateBooking();
  const hasRedirected = useRef(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Trip details state
  const [tripType, setTripType] = useState<"ONE_WAY" | "ROUND_TRIP">("ONE_WAY");
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [departureTime, setDepartureTime] = useState("09:00");
  const [returnTime, setReturnTime] = useState("17:00");
  const [passengers, setPassengers] = useState("1");

  // Guest info state - ASK HERE ON BOOKING PAGE
  const [guestInfo, setGuestInfo] = useState({
    email: "",
    name: "",
    phone: "",
  });
  const [guestErrors, setGuestErrors] = useState({
    email: "",
  });

  useEffect(() => {
    let isMounted = true;

    const stored = sessionStorage.getItem("selectedRoute");

    if (stored && isMounted) {
      const parsed = JSON.parse(stored);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRoute(parsed);
    } else if (!hasRedirected.current && isMounted) {
      hasRedirected.current = true;
      router.push("/");
    }

    if (isMounted) {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [router]);

  const validateGuestEmail = () => {
    if (!user && !guestInfo.email) {
      setGuestErrors({ email: "Email is required" });
      return false;
    }
    if (!user && !/\S+@\S+\.\S+/.test(guestInfo.email)) {
      setGuestErrors({ email: "Please enter a valid email" });
      return false;
    }
    return true;
  };

  const handleBooking = () => {
    // Validate guest email if not logged in
    if (!user && !validateGuestEmail()) {
      return;
    }

    // Prepare booking data
    const bookingData = mapFormToBookingRequest(
      {
        tripType: tripType === "ONE_WAY" ? "oneWay" : "roundTrip",
        fromLocation: selectedRoute.fromLocation,
        toLocation: selectedRoute.toLocation,
        fromCode: selectedRoute.fromCode,
        toCode: selectedRoute.toCode,
        fromCity: selectedRoute.fromLocation.split(" ")[0],
        toCity: selectedRoute.toLocation.split(" ")[0],
        departureDate,
        returnDate: tripType === "ROUND_TRIP" ? returnDate : undefined,
        departureTime,
        returnTime: tripType === "ROUND_TRIP" ? returnTime : undefined,
        passengers,
      },
      !user ? guestInfo : undefined,
    );

    createBooking.mutate(bookingData, {
      onSuccess: (response) => {
        sessionStorage.removeItem("selectedRoute");
        toast.success(
          "Booking Confirmed!",
          `Your booking reference is ${response.bookingReference}`,
        );
        router.push(`/booking/success?ref=${response.bookingReference}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedRoute) {
    return null;
  }

  const { fromLocation, toLocation, shuttle } = selectedRoute;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) setDepartureDate(date);
  };

  const handleReturnDateSelect = (date: Date | undefined) => {
    if (date) setReturnDate(date);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to search
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Trip Details Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Shuttle Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Shuttle</CardTitle>
                <CardDescription>
                  You&apos;ve selected the following shuttle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {shuttle.provider}
                        </h3>
                        <p className="text-muted-foreground">
                          {shuttle.vehicleType}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {shuttle.price.toLocaleString()} FRw
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per person
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-foreground">{fromLocation}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-foreground">{toLocation}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {shuttle.amenities?.map((amenity: string) => (
                        <span
                          key={amenity}
                          className="text-xs bg-background px-2 py-1 rounded border border-border"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information - ASK HERE for non-logged in users */}
            {!user && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Your Information
                    <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                      Required
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Please provide your contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-5">
                    <div className="w-1/2">
                    <Label
                      htmlFor="email"
                      className={cn(
                        "text-sm font-medium mb-2 block",
                        guestErrors.email && "text-destructive",
                      )}
                    >
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={guestInfo.email}
                        onChange={(e) => {
                          setGuestInfo({ ...guestInfo, email: e.target.value });
                          setGuestErrors({ email: "" });
                        }}
                        className={cn(
                          "pl-10 h-12",
                          guestErrors.email &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                      />
                    </div>
                    {guestErrors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {guestErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="w-1/2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium mb-2 block"
                    >
                      Full Name (optional)
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={guestInfo.name}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, name: e.target.value })
                        }
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium mb-2 block"
                    >
                      Phone (optional)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+250 788 123 456"
                        value={guestInfo.phone}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, phone: e.target.value })
                        }
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trip Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
                <CardDescription>
                  Complete your trip information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trip Type */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Trip Type
                  </Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={tripType === "ONE_WAY" ? "default" : "outline"}
                      onClick={() => setTripType("ONE_WAY")}
                      className="flex-1"
                    >
                      One Way
                    </Button>
                    <Button
                      type="button"
                      variant={
                        tripType === "ROUND_TRIP" ? "default" : "outline"
                      }
                      onClick={() => setTripType("ROUND_TRIP")}
                      className="flex-1"
                    >
                      Round Trip
                    </Button>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Departure Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !departureDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          {departureDate
                            ? format(departureDate, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={departureDate}
                          onSelect={handleDateSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {tripType === "ROUND_TRIP" && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Return Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !returnDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                            {returnDate
                              ? format(returnDate, "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={returnDate}
                            onSelect={handleReturnDateSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                {/* Times */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Departure Time
                    </Label>
                    <Input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  {tripType === "ROUND_TRIP" && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Return Time
                      </Label>
                      <Input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  )}
                </div>

                {/* Passengers */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Number of Passengers
                  </Label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="w-full h-12">
                      <Users className="h-4 w-4 text-primary mr-2" />
                      <SelectValue placeholder="Select number of passengers" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Passenger{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price Summary & Booking */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base fare</span>
                    <span>
                      {shuttle.price.toLocaleString()} FRw × {passengers}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      {(shuttle.price * parseInt(passengers)).toLocaleString()}{" "}
                      FRw
                    </span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-primary" />
                    <span>
                      {shuttle.provider} • {shuttle.vehicleType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Departure: {departureTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>
                      {passengers} passenger
                      {parseInt(passengers) > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  size="lg"
                  className="w-full h-14 text-lg"
                  onClick={handleBooking}
                  disabled={createBooking.isPending}
                >
                  {createBooking.isPending ? "Processing..." : "Confirm & Book"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
