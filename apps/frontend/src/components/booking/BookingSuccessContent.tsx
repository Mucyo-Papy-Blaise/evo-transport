"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  CheckCircle2,
  Bus,
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  Download,
  Home,
  Printer,
  Share2,
  ArrowLeftIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

// Hooks
import { useBookingByReference } from "@/hooks/useBooking";

export default function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get("ref");
  const [isPrinting, setIsPrinting] = useState(false);

  const {
    data: booking,
    isLoading,
    error,
  } = useBookingByReference(bookingRef || "");

  useEffect(() => {
    if (error) {
      toast.error("Booking not found", "Unable to load your booking details");
    }
  }, [error]);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "EVO Transport Booking",
        text: `My booking reference: ${bookingRef}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!", "Booking link copied to clipboard");
    }
  };

  const handleDownload = () => {
    // Create a simple text version of the booking
    if (!booking) return;

    const content = `
EVO TRANSPORT - BOOKING CONFIRMATION
====================================
Booking Reference: ${booking.bookingReference}
Status: ${booking.status}

TRIP DETAILS
------------
Route: ${booking.fromLocation} → ${booking.toLocation}
Date: ${format(new Date(booking.departureDate), "PPP")}
Time: ${booking.departureTime}
Passengers: ${booking.passengers}

CONTACT INFORMATION
-------------------
${booking.user ? "Registered User" : "Guest"}
Email: ${booking.guestEmail || booking.user?.email}
Phone: ${booking.guestPhone || "Not provided"}

Thank you for choosing EVO Transport!
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EVO-${booking.bookingReference}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Download started", "Booking details saved to your device");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <Card>
            <CardContent className="pt-16 pb-16">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">😕</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Booking Not Found
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We couldn&apos;t find a booking with reference &quot;
                {bookingRef}&quot;. Please check the link or contact support.
              </p>
              <Link href="/">
                <Button size="lg">
                  <Home className="mr-2 h-5 w-5" />
                  Return Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 print:bg-white print:py-0">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Success Header - Hidden when printing */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 print:hidden"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-muted-foreground">
            Your booking has been successfully confirmed. Check your email for
            details.
          </p>
        </motion.div>

        {/* Action Buttons - Hidden when printing */}
        <div className="flex flex-wrap gap-3 justify-center mb-8 print:hidden">
          <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? "Printing..." : "Print"}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        {/* Main Booking Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden border-2 border-primary/20 print:border-none print:shadow-none">
            {/* Header with Booking Reference */}
            <CardHeader className="bg-linear-to-r from-primary/10 to-transparent border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-foreground">
                    Booking Reference
                  </CardTitle>
                  <CardDescription className="text-base">
                    Keep this reference for all communications
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="text-lg px-6 py-2 border-primary text-primary font-mono"
                >
                  {booking.bookingReference}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                  {booking.status}
                </Badge>
              </div>

              {/* Route Summary */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Bus className="h-5 w-5 text-primary mr-2" />
                  Trip Details
                </h3>

                <div className="bg-muted/50 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {booking.fromCode ||
                              booking.fromLocation.split(" ")[0]}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 max-w-30 truncate">
                            {booking.fromLocation}
                          </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center px-2">
                          <div className="h-0.5 flex-1 bg-border relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Bus className="h-4 w-4 text-primary bg-card px-1" />
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {booking.toCode || booking.toLocation.split(" ")[0]}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 max-w-30 truncate">
                            {booking.toLocation}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator
                      orientation="vertical"
                      className="h-12 hidden md:block"
                    />

                    <div className="flex flex-row md:flex-col items-center justify-between gap-6 md:gap-2 md:min-w-50">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {format(new Date(booking.departureDate), "PPP")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {booking.departureTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {booking.passengers} passenger
                          {booking.passengers > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Email
                        </div>
                        <div className="text-sm text-muted-foreground break-all">
                          {booking.guestEmail ||
                            booking.user?.email ||
                            "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Phone
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.guestPhone || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Payment Summary
                </h3>

                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-3xl font-bold text-primary">
                      {booking.price.toLocaleString()} Euro
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Payment will be collected upon arrival
                  </p>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2">
                  ⚠️ Important Information
                </h4>
                <ul className="text-xs text-amber-700 dark:text-amber-500 space-y-1 list-disc list-inside">
                  <li>Please arrive at least 15 minutes before departure</li>
                  <li>Have your booking reference ready when boarding</li>
                  <li>
                    For changes or cancellations, contact support 24h in advance
                  </li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/50 border-t border-border p-6 flex flex-col sm:flex-row gap-4 justify-between print:hidden">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Print-only version */}
        <style jsx global>{`
          @media print {
            body {
              background: white;
              padding: 20px;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:border-none {
              border: none !important;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            .print\\:bg-white {
              background: white !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}