"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useMyBookings } from "@/hooks/useBooking";
import { useUnreadCount } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Bell, ArrowRight } from "lucide-react";

export default function PassengerDashboardPage() {
  const { data, isLoading } = useMyBookings({ limit: 5, sortOrder: "desc" });
  const { data: unread } = useUnreadCount(true);
  const bookings = data?.bookings ?? [];
  const upcoming = bookings.filter(
    (b) =>
      b.status === "PENDING" ||
      b.status === "CONFIRMED" ||
      b.status === "COMPLETED",
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your bookings, messages, and updates in one place.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              {(unread?.count ?? 0) > 0
                ? `${unread!.count} unread`
                : "You’re all caught up"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/notifications">
                View notifications <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Bookings
            </CardTitle>
            <CardDescription>
              {isLoading ? "Loading…" : `${data?.total ?? 0} total`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/bookings">
                All bookings <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent bookings</CardTitle>
          <CardDescription>Latest activity on your account</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bookings yet.{" "}
              <Link href="/" className="text-primary font-medium hover:underline">
                Search a route
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {upcoming.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/dashboard/bookings/${b.id}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {b.fromLocation} → {b.toLocation}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.bookingReference} ·{" "}
                        {format(new Date(b.departureDate), "MMM d, yyyy")} ·{" "}
                        <span className="capitalize">{b.status.toLowerCase()}</span>
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
