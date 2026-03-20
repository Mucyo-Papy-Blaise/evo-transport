"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/utils/utils";
import { AdminBooking } from "@/types/admin.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Calendar, Clock, MapPin } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-600", label: "Pending" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Confirmed" },
  REJECTED: { bg: "bg-red-50", text: "text-red-500", label: "Rejected" },
  CANCELLED: { bg: "bg-gray-50", text: "text-gray-500", label: "Cancelled" },
  COMPLETED: { bg: "bg-blue-50", text: "text-blue-600", label: "Completed" },
};

interface BookingsTableProps {
  bookings: AdminBooking[];
  isLoading?: boolean;
  onBookingClick?: (booking: AdminBooking) => void;
}

export function BookingsTable({ bookings, isLoading, onBookingClick }: BookingsTableProps) {
  const router = useRouter();

  const handleRowClick = (booking: AdminBooking) => {
    if (onBookingClick) {
      onBookingClick(booking);
    } else {
      router.push(`/admin/bookings/${booking.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Booking ID", "Customer", "Route", "Date/Time", "Status", "Price"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-border">
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

  if (bookings.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-xs p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          There are no bookings matching your filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["Booking ID", "Customer", "Route", "Date/Time", "Status", "Price"].map((h) => (
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
            {bookings.map((booking) => {
              const customerName = booking.guestName || 
                (booking.user ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() : 'Guest') || 
                'Anonymous';
              
              const customerEmail = booking.guestEmail || booking.user?.email || 'No email';
              
              const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
              
              return (
                <tr
                  key={booking.id}
                  onClick={() => handleRowClick(booking)}
                  className="hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground font-mono text-xs">
                      {booking.bookingReference}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(booking.createdAt), 'MMM d, yyyy • HH:mm')}
                    </p>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customerName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customerEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-foreground">{booking.fromCity || '?'}</span>
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-foreground">{booking.toCity || '?'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-40">
                      {booking.fromLocation.split(' ').slice(0, 2).join(' ')} → {booking.toLocation.split(' ').slice(0, 2).join(' ')}
                    </p>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-primary" />
                      <span>{format(new Date(booking.departureDate), 'MMM d')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{booking.departureTime}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <Badge className={cn(statusStyle.bg, statusStyle.text, "border-0")}>
                      {statusStyle.label}
                    </Badge>
                  </td>
                  
                  <td className="px-6 py-4">
                    <p className="font-semibold text-primary">
                      {booking.price.toLocaleString()} Euro
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.passengers} {booking.passengers > 1 ? 'pax' : 'pax'}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}