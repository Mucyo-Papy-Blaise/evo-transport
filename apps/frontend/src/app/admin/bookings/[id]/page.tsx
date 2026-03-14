"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";

// Icons
import {
  ArrowLeft,
  Bus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  MessageSquare,
  Send,
  Download,
  Printer,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Hooks & API
import { useAuth } from "@/lib/auth/auth-context";
import { bookingApi } from "@/lib/api/booking.api";
import { AdminBooking } from "@/types/admin.types";
import { BookingStatus } from "@/types";
import { cn } from "@/utils/utils";
import { Label } from "@radix-ui/react-label";
import { formatDate } from "@/utils/date-utils";
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

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Status update state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>();
  const [statusReason, setStatusReason] = useState("");

  // Reply state
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  const bookingId = params.id as string;

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    setIsLoading(true);
    try {
      const data = await bookingApi.getBookingById(bookingId);
      setBooking(data);
      setSelectedStatus(data.status);
    } catch (error) {
      toast.error("Failed to load booking", "Please try again later");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === booking?.status) {
      setStatusDialogOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await bookingApi.updateBookingStatus(
        bookingId,
        selectedStatus,
        statusReason || undefined,
      );

      toast.success(
        "Status Updated",
        `Booking is now ${STATUS_CONFIG[selectedStatus].label}`,
      );

      // Refresh booking data
      fetchBooking();
      setStatusDialogOpen(false);
      setStatusReason("");
    } catch (error) {
      toast.error("Update failed", "Could not update booking status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Message required", "Please enter a message to send");
      return;
    }

    setIsSending(true);
    try {
      await bookingApi.adminRespond(bookingId, replyMessage, sendEmail);

      toast.success(
        "Reply Sent",
        "Your response has been sent to the customer",
      );

      setReplyDialogOpen(false);
      setReplyMessage("");

      // Refresh booking to show updated notes
      fetchBooking();
    } catch (error) {
      toast.error("Failed to send", "Could not send your reply");
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Booking Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          The booking you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/admin/bookings")}>
          Back to Bookings
        </Button>
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
  const customerEmail =
    booking.guestEmail || booking.user?.email || "No email provided";
  const customerPhone = booking.guestPhone || "Not provided";
  const customerInitials = getInitials(customerName);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              Booking Details
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-mono",
                  STATUS_CONFIG[booking.status].color,
                )}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {STATUS_CONFIG[booking.status].label}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Reference:{" "}
              <span className="font-mono text-primary">
                {booking.bookingReference}
              </span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReplyDialogOpen(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Reply
          </Button>
          <Button size="sm" onClick={() => setStatusDialogOpen(true)}>
            Update Status
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Trip & Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-primary" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Route */}
              <div className="bg-muted/30 rounded-xl p-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-sm text-muted-foreground mb-1">
                      From
                    </div>
                    <div className="font-semibold text-lg">
                      {booking.fromLocation}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {booking.fromCode || ""}{" "}
                      {booking.fromCity ? `• ${booking.fromCity}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ChevronRight className="w-4 h-4" />
                  </div>

                  <div className="flex-1 text-center md:text-right">
                    <div className="text-sm text-muted-foreground mb-1">To</div>
                    <div className="font-semibold text-lg">
                      {booking.toLocation}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {booking.toCode || ""}{" "}
                      {booking.toCity ? `• ${booking.toCity}` : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Departure Date
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {format(new Date(booking.departureDate), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Departure Time
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium">{booking.departureTime}</span>
                  </div>
                </div>
                {booking.tripType === "ROUND_TRIP" && booking.returnDate && (
                  <>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Return Date
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {format(new Date(booking.returnDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Return Time
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {booking.returnTime}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Passengers */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">Number of Passengers</span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {booking.passengers}{" "}
                  {booking.passengers > 1 ? "passengers" : "passenger"}
                </Badge>
              </div>

              {/* Passenger details from API */}
              {(booking.passengerSummary || (booking.passengerDetails && booking.passengerDetails.length > 0)) && (
                <div className="mt-4 p-4 rounded-lg border border-border bg-muted/20 space-y-2">
                  <div className="text-sm font-medium text-foreground">Passenger breakdown</div>
                  {booking.passengerSummary && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {booking.passengerSummary.adultCount > 0 && (
                        <Badge variant="secondary">Adults: {booking.passengerSummary.adultCount}</Badge>
                      )}
                      {booking.passengerSummary.childCount > 0 && (
                        <Badge variant="secondary">Children: {booking.passengerSummary.childCount}</Badge>
                      )}
                      {booking.passengerSummary.infantCount > 0 && (
                        <Badge variant="secondary">Infants: {booking.passengerSummary.infantCount}</Badge>
                      )}
                      {booking.passengerSummary.seniorCount > 0 && (
                        <Badge variant="secondary">Seniors: {booking.passengerSummary.seniorCount}</Badge>
                      )}
                      {booking.passengerSummary.requiresAssistanceCount > 0 && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Wheelchair/assistance: {booking.passengerSummary.requiresAssistanceCount}
                        </Badge>
                      )}
                    </div>
                  )}
                  {booking.passengerDetails && booking.passengerDetails.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {booking.passengerDetails.map((p: { type?: string; age?: number; requiresAssistance?: boolean; assistanceType?: string; specialNeeds?: string }, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="capitalize">{p.type}</span>
                          {p.age != null && <span>(age {p.age})</span>}
                          {p.requiresAssistance && (
                            <Badge variant="outline" className="text-[10px]">
                              {p.assistanceType || "Assistance"}
                            </Badge>
                          )}
                          {p.specialNeeds && <span>— {p.specialNeeds}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {customerInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{customerName}</h3>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {booking.userType === "REGISTERED"
                        ? "Registered User"
                        : "Guest"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {customerEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {customerPhone}
                      </span>
                    </div>
                  </div>

                  {booking.user && (
                    <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                      Account created:{" "}
                      {formatDate(booking.user.createdAt, "PPP")}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          {booking.adminNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {booking.adminNotes}
                </p>
                {booking.adminRespondedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Responded:{" "}
                    {format(new Date(booking.adminRespondedAt), "PPP p")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Summary & Actions */}
        <div className="space-y-6">
          {/* Price Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Base fare</span>
                <span className="font-medium">
                  {booking.price.toLocaleString()} FRw
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Passengers</span>
                <span className="font-medium">× {booking.passengers}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">
                  {(booking.price * booking.passengers).toLocaleString()} FRw
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {format(new Date(booking.createdAt), "MMM d, yyyy • HH:mm")}
                </span>
              </div>
              {booking.confirmedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Confirmed</span>
                  <span className="font-medium">
                    {format(
                      new Date(booking.confirmedAt),
                      "MMM d, yyyy • HH:mm",
                    )}
                  </span>
                </div>
              )}
              {booking.cancelledAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span className="font-medium">
                    {format(
                      new Date(booking.cancelledAt),
                      "MMM d, yyyy • HH:mm",
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Details
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Download as JSON
                  const dataStr = JSON.stringify(booking, null, 2);
                  const dataUri =
                    "data:application/json;charset=utf-8," +
                    encodeURIComponent(dataStr);
                  const exportFileDefaultName = `booking-${booking.bookingReference}.json`;
                  const linkElement = document.createElement("a");
                  linkElement.setAttribute("href", dataUri);
                  linkElement.setAttribute("download", exportFileDefaultName);
                  linkElement.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Change the status of this booking. The customer will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as BookingStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Add a note about this status change..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                !selectedStatus ||
                selectedStatus === booking.status ||
                isUpdating
              }
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Customer</DialogTitle>
            <DialogDescription>
              Send a message to {customerName} about their booking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Type your response here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="sendEmail" className="text-sm">
                Send email notification to customer
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={!replyMessage.trim() || isSending}
            >
              {isSending ? "Sending..." : "Send Reply"}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
