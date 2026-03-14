'use client';

import { StatsCard } from '@/components/admin/StatsCard';
import { RecentBookings } from '@/components/admin/Recentbookings';
import { BookingStatusPieChart } from '@/components/admin/BookingStatusPieChart';
import { BookOpen, CreditCard, Car, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useDashboardStats, useRecentBookings } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentBookings, isLoading: recentLoading } = useRecentBookings(5);

  const displayStats = stats;

  const formatCurrency = (value: number) => {
    return `${(value / 1000).toFixed(0)}K FRw`;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </>
        ) : displayStats ? (
          <>
            <StatsCard
              title="Total Bookings"
              value={displayStats.totalBookings.toLocaleString()}
              change={displayStats.bookingsChange}
              icon={BookOpen}
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(displayStats.totalRevenue)}
              change={displayStats.revenueChange}
              icon={CreditCard}
            />
            <StatsCard
              title="Active Vehicles"
              value={displayStats.activeVehicles}
              icon={Car}
            />
            <StatsCard
              title="Total Customers"
              value={displayStats.totalCustomers.toLocaleString()}
              change={displayStats.customersChange}
              icon={Users}
            />
          </>
        ) : (
          <>
            <StatsCard title="Total Bookings" value="—" icon={BookOpen} />
            <StatsCard title="Total Revenue" value="—" icon={CreditCard} />
            <StatsCard title="Active Vehicles" value="—" icon={Car} />
            <StatsCard title="Total Customers" value="—" icon={Users} />
          </>
        )}
      </div>

      {/* Pie chart: bookings by status */}
      <BookingStatusPieChart stats={displayStats} isLoading={statsLoading} />

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-600 uppercase">Pending</span>
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : displayStats?.pendingBookings ?? "—"}
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600 uppercase">Confirmed</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : displayStats?.confirmedBookings ?? "—"}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600 uppercase">Completed</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : displayStats?.completedBookings ?? "—"}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600 uppercase">Cancelled</span>
          </div>
          <div className="text-2xl font-bold text-gray-700">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : displayStats?.cancelledBookings ?? "—"}
          </div>
        </div>
      </div>

      {/* Recent bookings table */}
      <RecentBookings 
        bookings={recentBookings} 
        isLoading={recentLoading} 
      />
    </div>
  );
}