import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from 'src/mailer/mailer.service';
import { NotificationService } from '../notifications/notification.service';
import {
  UpdateBookingStatusDto,
  AdminRespondDto,
  BookingFilter,
  BookingResponse,
  BookingListResponse,
} from 'src/types/booking.types';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  BookingStatus,
  Currency,
  UserRole,
  AccountStatus,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { format } from 'date-fns';
import { ResponseUtil } from 'src/utils/response.util';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: MailerService,
    private readonly notificationService: NotificationService,
  ) {}

  // Generate unique booking reference: EVO-YYYYMMDD-XXXXX
  private generateBookingReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = randomBytes(3).toString('hex').toUpperCase().slice(0, 5);

    return `EVO-${year}${month}${day}-${random}`;
  }

  private mapBookingToResponse(booking: any): BookingResponse {
    const userType = booking.userId ? 'REGISTERED' : 'GUEST';

    return {
      id: booking.id,
      bookingReference: booking.bookingReference,
      userId: booking.userId,
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      userType,
      tripType: booking.tripType,
      fromLocation: booking.fromLocation,
      toLocation: booking.toLocation,
      fromCode: booking.fromCode,
      toCode: booking.toCode,
      fromCity: booking.fromCity,
      toCity: booking.toCity,
      departureDate: booking.departureDate,
      returnDate: booking.returnDate,
      departureTime: booking.departureTime,
      returnTime: booking.returnTime,
      passengers: booking.passengers,
      price: booking.price,
      currency: booking.currency,
      status: booking.status,
      adminNotes: booking.adminNotes,
      adminRespondedAt: booking.adminRespondedAt,
      adminRespondedBy: booking.adminRespondedBy,
      createdAt: booking.createdAt,
      confirmedAt: booking.confirmedAt,
      cancelledAt: booking.cancelledAt,
      user: booking.user
        ? {
            id: booking.user.id,
            email: booking.user.email,
            firstName: booking.user.firstName,
            lastName: booking.user.lastName,
          }
        : null,
    };
  }

  async createBooking(
    userId: string | null,
    guestSessionId: string | null,
    dto: CreateBookingDto,
  ): Promise<BookingResponse> {
    this.logger.log(
      `Creating booking for ${userId ? 'user: ' + userId : 'guest'}`,
    );

    // Validate guest info if no user
    if (!userId && !dto.guestEmail) {
      throw new BadRequestException(
        'Guest email is required for non-registered users',
      );
    }

    const bookingReference = this.generateBookingReference();

    // Convert date strings to Date objects
    const departureDate = new Date(dto.departureDate);
    departureDate.setHours(0, 0, 0, 0); // Set to start of day

    let returnDate: Date | null = null;
    if (dto.returnDate) {
      returnDate = new Date(dto.returnDate);
      returnDate.setHours(0, 0, 0, 0); // Set to start of day
    }

    // Create booking in database
    const booking = await this.prisma.booking.create({
      data: {
        bookingReference,
        userId,
        guestSessionId,
        guestEmail: dto.guestEmail,
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        tripType: dto.tripType,
        fromLocation: dto.fromLocation,
        toLocation: dto.toLocation,
        fromCode: dto.fromCode,
        toCode: dto.toCode,
        fromCity: dto.fromCity,
        toCity: dto.toCity,
        departureDate,
        returnDate,
        departureTime: dto.departureTime,
        returnTime: dto.returnTime,
        passengers: dto.passengers,
        price: dto.price,
        currency: dto.currency || Currency.RWF,
        status: BookingStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send emails using your template system
    await this.sendBookingEmails(booking);

    return this.mapBookingToResponse(booking);
  }

  private async sendBookingEmails(booking: any): Promise<void> {
    const customerName =
      booking.guestName ||
      (booking.user
        ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim()
        : 'Customer') ||
      'Valued Customer';

    const customerEmail = booking.guestEmail || booking.user?.email;

    // 1. Send confirmation email to customer using your template
    if (customerEmail) {
      try {
        await this.emailService.sendTemplatedEmail(
          customerEmail,
          'BOOKING',
          'BOOKING_CONFIRMATION',
          {
            customerName,
            bookingReference: booking.bookingReference,
            fromLocation: booking.fromLocation,
            toLocation: booking.toLocation,
            fromCode: booking.fromCode,
            toCode: booking.toCode,
            departureDate: format(booking.departureDate, 'PPP'),
            departureTime: booking.departureTime,
            returnDate: booking.returnDate
              ? format(booking.returnDate, 'PPP')
              : null,
            returnTime: booking.returnTime,
            passengers: booking.passengers,
            price: booking.price,
            currency: booking.currency,
            tripType: booking.tripType,
            status: 'PENDING',
          },
        );

        // Track notification
        await this.notificationService.create({
          bookingId: booking.id,
          userId: booking.userId,
          recipientEmail: customerEmail,
          recipientName: customerName,
          recipientType: booking.userId ? 'CUSTOMER' : 'GUEST',
          type: 'BOOKING_CREATED_CUSTOMER',
          subject: `Booking Confirmation: ${booking.bookingReference}`,
          status: 'SENT',
        });
      } catch (error) {
        this.logger.error(`Failed to send customer email: ${error.message}`);
      }
    }

    // 2. Send notification to admin(s) using your template
    try {
      // Get all admin emails
      const admins = await this.prisma.user.findMany({
        where: { role: UserRole.ADMIN, status: AccountStatus.ACTIVE },
        select: { email: true, firstName: true, id: true },
      });

      const adminUrl = `${process.env.ADMIN_URL}/bookings/${booking.id}`;

      for (const admin of admins) {
        await this.emailService.sendTemplatedEmail(
          admin.email,
          'BOOKING',
          'ADMIN_BOOKING_NOTIFICATION',
          {
            adminName: admin.firstName || 'Admin',
            bookingReference: booking.bookingReference,
            customerName,
            customerEmail: customerEmail || 'No email provided',
            customerPhone: booking.guestPhone || 'Not provided',
            userType: booking.userId ? 'REGISTERED' : 'GUEST',
            fromLocation: booking.fromLocation,
            toLocation: booking.toLocation,
            fromCode: booking.fromCode,
            toCode: booking.toCode,
            departureDate: format(booking.departureDate, 'PPP'),
            departureTime: booking.departureTime,
            passengers: booking.passengers,
            price: booking.price,
            currency: booking.currency,
            createdAt: format(booking.createdAt, 'PPP pp'),
            adminUrl,
          },
        );

        // Create in-app notification for admin
        await this.notificationService.create({
          bookingId: booking.id,
          userId: admin.id,
          recipientEmail: admin.email,
          recipientName: admin.firstName || 'Admin',
          recipientType: 'ADMIN',
          type: 'BOOKING_CREATED_ADMIN',
          subject: `New Booking: ${booking.bookingReference}`,
          content: `New booking from ${customerName} - ${booking.fromLocation} to ${booking.toLocation}`,
          status: 'SENT',
        });
      }
    } catch (error) {
      this.logger.error(`Failed to send admin notifications: ${error.message}`);
    }
  }

  async getBookings(
    filter: BookingFilter,
    isAdmin: boolean = false,
  ): Promise<BookingListResponse> {
    const {
      status,
      fromDate,
      toDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    if (search) {
      where.OR = [
        { bookingReference: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { fromLocation: { contains: search, mode: 'insensitive' } },
        { toLocation: { contains: search, mode: 'insensitive' } },
      ];
    }

    // If not admin, only show user's own bookings
    if (!isAdmin && filter.userId) {
      where.userId = filter.userId;
    }

    // Get total count
    const total = await this.prisma.booking.count({ where });

    // Get bookings
    const bookings = await this.prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      bookings: bookings.map((b) => this.mapBookingToResponse(b)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getBookingById(id: string): Promise<BookingResponse> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return this.mapBookingToResponse(booking);
  }

  async getBookingByReference(reference: string): Promise<BookingResponse> {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingReference: reference },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with reference ${reference} not found`,
      );
    }

    return this.mapBookingToResponse(booking);
  }

  async updateBookingStatus(
    id: string,
    adminId: string,
    dto: UpdateBookingStatusDto,
  ): Promise<BookingResponse> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: any = {
      status: dto.status,
      adminRespondedAt: new Date(),
      adminRespondedBy: adminId,
    };

    // Add reason to admin notes if provided
    if (dto.reason) {
      updateData.adminNotes = dto.reason;
    }

    // Set timestamps based on status
    if (dto.status === BookingStatus.CONFIRMED) {
      updateData.confirmedAt = new Date();
    } else if (dto.status === BookingStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send email notification to customer about status change using your template
    await this.sendStatusUpdateEmail(updatedBooking, dto);

    return this.mapBookingToResponse(updatedBooking);
  }

  private async sendStatusUpdateEmail(
    booking: any,
    dto: UpdateBookingStatusDto,
  ): Promise<void> {
    const customerEmail = booking.guestEmail || booking.user?.email;
    const customerName =
      booking.guestName ||
      (booking.user
        ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim()
        : 'Customer') ||
      'Valued Customer';

    if (!customerEmail) return;

    try {
      // Determine which template to use based on status
      let templateType = 'BOOKING_STATUS_UPDATED';
      if (dto.status === BookingStatus.CONFIRMED) {
        templateType = 'BOOKING_CONFIRMED';
      } else if (dto.status === BookingStatus.REJECTED) {
        templateType = 'BOOKING_REJECTED';
      } else if (dto.status === BookingStatus.CANCELLED) {
        templateType = 'BOOKING_CANCELLED';
      }

      await this.emailService.sendTemplatedEmail(
        customerEmail,
        'BOOKING',
        templateType as any,
        {
          customerName,
          bookingReference: booking.bookingReference,
          status: dto.status,
          reason: dto.reason ?? '',
          fromLocation: booking.fromLocation,
          toLocation: booking.toLocation,
          departureDate: format(booking.departureDate, 'PPP'),
          departureTime: booking.departureTime,
          supportEmail: process.env.SUPPORT_EMAIL || 'support@evotransport.rw',
          dashboardUrl: booking.userId
            ? `${process.env.FRONTEND_URL}/dashboard/bookings/${booking.id}`
            : `${process.env.FRONTEND_URL}/booking-lookup?ref=${booking.bookingReference}`,
        },
      );

      await this.notificationService.create({
        bookingId: booking.id,
        userId: booking.userId,
        recipientEmail: customerEmail,
        recipientName: customerName,
        recipientType: booking.userId ? 'CUSTOMER' : 'GUEST',
        type: `BOOKING_${dto.status}`,
        subject: `Booking ${dto.status.toLowerCase()}: ${booking.bookingReference}`,
        status: 'SENT',
      });
    } catch (error) {
      this.logger.error(`Failed to send status update email: ${error.message}`);
    }
  }

  async adminRespond(id: string, adminId: string, dto: AdminRespondDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Save admin response as note
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        adminNotes: dto.message,
        adminRespondedAt: new Date(),
        adminRespondedBy: adminId,
      },
    });

    // Send email to customer if requested using your template
    if (dto.sendEmail) {
      const customerEmail = booking.guestEmail || booking.user?.email;
      const customerName =
        booking.guestName ||
        (booking.user
          ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim()
          : 'Customer') ||
        'Valued Customer';

      if (customerEmail) {
        try {
          await this.emailService.sendTemplatedEmail(
            customerEmail,
            'BOOKING',
            'ADMIN_RESPONSE',
            {
              customerName,
              bookingReference: booking.bookingReference,
              message: dto.message,
              supportEmail:
                process.env.SUPPORT_EMAIL || 'support@evotransport.rw',
            },
          );

          await this.notificationService.create({
            bookingId: booking.id,
            userId: booking.userId,
            recipientEmail: customerEmail,
            recipientName: customerName,
            recipientType: booking.userId ? 'CUSTOMER' : 'GUEST',
            type: 'ADMIN_RESPONSE',
            subject: `Response to your booking: ${booking.bookingReference}`,
            status: 'SENT',
          });
        } catch (error) {
          this.logger.error(
            `Failed to send admin response email: ${error.message}`,
          );
        }
      }
    }

    return ResponseUtil.success({}, 'Response sent successfully');
  }

  async getPopularRoutes(limit: number = 6) {
    const popularRoutes = await this.prisma.booking.groupBy({
      by: [
        'fromLocation',
        'toLocation',
        'fromCode',
        'toCode',
        'fromCity',
        'toCity',
      ],
      where: {
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
      },
      _count: {
        fromLocation: true,
      },
      orderBy: {
        _count: {
          fromLocation: 'desc',
        },
      },
      take: limit,
    });

    const routes = popularRoutes.map((route) => ({
      fromLocation: route.fromLocation,
      toLocation: route.toLocation,
      fromCode: route.fromCode,
      toCode: route.toCode,
      fromCity: route.fromCity,
      toCity: route.toCity,
      bookingCount: route._count.fromLocation,
    }));

    return ResponseUtil.success(routes, 'Popular routes fetched successfully');
  }

  async getMyBookings(userId: string, filter: BookingFilter) {
    const result = await this.getBookings(
      {
        ...filter,
        userId,
      },
      false,
    );

    return ResponseUtil.success(result, 'Bookings fetched successfully');
  }

  async cancelBooking(userId: string, bookingId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      throw new UnauthorizedException('You can only cancel your own bookings');
    }

    // Check if booking can be cancelled
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new BadRequestException('This booking cannot be cancelled');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        adminNotes: reason
          ? `Cancelled by user: ${reason}`
          : 'Cancelled by user',
        cancelledAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify admin about cancellation
    const admins = await this.prisma.user.findMany({
      where: { role: UserRole.ADMIN, status: AccountStatus.ACTIVE },
      select: { email: true, firstName: true, id: true },
    });

    const customerName =
      updatedBooking.guestName ||
      (updatedBooking.user
        ? `${updatedBooking.user.firstName || ''} ${updatedBooking.user.lastName || ''}`.trim()
        : 'Customer') ||
      'Valued Customer';

    for (const admin of admins) {
      await this.notificationService.create({
        bookingId: updatedBooking.id,
        userId: admin.id,
        recipientEmail: admin.email,
        recipientName: admin.firstName || 'Admin',
        recipientType: 'ADMIN',
        type: 'BOOKING_CANCELLED_BY_USER',
        subject: `Booking Cancelled: ${updatedBooking.bookingReference}`,
        content: `Booking ${updatedBooking.bookingReference} was cancelled by ${customerName}`,
        status: 'SENT',
      });
    }

    return ResponseUtil.success(
      this.mapBookingToResponse(updatedBooking),
      'Booking cancelled successfully',
    );
  }

  async checkBookingAvailability(departureDate: Date, route: string) {
    // Simple availability check - count bookings for that date
    const dateStart = new Date(departureDate);
    dateStart.setHours(0, 0, 0, 0);

    const dateEnd = new Date(departureDate);
    dateEnd.setHours(23, 59, 59, 999);

    const bookingsCount = await this.prisma.booking.count({
      where: {
        departureDate: {
          gte: dateStart,
          lte: dateEnd,
        },
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
        },
      },
    });

    // Assume max 20 bookings per day for demo
    const available = bookingsCount < 20;
    const remainingSpots = Math.max(0, 20 - bookingsCount);

    return ResponseUtil.success(
      {
        available,
        remainingSpots,
        totalBookings: bookingsCount,
        date: departureDate,
      },
      'Availability checked successfully',
    );
  }
}
