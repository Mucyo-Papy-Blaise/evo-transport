"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";

// Icons
import {
  ArrowLeft,
  Bus,
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  MessageCircle,
  Send,
  Loader2,
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

// Hooks
import {
  useBookingByReference,
  useBookingMessages,
  useSendCustomerMessage,
} from "@/hooks/useBooking";
import { BookingStatus } from "@/types";
import type { BookingMessage } from "@/types/booking.types";
import { cn } from "@/utils/utils";
import { bookingApi } from "@/lib/api/booking.api";

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; icon: any }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: Clock3,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-50 text-gray-600 border-gray-200",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    icon: CheckCircle2,
  },
};

export default function BookingLookupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingRef = searchParams.get("ref");
  const [isSending, setIsSending] = useState(false);

  const {
    data: booking,
    isLoading,
    error,
  } = useBookingByReference(bookingRef || "");
  const { data: messages = [], isLoading: messagesLoading } =
    useBookingMessages(booking?.id || "");
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async () => {
    if (!reply.trim() || !booking?.id) return;
    setIsSending(true);
    try {
      await bookingApi.sendGuestMessage(booking.id, {
        bookingReference: booking.bookingReference,
        content: reply.trim(),
        senderName: booking.guestName || undefined,
      });
      setReply("");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(
        "Booking not found",
        "Please check your reference and try again",
      );
    }
  }, [error]);

  if (!bookingRef) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <Card>
            <CardContent className="pt-16 pb-16">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-3">
                No Booking Reference
              </h1>
              <p className="text-muted-foreground mb-8">
                Please provide a booking reference to look up your booking.
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

  if (!booking || error) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <Card>
            <CardContent className="pt-16 pb-16">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Booking Not Found
              </h1>
              <p className="text-muted-foreground mb-4">
                We couldn&apos;t find a booking with reference &quot;
                {bookingRef}&quot;.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Please check the reference and try again, or contact support if
                you need assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
                <Button onClick={() => router.push("/")}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_CONFIG[booking.status].icon;
  const customerName =
    booking.guestName ||
    (booking.user
      ? `${booking.user.firstName || ""} ${booking.user.lastName || ""}`.trim()
      : "Guest") ||
    "Anonymous";

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden border-2 border-primary/10">
            <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-foreground">
                    Booking Details
                  </CardTitle>
                  <CardDescription className="text-base">
                    Reference: {booking.bookingReference}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm px-4 py-1.5",
                    STATUS_CONFIG[booking.status].color,
                  )}
                >
                  <StatusIcon className="w-4 h-4 mr-1.5" />
                  {STATUS_CONFIG[booking.status].label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
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
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Date
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {format(
                            new Date(booking.departureDate),
                            "MMM d, yyyy",
                          )}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Time
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {booking.departureTime}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Passengers
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {booking.passengers}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Total
                      </div>
                      <div className="font-bold text-primary">
                        {(booking.price * booking.passengers).toLocaleString()}{" "}
                        Euro
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
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

              {/* Booking Timeline */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Timeline
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Booked on</span>
                    <span className="font-medium">
                      {format(new Date(booking.createdAt), "PPP p")}
                    </span>
                  </div>
                  {booking.confirmedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Confirmed on
                      </span>
                      <span className="font-medium">
                        {format(new Date(booking.confirmedAt), "PPP p")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages / Chat */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Messages
                </h3>

                {/* Thread */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="max-h-72 overflow-y-auto p-4 space-y-3 bg-muted/20">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading messages…
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-6">
                        No messages yet. Our team will reach out here if needed.
                      </p>
                    ) : (
                      messages.map((msg: BookingMessage) => {
                        const isAdmin = msg.senderType === "ADMIN";
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex flex-col gap-1 max-w-[85%]",
                              isAdmin ? "items-start" : "items-end ml-auto",
                            )}
                          >
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                isAdmin
                                  ? "bg-background border border-border text-foreground rounded-tl-sm"
                                  : "bg-primary text-primary-foreground rounded-tr-sm",
                              )}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-muted-foreground px-1">
                              {isAdmin
                                ? msg.senderName || "EVO Transport"
                                : "You"}{" "}
                              ·{" "}
                              {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply input */}
                  <div className="border-t border-border bg-background p-3 flex gap-2 items-end">
                    <Textarea
                      placeholder="Type a message…"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      rows={2}
                      className="resize-none text-sm flex-1"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendReply}
                      disabled={!reply.trim() || isSending}
                      className="h-10 w-10 shrink-0"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Support Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-primary mb-2">
                  Need Help?
                </h4>
                <p className="text-xs text-muted-foreground">
                  If you have any questions about your booking, please contact
                  our support team at{" "}
                  <a
                    href="mailto:support@evotransport.rw"
                    className="text-primary hover:underline"
                  >
                    support@evotransport.rw
                  </a>{" "}
                  or call{" "}
                  <a
                    href="tel:+250788123456"
                    className="text-primary hover:underline"
                  >
                    +250 788 123 456
                  </a>
                </p>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/50 border-t border-border p-6 flex justify-between">
              <Button variant="outline" onClick={() => window.print()}>
                Print Details
              </Button>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
