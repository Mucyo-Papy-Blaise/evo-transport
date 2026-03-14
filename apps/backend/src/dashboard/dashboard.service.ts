import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

export interface DashboardStatsDto {
  totalBookings: number;
  totalRevenue: number;
  activeVehicles: number;
  totalCustomers: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rejectedBookings: number;
  revenueChange: number;
  bookingsChange: number;
  customersChange: number;
}

export interface RecentBookingDto {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    const [
      totalBookings,
      totalRevenueResult,
      statusCounts,
      totalCustomers,
      previousMonthBookings,
      previousMonthRevenue,
      previousMonthCustomers,
    ] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.aggregate({
        _sum: { price: true },
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
      }),
      this.prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.user.count({
        where: { isGuest: false },
      }),
      this.prisma.booking.count({
        where: {
          createdAt: {
            gte: this.getStartOfPreviousMonth(),
            lt: this.getStartOfCurrentMonth(),
          },
        },
      }),
      this.prisma.booking.aggregate({
        _sum: { price: true },
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          createdAt: {
            gte: this.getStartOfPreviousMonth(),
            lt: this.getStartOfCurrentMonth(),
          },
        },
      }),
      this.prisma.user.count({
        where: {
          isGuest: false,
          createdAt: {
            gte: this.getStartOfPreviousMonth(),
            lt: this.getStartOfCurrentMonth(),
          },
        },
      }),
    ]);

    const totalRevenue = Number(totalRevenueResult._sum.price ?? 0);
    const prevRevenue = Number(previousMonthRevenue._sum.price ?? 0);
    const revenueChange =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const bookingsChange =
      previousMonthBookings > 0
        ? ((totalBookings - previousMonthBookings) / previousMonthBookings) *
          100
        : 0;
    const customersChange =
      previousMonthCustomers > 0
        ? ((totalCustomers - previousMonthCustomers) / previousMonthCustomers) *
          100
        : 0;

    const byStatus = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.status]),
    );

    return {
      totalBookings,
      totalRevenue,
      activeVehicles: 0,
      totalCustomers,
      pendingBookings: byStatus[BookingStatus.PENDING] ?? 0,
      confirmedBookings: byStatus[BookingStatus.CONFIRMED] ?? 0,
      completedBookings: byStatus[BookingStatus.COMPLETED] ?? 0,
      cancelledBookings: byStatus[BookingStatus.CANCELLED] ?? 0,
      rejectedBookings: byStatus[BookingStatus.REJECTED] ?? 0,
      revenueChange: Math.round(revenueChange * 10) / 10,
      bookingsChange: Math.round(bookingsChange * 10) / 10,
      customersChange: Math.round(customersChange * 10) / 10,
    };
  }

  async getRecentBookings(limit: number = 5): Promise<RecentBookingDto[]> {
    const bookings = await this.prisma.booking.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return bookings.map((b) => ({
      id: b.id,
      bookingReference: b.bookingReference,
      customerName:
        (b.guestName ??
          [b.user?.firstName, b.user?.lastName].filter(Boolean).join(' ')) ||
        'Guest',
      customerEmail: b.guestEmail ?? b.user?.email ?? '',
      fromLocation: b.fromLocation,
      toLocation: b.toLocation,
      departureDate: b.departureDate.toISOString().slice(0, 10),
      departureTime: b.departureTime,
      price: Number(b.price),
      currency: b.currency,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }));
  }

  private getStartOfCurrentMonth(): Date {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getStartOfPreviousMonth(): Date {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
