'use client';

import { useState, useEffect } from 'react';
import { BookingFilters } from "@/components/admin/Bookingfilters";
import { BookingsTable } from '@/components/admin/Bookingstable';
import { AdminBooking, AdminBookingFilter } from '@/types/admin.types';
import { bookingApi } from '@/lib/api/booking.api';
import { toast } from '@/components/ui/toast';
import { BookingStatus } from '@/types';
import { useGlobalSearch } from '@/contexts/SearchContext';

export default function BookingsPage() {
  const { globalSearch } = useGlobalSearch();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<AdminBookingFilter>({
    page: 1,
    limit: 10,
  });

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Combine filters with global search
      const apiFilters: AdminBookingFilter = {
        ...filters,
        search: globalSearch || filters.search,
      };
      
      const response = await bookingApi.getAllBookings(apiFilters);
      setBookings(response.bookings as AdminBooking[]); // Cast if needed
      setTotal(response.total);
    } catch (error) {
      toast.error('Failed to load bookings', 'Please try again later');
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters, globalSearch]);

  const handleFilterChange = (newFilters: { status?: BookingStatus }) => {
    setFilters(prev => ({
      ...prev,
      status: newFilters.status,
      page: 1, 
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all bookings</p>
        </div>
        <BookingFilters 
          onFilterChange={handleFilterChange}
          totalBookings={total}
        />
      </div>

      <BookingsTable 
        bookings={bookings} 
        isLoading={isLoading}
      />
    </div>
  );
}