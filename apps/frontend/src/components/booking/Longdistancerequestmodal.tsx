"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  MapPin,
  ArrowRight,
  Send,
  CheckCircle2,
  Clock,
  Users,
  Bus,
  Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/utils";
import {
  useSendLongDistanceRequest,
  mapFormToLongDistanceRequest,
} from "@/hooks/useBooking";
import type { PassengerDetail } from "@/types/passenger.types";
import { useRouter } from "next/navigation";

export interface LongDistanceBookingContext {
  // Route
  fromLocation: string;
  toLocation: string;
  fromCode: string;
  toCode: string;
  fromCity: string;
  toCity: string;
  distance: number;
  // Trip
  tripType: "oneWay" | "roundTrip";
  departureDate: Date;
  returnDate?: Date;
  departureTime: string;
  returnTime?: string;
  // Passengers
  passengerDetails: PassengerDetail[];
  totalPassengers: number;
  wheelchairCount: number;
  // Price
  price: number;
  // Contact
  guestEmail?: string;
  guestName?: string;
  guestPhone: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  context: LongDistanceBookingContext | null;
}

export function LongDistanceRequestModal({ isOpen, onClose, context }: Props) {
  const router = useRouter();
  const sendRequest = useSendLongDistanceRequest();

  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const reset = () => {
    setMessage("");
    setMessageError("");
    setSubmitted(false);
    setBookingRef("");
  };

  const handleClose = () => {
    if (sendRequest.isPending) return;
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!context) return;
    if (!message.trim()) {
      setMessageError(
        "Please describe your trip requirements so our team can assist you.",
      );
      return;
    }
    setMessageError("");

    const payload = mapFormToLongDistanceRequest(
      {
        tripType: context.tripType,
        fromLocation: context.fromLocation,
        toLocation: context.toLocation,
        fromCode: context.fromCode,
        toCode: context.toCode,
        fromCity: context.fromCity,
        toCity: context.toCity,
        departureDate: context.departureDate,
        returnDate: context.returnDate,
        departureTime: context.departureTime,
        returnTime: context.returnTime,
        passengerDetails: context.passengerDetails,
        price: context.price,
        distance: context.distance,
        message,
      },
      {
        email: context.guestEmail,
        name: context.guestName,
        phone: context.guestPhone,
      },
    );

    sendRequest.mutate(payload, {
      onSuccess: (response) => {
        sessionStorage.removeItem("selectedRoute");
        setBookingRef(
          response.requestId ?? response.bookingReference ?? response.bookingId,
        );
        setSubmitted(true);
      },
    });
  };

  const handleDone = () => {
    router.push(`/booking/success?ref=${bookingRef}&type=long-distance`);
  };

  return (
    <AnimatePresence>
      {isOpen && context && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ld-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            key="ld-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className={cn(
              "fixed z-50 bg-background shadow-2xl overflow-hidden",
              // Mobile: bottom sheet
              "bottom-0 left-0 right-0 rounded-t-2xl max-h-[92dvh]",
              // Desktop: centered dialog
              "md:bottom-auto md:left-1/2 md:top-1/2",
              "md:-translate-x-1/2 md:-translate-y-1/2",
              "md:rounded-2xl md:w-full md:max-w-md md:max-h-[90vh]",
            )}
          >
            {/* Amber accent bar */}
            <div className="h-1 bg-linear-to-r from-amber-400 via-orange-400 to-amber-500" />

            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-3">
              <div className="w-10 h-1 bg-muted-foreground/25 rounded-full" />
            </div>

            {/* Scrollable content */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(92dvh - 4px)" }}
            >
              <AnimatePresence mode="wait">
                {/* ── Success screen ── */}
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-6 py-8 text-center space-y-5"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 14, delay: 0.08 }}
                      className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto"
                    >
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>

                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        Request Sent!
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
                        Our team will review your request and contact you within
                        2–4 hours to confirm arrangements and pricing.
                      </p>
                    </div>

                    {bookingRef && (
                      <div className="inline-flex items-center gap-2 bg-muted rounded-xl px-5 py-3 text-sm">
                        <span className="text-muted-foreground">
                          Reference:
                        </span>
                        <span className="font-mono font-bold text-primary tracking-wide">
                          {bookingRef}
                        </span>
                      </div>
                    )}

                    <div className="rounded-xl bg-muted/50 p-4 text-left space-y-1.5 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">
                        What happens next
                      </p>
                      <p>1. Team reviews your request</p>
                      <p>2. We contact you via phone or email (2–4 hrs)</p>
                      <p>3. Confirm route details &amp; pricing</p>
                      <p>4. Booking officially confirmed ✓</p>
                    </div>

                    <Button
                      size="lg"
                      className="w-full h-12"
                      onClick={handleDone}
                    >
                      Done
                    </Button>
                  </motion.div>
                ) : (
                  /* ── Request form ── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between px-6 pt-5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="h-5 w-5 text-chart-1" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-foreground leading-tight">
                            Long Distance Request
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {context.distance} km — special arrangements
                            required
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="px-6 pb-6 space-y-4">
                      {/* Booking summary */}
                      <div className="rounded-xl bg-muted/60 border border-border p-4 space-y-3 text-sm">
                        {/* Route */}
                        <div className="flex items-center gap-2 font-medium text-foreground flex-wrap">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            {context.fromLocation}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{context.toLocation}</span>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1.5">
                            <Ruler className="h-3.5 w-3.5 text-amber-500" />
                            <span className="font-medium text-chart-1 ">
                              {context.distance} km
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span>{context.departureTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span>
                              {context.totalPassengers} passenger
                              {context.totalPassengers !== 1 ? "s" : ""}
                              {context.wheelchairCount > 0 &&
                                ` · ${context.wheelchairCount} wheelchair`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2">
                            <Bus className="h-3.5 w-3.5 text-primary" />
                            <span>
                              Estimated:{" "}
                              <span className="font-semibold text-foreground">
                                {context.price.toLocaleString()} FRw
                              </span>
                              <span className="text-muted-foreground ml-1">
                                (confirmed after review)
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info note */}
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50  border border-amber-200 px-3 py-2.5 text-xs text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <p>
                          This route exceeds 400 km. Describe your needs below
                          and our team will reach out to finalise before
                          confirming your booking.
                        </p>
                      </div>

                      {/* Message textarea */}
                      <div>
                        <Label
                          htmlFor="ld-message"
                          className={cn(
                            "text-sm font-medium mb-2 block",
                            messageError && "text-destructive",
                          )}
                        >
                          Your message{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="ld-message"
                          placeholder={"Tell us what you need"}
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value);
                            if (e.target.value.trim()) setMessageError("");
                          }}
                          rows={5}
                          className={cn(
                            "resize-none text-sm",
                            messageError &&
                              "border-destructive focus-visible:ring-destructive",
                          )}
                        />
                        {messageError ? (
                          <p className="text-xs text-destructive mt-1.5">
                            {messageError}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1.5">
                            We&lsquo;ll review and reach out within 2–4 hours
                            via phone or email.
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-1">
                        <Button
                          variant="outline"
                          className="flex-1 h-12"
                          onClick={handleClose}
                          disabled={sendRequest.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 h-12 gap-2 bg-primary cursor-pointer text-white"
                          onClick={handleSubmit}
                          disabled={sendRequest.isPending}
                        >
                          {sendRequest.isPending ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Sending…
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Request
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
