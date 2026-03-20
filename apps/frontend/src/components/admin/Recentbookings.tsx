'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from "@/utils/utils";
import { RecentBooking } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, Calendar, Clock, MapPin } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600",
  CONFIRMED: "bg-emerald-50 text-emerald-600",
  REJECTED: "bg-red-50 text-red-500",
  CANCELLED: "bg-gray-50 text-gray-500",
  COMPLETED: "bg-blue-50 text-blue-600",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

interface RecentBookingsProps {
  bookings?: RecentBooking[];
  isLoading?: boolean;
}

export function RecentBookings({ bookings = [], isLoading }: RecentBookingsProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Booking ID", "Customer", "Route", "Date/Time", "Status", "Price"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-xs p-12 text-center">
        <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No recent bookings</h3>
        <p className="text-muted-foreground">There are no bookings to display at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Recent Bookings</h3>
        <Link
          href="/admin/bookings"
          className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {[
                "Booking ID",
                "Customer",
                "Route",
                "Date/Time",
                "Status",
                "Price",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => (
              <tr 
                key={booking.id} 
                className="hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/admin/bookings/${booking.id}`}
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground font-mono text-xs">
                    {booking.bookingReference}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(booking.createdAt), 'MMM d, HH:mm')}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{booking.customerName}</p>
                  <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-sm truncate max-w-37.5">
                      {booking.fromLocation.split(' ').slice(0, 2).join(' ')} → {booking.toLocation.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3 text-primary" />
                    <span>{format(new Date(booking.departureDate), 'MMM d')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{booking.departureTime}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "capitalize text-xs font-semibold px-2.5 py-1 rounded-full",
                      STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-600"
                    )}
                  >
                    {STATUS_LABELS[booking.status] || booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-primary">
                    {booking.price.toLocaleString()} Euro
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}