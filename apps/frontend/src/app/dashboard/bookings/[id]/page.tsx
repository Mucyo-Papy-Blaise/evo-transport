"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  usePassengerBooking,
  useBookingMessages,
  useSendCustomerMessage,
  useMarkMessagesRead,
  useCancelBooking,
  useRequestRebook,
} from "@/hooks/useBooking";
import { writeRebookSessionFromBooking } from "@/lib/booking/rebook-session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageCircle, RotateCcw, Send } from "lucide-react";
import { cn } from "@/utils/utils";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function PassengerBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: booking, isLoading, isError } = usePassengerBooking(id);
  const { data: messages, isLoading: msgLoading } = useBookingMessages(id);
  const sendMessage = useSendCustomerMessage(id);
  const markRead = useMarkMessagesRead(id);
  const cancelBooking = useCancelBooking();
  const requestRebook = useRequestRebook();
  const [reply, setReply] = useState("");
  const [rebookNote, setRebookNote] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const markedRef = useRef(false);

  useEffect(() => {
    if (!id || markedRef.current) return;
    markedRef.current = true;
    markRead.mutate("CUSTOMER");
    // markRead identity is unstable; only re-run when booking id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canCancelSelfService = booking?.status === "PENDING";
  const canRequestCancelViaChat = booking?.status === "CONFIRMED";

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = reply.trim();
    if (!text) return;
    await sendMessage.mutateAsync({ content: text });
    setReply("");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="max-w-lg space-y-4">
        <p className="text-muted-foreground">Booking not found or access denied.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/bookings">Back to bookings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          All bookings
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Trip details</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {booking.bookingReference}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route</CardTitle>
          <CardDescription>
            {booking.fromLocation} → {booking.toLocation}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Departure: </span>
            {format(new Date(booking.departureDate), "PPP")} at{" "}
            {booking.departureTime}
          </p>
          {booking.returnDate && (
            <p>
              <span className="text-muted-foreground">Return: </span>
              {format(new Date(booking.returnDate), "PPP")}
              {booking.returnTime ? ` at ${booking.returnTime}` : ""}
            </p>
          )}
          <p className="capitalize">
            <span className="text-muted-foreground">Status: </span>
            {booking.status.toLowerCase().replace("_", " ")}
          </p>
          {booking.statusReason && (
            <p>
              <span className="text-muted-foreground">Note: </span>
              {booking.statusReason}
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Total: </span>
            {booking.price} {booking.currency}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Re-book
          </CardTitle>
          <CardDescription>
            Start checkout again with the same route, or notify our team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            onClick={() => {
              writeRebookSessionFromBooking(booking);
              router.push("/booking");
            }}
          >
            New booking (same route)
          </Button>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="rebook-note">Message to team (optional)</Label>
            <Textarea
              id="rebook-note"
              rows={3}
              value={rebookNote}
              onChange={(e) => setRebookNote(e.target.value)}
              placeholder="Dates, passengers, or special needs…"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={requestRebook.isPending}
              onClick={() =>
                requestRebook.mutate({
                  bookingId: booking.id,
                  note: rebookNote.trim() || undefined,
                })
              }
            >
              {requestRebook.isPending ? "Sending…" : "Request re-booking (notify team)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {canCancelSelfService && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive text-base">Cancel booking</CardTitle>
            <CardDescription>
              You can cancel online while this booking is still pending. Once it is
              confirmed, use the messages section below to request a cancellation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              disabled={cancelBooking.isPending}
              onClick={() => setCancelModalOpen(true)}
            >
              Cancel booking
            </Button>
            <ConfirmModal
              open={cancelModalOpen}
              onOpenChange={setCancelModalOpen}
              title="Cancel this booking?"
              description="This will cancel your pending trip. You can still message us if you change your mind or need a new booking."
              confirmText="Yes, cancel booking"
              cancelText="Keep booking"
              variant="destructive"
              isLoading={cancelBooking.isPending}
              onConfirm={() => {
                cancelBooking.mutate({ id: booking.id });
              }}
            />
          </CardContent>
        </Card>
      )}

      {canRequestCancelViaChat && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4" />
              Request cancellation
            </CardTitle>
            <CardDescription>
              Confirmed trips cannot be cancelled from your account. Send us a message
              and we will help you with changes or cancellation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setReply(
                  "I would like to request cancellation of this booking. Please let me know the next steps.",
                );
                requestAnimationFrame(() =>
                  document.getElementById("passenger-booking-reply")?.focus(),
                );
              }}
            >
              Draft message to team
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages
          </CardTitle>
          <CardDescription>
            {canRequestCancelViaChat
              ? "To cancel or change a confirmed trip, write to us here. We reply as soon as we can."
              : "Chat with our team about this booking. We reply as soon as we can."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="rounded-lg border border-border bg-muted/20 max-h-72 overflow-y-auto p-3 space-y-3"
            role="log"
          >
            {msgLoading ? (
              <p className="text-sm text-muted-foreground">Loading messages…</p>
            ) : !messages?.length ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm max-w-[90%]",
                    m.senderType === "ADMIN"
                      ? "bg-primary/10 ml-0 mr-auto"
                      : "bg-background border ml-auto mr-0",
                  )}
                >
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">
                    {m.senderType === "ADMIN"
                      ? "Evo Transport"
                      : m.senderName || "You"}{" "}
                    · {format(new Date(m.createdAt), "MMM d, HH:mm")}
                  </p>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="passenger-booking-reply" className="sr-only">
                Your message
              </Label>
              <Input
                id="passenger-booking-reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a message…"
                disabled={sendMessage.isPending}
              />
            </div>
            <Button type="submit" disabled={sendMessage.isPending || !reply.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
