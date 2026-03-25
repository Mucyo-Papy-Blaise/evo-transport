"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";
import { useMyBookings } from "@/hooks/useBooking";
import { useGlobalSearch } from "@/contexts/SearchContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function MyBookingsPage() {
  const { globalSearch } = useGlobalSearch();
  const { data, isLoading } = useMyBookings({
    limit: 50,
    sortBy: "departureDate",
    sortOrder: "desc",
  });
  const list = useMemo(() => {
    const raw = data?.bookings ?? [];
    const q = globalSearch.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter(
      (b) =>
        b.bookingReference.toLowerCase().includes(q) ||
        b.fromLocation.toLowerCase().includes(q) ||
        b.toLocation.toLowerCase().includes(q),
    );
  }, [data?.bookings, globalSearch]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Open a trip for messages with our team, re-book, or cancel when
          allowed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All trips</CardTitle>
          <CardDescription>
            {isLoading ? "Loading…" : `${list.length} shown`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : list.length === 0 ? (
            <div className="text-sm text-muted-foreground space-y-3">
              <p>You don&apos;t have any bookings linked to this account.</p>
              <Button asChild variant="default" size="sm">
                <Link href="/">Plan a trip</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {list.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/dashboard/bookings/${b.id}`}
                    className="flex items-start justify-between gap-4 px-4 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {b.fromLocation} → {b.toLocation}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Ref {b.bookingReference} · Depart{" "}
                        {format(new Date(b.departureDate), "PPP")} ·{" "}
                        {b.passengers} passenger{b.passengers !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs mt-1 capitalize text-muted-foreground">
                        Status: {b.status.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
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
