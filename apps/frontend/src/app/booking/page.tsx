"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { format, startOfDay } from "date-fns";
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
  AlertTriangle,
} from "lucide-react";
import { Accessibility } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import {
  useCreateBooking,
  mapFormToBookingRequest,
  buildPassengerDetails,
} from "@/hooks/useBooking";
import { toast } from "@/components/ui/toast";
import { cn } from "@/utils/utils";
import type { SearchResult } from "@/types/search.types";
import { getRouteDistance, isLongDistance } from "@/lib/mock-data";
import {
  LongDistanceBookingContext,
  LongDistanceRequestModal,
} from "@/components/booking/Longdistancerequestmodal";

interface SelectedRouteStored {
  fromLocation: string;
  toLocation: string;
  fromCode?: string;
  fromCity: string;
  toCity: string;
  toCode?: string;
  distance?: number;
  shuttle: SearchResult;
}

function BookingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const createBooking = useCreateBooking();

  const [selectedRoute, setSelectedRoute] =
    useState<SelectedRouteStored | null>(null);
  const isLoading =
    selectedRoute === null &&
    !searchParams.get("fromLocation") &&
    typeof window !== "undefined" &&
    !sessionStorage.getItem("selectedRoute");

  const [tripType, setTripType] = useState<"ONE_WAY" | "ROUND_TRIP">("ONE_WAY");
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [departureTime, setDepartureTime] = useState("09:00");
  const [returnTime, setReturnTime] = useState("17:00");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [wheelchairCount, setWheelchairCount] = useState(0);

  const [guestInfo, setGuestInfo] = useState({
    email: "",
    name: "",
    phone: "",
  });
  const [guestErrors, setGuestErrors] = useState({ email: "", phone: "" });

  // Long distance modal
  const [ldModalOpen, setLdModalOpen] = useState(false);
  const [ldContext, setLdContext] = useState<LongDistanceBookingContext | null>(
    null,
  );

  useEffect(() => {
    const fromLocation = searchParams.get("fromLocation");
    const toLocation = searchParams.get("toLocation");
    const price = searchParams.get("price");
    const distance = searchParams.get("distance");
    const duration = searchParams.get("duration");
    const currency = searchParams.get("currency");

    if (fromLocation && toLocation && price) {
      const routeFromParams: SelectedRouteStored = {
        fromLocation,
        toLocation,
        fromCity: searchParams.get("fromCity") ?? "",
        toCity: searchParams.get("toCity") ?? "",
        fromCode: "",
        toCode: "",
        distance: distance ? Number(distance) : 0,
        shuttle: {
          id: "map-booking",
          provider: "EVO Transport",
          vehicleType: "Shuttle",
          departureTime: "09:00",
          arrivalTime: "",
          duration: duration ?? "",
          price: Number(price),
          currency: currency ?? "EUR",
          availableSeats: 12,
          amenities: [],
          distance: distance ? Number(distance) : 0,
          fromCity: searchParams.get("fromCity") ?? "",
        },
      };
      setTimeout(() => {
        setSelectedRoute(routeFromParams);
      }, 0);
      return;
    }

    // ── Priority 2: sessionStorage (from Hero + SearchResultsModal) ──────
    const stored = sessionStorage.getItem("selectedRoute");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SelectedRouteStored;
        setTimeout(() => {
          setSelectedRoute(parsed);
          if (parsed?.shuttle?.departureTime) {
            setDepartureTime(parsed.shuttle.departureTime);
          }
        }, 0);
      } catch {
        router.push("/");
        return;
      }
    } else {
      router.push("/");
      return;
    }

  }, [router, searchParams]);

  const totalPassengers = adults + children;
  const clampedWheelchair = Math.min(wheelchairCount, totalPassengers);
  const passengerDetails = buildPassengerDetails({
    adults,
    children,
    wheelchairCount: clampedWheelchair > 0 ? clampedWheelchair : 0,
  });

  // Resolve distance: prefer the value stored from search, fallback to mock lookup
  const routeDistance = (() => {
    if (selectedRoute?.distance && selectedRoute.distance > 0)
      return selectedRoute.distance;
    if (selectedRoute?.fromCode && selectedRoute?.toCode) {
      return getRouteDistance(selectedRoute.fromCode, selectedRoute.toCode);
    }
    return (selectedRoute?.shuttle as any)?.distance ?? 0;
  })();

  const isLongDistanceRoute = isLongDistance(routeDistance);

  const validateContact = () => {
    const errors = { email: "", phone: "" };
    if (!user && !guestInfo.email) {
      errors.email = "Email is required";
    } else if (
      !user &&
      guestInfo.email &&
      !/\S+@\S+\.\S+/.test(guestInfo.email)
    ) {
      errors.email = "Please enter a valid email";
    }
    if (!guestInfo.phone?.trim()) errors.phone = "Phone number is required";
    setGuestErrors(errors);
    return !errors.email && !errors.phone;
  };

  const handleBooking = () => {
    if (!selectedRoute) return;
    if (totalPassengers < 1) {
      toast.error("Add at least one passenger", "");
      return;
    }
    if (!validateContact()) return;

    const commonData = {
      tripType:
        tripType === "ONE_WAY"
          ? "oneWay"
          : ("roundTrip" as "oneWay" | "roundTrip"),
      fromLocation: selectedRoute.fromLocation,
      toLocation: selectedRoute.toLocation,
      fromCode: selectedRoute.fromCode ?? "",
      toCode: selectedRoute.toCode ?? "",
      fromCity: selectedRoute.fromLocation?.split(" ")[0] ?? "",
      toCity: selectedRoute.toLocation?.split(" ")[0] ?? "",
      departureDate,
      returnDate: tripType === "ROUND_TRIP" ? returnDate : undefined,
      departureTime,
      returnTime: tripType === "ROUND_TRIP" ? returnTime : undefined,
      passengerDetails,
      price: totalPrice,
    };

    const contactInfo = {
      email: user ? undefined : guestInfo.email,
      name: guestInfo.name || undefined,
      phone: guestInfo.phone,
    };

    if (isLongDistanceRoute) {
      // Open the modal — it handles the API call after user writes their message
      setLdContext({
        ...commonData,
        distance: routeDistance,
        totalPassengers,
        wheelchairCount: clampedWheelchair,
        guestEmail: contactInfo.email,
        guestName: contactInfo.name,
        guestPhone: contactInfo.phone,
      });
      setLdModalOpen(true);
      return;
    }

    // Normal route — book directly
    createBooking.mutate(mapFormToBookingRequest(commonData, contactInfo), {
      onSuccess: (response) => {
        sessionStorage.removeItem("selectedRoute");
        toast.success(
          "Booking Confirmed!",
          `Reference: ${response.bookingReference}`,
        );
        router.push(`/booking/success?ref=${response.bookingReference}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!selectedRoute) return null;

  const { fromLocation, toLocation, shuttle } = selectedRoute;
  const totalPrice = shuttle.price * totalPassengers;

  return (
    <>
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to search
          </Link>

          {/* Long-distance awareness banner */}
          {isLongDistanceRoute && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200  bg-amber-50  px-5 py-4"
            >
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-header-bg text-sm">
                  Long Distance Route — {routeDistance} km
                </p>
                <p className="text-chart-1 text-sm mt-0.5">
                  Fill in your details below, then click{" "}
                  <strong>Confirm &amp; Book</strong>. A popup will appear where
                  you can describe your requirements — our team will then
                  contact you to confirm pricing and availability.
                </p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected shuttle */}
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
                            {shuttle.price.toLocaleString()} Euro
                          </div>
                          <div className="text-xs text-muted-foreground">
                            per person
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{fromLocation}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{toLocation}</span>
                      </div>

                      {routeDistance > 0 && (
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{routeDistance} km</span>
                          {isLongDistanceRoute && (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                              <AlertTriangle className="h-3 w-3" /> Long
                              distance
                            </span>
                          )}
                        </div>
                      )}

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

              {/* Contact info */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {user ? "Contact for this booking" : "Your Information"}
                    <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                      Required
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {user
                      ? "Phone number is required for booking confirmation."
                      : "Please provide your contact details."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!user && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="email"
                          className={cn(
                            "text-sm font-medium mb-2 block",
                            guestErrors.email && "text-destructive",
                          )}
                        >
                          Email Address{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={guestInfo.email}
                            onChange={(e) => {
                              setGuestInfo({
                                ...guestInfo,
                                email: e.target.value,
                              });
                              setGuestErrors((p) => ({ ...p, email: "" }));
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
                      <div>
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
                              setGuestInfo({
                                ...guestInfo,
                                name: e.target.value,
                              })
                            }
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label
                      htmlFor="phone"
                      className={cn(
                        "text-sm font-medium mb-2 block",
                        guestErrors.phone && "text-destructive",
                      )}
                    >
                      Phone number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+250 788 123 456"
                        value={guestInfo.phone}
                        onChange={(e) => {
                          setGuestInfo({ ...guestInfo, phone: e.target.value });
                          setGuestErrors((p) => ({ ...p, phone: "" }));
                        }}
                        className={cn(
                          "pl-10 h-12",
                          guestErrors.phone &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                      />
                    </div>
                    {guestErrors.phone && (
                      <p className="text-xs text-destructive mt-1">
                        {guestErrors.phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trip details */}
              <Card>
                <CardHeader>
                  <CardTitle>Trip Details</CardTitle>
                  <CardDescription>
                    Complete your trip information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trip type */}
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
                            onSelect={(d) => {
                              if (d) {
                                setDepartureDate(d);
                                if (returnDate < d) setReturnDate(d);
                              }
                            }}
                            disabled={(date) => date < startOfDay(new Date())}
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
                              onSelect={(d) => {
                                if (d) setReturnDate(d);
                              }}
                              disabled={(date) =>
                                date < startOfDay(departureDate)
                              }
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
                      <div className="flex items-center gap-2 h-12 px-3 rounded-md border border-input bg-muted/50 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">{departureTime}</span>
                        <span className="text-muted-foreground text-xs">
                          (set by shuttle)
                        </span>
                      </div>
                    </div>
                    {tripType === "ROUND_TRIP" && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Return Time
                        </Label>
                        <Select
                          value={returnTime}
                          onValueChange={setReturnTime}
                        >
                          <SelectTrigger className="h-12">
                            <Clock className="h-4 w-4 text-primary mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["14:00", "17:00", "18:00", "19:00"].map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Passengers */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium block">
                      Passengers
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Adults
                        </Label>
                        <Select
                          value={adults.toString()}
                          onValueChange={(v) => setAdults(parseInt(v, 10))}
                        >
                          <SelectTrigger className="h-10 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Children
                        </Label>
                        <Select
                          value={children.toString()}
                          onValueChange={(v) => setChildren(parseInt(v, 10))}
                        >
                          <SelectTrigger className="h-10 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Accessibility className="h-3 w-3" /> Wheelchair
                        </Label>
                        <Select
                          value={clampedWheelchair.toString()}
                          onValueChange={(v) =>
                            setWheelchairCount(
                              Math.min(parseInt(v, 10), totalPassengers),
                            )
                          }
                        >
                          <SelectTrigger className="h-10 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              { length: totalPassengers + 1 },
                              (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Right column — summary ── */}
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
                        {shuttle.price.toLocaleString()} Euro ×{" "}
                        {totalPassengers}
                      </span>
                    </div>
                    {isLongDistanceRoute && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        * Final price confirmed after team review
                      </p>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {totalPrice.toLocaleString()} Euro
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-primary" />
                      <span>
                        {shuttle.provider} · {shuttle.vehicleType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Departure: {departureTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        {totalPassengers} passenger
                        {totalPassengers !== 1 ? "s" : ""}
                        {clampedWheelchair > 0 &&
                          ` (${clampedWheelchair} wheelchair)`}
                      </span>
                    </div>
                    {routeDistance > 0 && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{routeDistance} km</span>
                        {isLongDistanceRoute && (
                          <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">
                            Long distance
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isLongDistanceRoute && (
                    <div className="rounded-lg bg-amber-50 border-amber-200 p-3 text-xs text-chart-3 space-y-1">
                      <p className="font-semibold">What happens next?</p>
                      <p>1. Click Confirm &amp; Book below</p>
                      <p>2. Describe your requirements in the popup</p>
                      <p>3. Team contacts you (2–4 hrs)</p>
                      <p>4. Booking confirmed ✓</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg"
                    onClick={handleBooking}
                    disabled={createBooking.isPending}
                  >
                    {createBooking.isPending
                      ? "Processing..."
                      : "Confirm & Book"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Long distance popup — only mounts when isLongDistanceRoute and user clicks Confirm & Book */}
      <LongDistanceRequestModal
        isOpen={ldModalOpen}
        onClose={() => setLdModalOpen(false)}
        context={ldContext}
      />
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }
    >
      <BookingPageInner />
    </Suspense>
  );
}
