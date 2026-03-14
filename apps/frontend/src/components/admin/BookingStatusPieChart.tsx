'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DashboardStats } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: '#f59e0b' },
  CONFIRMED: { label: 'Confirmed', color: '#10b981' },
  COMPLETED: { label: 'Completed', color: '#3b82f6' },
  CANCELLED: { label: 'Cancelled', color: '#6b7280' },
  REJECTED: { label: 'Rejected', color: '#ef4444' },
};

interface BookingStatusPieChartProps {
  stats: DashboardStats | null | undefined;
  isLoading?: boolean;
  className?: string;
}

export function BookingStatusPieChart({ stats, isLoading, className }: BookingStatusPieChartProps) {
  const data = useMemo(() => {
    if (!stats) return [];
    return [
      { name: STATUS_CONFIG.PENDING.label, value: stats.pendingBookings, status: 'PENDING' },
      { name: STATUS_CONFIG.CONFIRMED.label, value: stats.confirmedBookings, status: 'CONFIRMED' },
      { name: STATUS_CONFIG.COMPLETED.label, value: stats.completedBookings, status: 'COMPLETED' },
      { name: STATUS_CONFIG.CANCELLED.label, value: stats.cancelledBookings, status: 'CANCELLED' },
      {
        name: STATUS_CONFIG.REJECTED.label,
        value: stats.rejectedBookings ?? 0,
        status: 'REJECTED',
      },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  if (isLoading) {
    return (
      <div className={`rounded-2xl border border-border bg-card p-6 ${className ?? ''}`}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Bookings by status</h3>
        <div className="h-70 flex items-center justify-center bg-muted/30 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!total || data.length === 0) {
    return (
      <div className={`rounded-2xl border border-border bg-card p-6 ${className ?? ''}`}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Bookings by status</h3>
        <div className="h-70 flex items-center justify-center text-muted-foreground text-sm">
          No booking data yet
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-border bg-card p-6 ${className ?? ''}`}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Bookings by status</h3>
      <div className="h-70 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_CONFIG[entry.status]?.color ?? '#94a3b8'}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                `${value} (${total ? ((value / total) * 100).toFixed(1) : 0}%)`
              }
            />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
