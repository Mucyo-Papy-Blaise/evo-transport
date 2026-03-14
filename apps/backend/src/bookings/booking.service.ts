import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
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
import { BookingFilterDto } from './dto/booking-filter.dto';
import { BookingListResponseDto } from './dto/booking-response.dto';
import { LongDistanceRequestDto } from './dto/long-distance-request.dto';

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

    // Parse passengerDetails if it's stored as JSON
    const passengerDetails = booking.passengerDetails
      ? typeof booking.passengerDetails === 'string'
        ? JSON.parse(booking.passengerDetails)
        : booking.passengerDetails
      : [];

    // Calculate passenger summary
    const passengerSummary = this.calculatePassengerSummary(passengerDetails);

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
      message: booking.message,
      passengerDetails,
      passengerSummary,
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
    if (!userId && !dto.guestPhone?.trim()) {
      throw new BadRequestException('Phone number is required');
    }

    // Validate passenger details
    if (!dto.passengerDetails || dto.passengerDetails.length === 0) {
      throw new BadRequestException('Passenger details are required');
    }

    // Calculate total passengers
    const totalPassengers = dto.passengerDetails.length;

    const bookingReference = this.generateBookingReference();

    // Convert date strings to Date objects
    const departureDate = new Date(dto.departureDate);
    departureDate.setHours(0, 0, 0, 0);

    let returnDate: Date | null = null;
    if (dto.returnDate) {
      returnDate = new Date(dto.returnDate);
      returnDate.setHours(0, 0, 0, 0);
    }

    // Calculate passenger summary for logging
    const summary = this.calculatePassengerSummary(dto.passengerDetails);
    this.logger.log(`Passenger summary: ${JSON.stringify(summary)}`);

    // Create booking in database
    let booking: any;
    try {
      booking = await this.prisma.booking.create({
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
          passengers: totalPassengers,
          // Cast to Prisma.InputJsonValue — required in Prisma 5 for Json? fields
          passengerDetails:
            dto.passengerDetails as unknown as Prisma.InputJsonValue,
          // Coerce to number in case the DTO sends price as a string
          price: Number(dto.price),
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
    } catch (error) {
      this.logger.error(
        `Failed to create booking — Prisma error: ${error.code ?? 'UNKNOWN'} | ${error.message}`,
        error.stack,
      );
      throw error;
    }

    // Send emails using your template system
    await this.sendBookingEmails(booking);

    return this.mapBookingToResponse(booking);
  }

  async sendEmailOverDistance(
    userId: string | null,
    guestSessionId: string | null,
    dto: CreateBookingDto | LongDistanceRequestDto,
    distance: number,
  ): Promise<{
    message: string;
    requestId: string;
    bookingId: string;
    createdAt: Date;
  }> {
    this.logger.log(
      `Sending long distance email request for journey of ${distance}km`,
    );

    // Get customer information - works for both guests and logged-in users
    let customerEmail = dto.guestEmail;
    let customerName = dto.guestName || 'Valued Customer';
    let customerPhone = dto.guestPhone || 'Not provided';

    // If user is logged in, get their info from the database
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true },
      });

      if (user) {
        customerEmail = user.email;
        customerName =
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || 'Valued Customer';
        customerPhone = dto.guestPhone || 'Not provided';
      }
    }

    // Validate email is present
    if (!customerEmail) {
      throw new BadRequestException(
        userId
          ? 'User email not found. Please update your profile.'
          : 'Email is required for long distance requests',
      );
    }

    // Validate that this is indeed a long distance request
    if (distance <= 400) {
      throw new BadRequestException(
        'This route is not considered long distance',
      );
    }

    try {
      // Generate a request ID
      const requestId = this.generateLongDistanceRequestReference();

      // Create a pending booking record with price set to 0 (to be set by admin)
      const pendingBooking = await this.prisma.booking.create({
        data: {
          bookingReference: requestId,
          userId,
          guestSessionId,
          guestEmail: customerEmail,
          guestName: customerName,
          guestPhone: customerPhone,
          tripType: dto.tripType,
          fromLocation: dto.fromLocation,
          toLocation: dto.toLocation,
          fromCode: dto.fromCode,
          toCode: dto.toCode,
          fromCity: dto.fromCity,
          toCity: dto.toCity,
          departureDate: new Date(dto.departureDate),
          returnDate: dto.returnDate ? new Date(dto.returnDate) : null,
          departureTime: dto.departureTime,
          returnTime: dto.returnTime,
          passengers: dto.passengerDetails.length,
          passengerDetails:
            dto.passengerDetails as unknown as Prisma.InputJsonValue,
          price: 0,
          currency: dto.currency || Currency.RWF,
          status: BookingStatus.PENDING,
          adminNotes: `LONG DISTANCE REQUEST: ${distance}km - Awaiting admin response`,
        },
      });

      // Get all active admin users
      const admins = await this.prisma.user.findMany({
        where: {
          role: UserRole.ADMIN,
          status: AccountStatus.ACTIVE,
        },
        select: {
          email: true,
          firstName: true,
          id: true,
          lastName: true,
        },
      });

      // Calculate passenger summary
      const passengerSummary = this.calculatePassengerSummary(
        dto.passengerDetails,
      );

      // Format passenger list
      const passengerList = dto.passengerDetails
        .map(
          (p, index) =>
            `${index + 1}. ${p.name} (${p.type})${p.requiresAssistance ? ' - Requires Assistance' : ''}`,
        )
        .join('\n');

      const passengerSummaryText = `
Adults: ${passengerSummary.adultCount}
Children: ${passengerSummary.childCount}
Infants: ${passengerSummary.infantCount}
Seniors: ${passengerSummary.seniorCount}
Require Assistance: ${passengerSummary.requiresAssistanceCount}
    `.trim();

      if (admins.length === 0) {
        this.logger.warn(
          'No active admin users found to send long distance request to',
        );

        // Still send to a default admin email if configured
        if (process.env.ADMIN_EMAIL) {
          await this.emailService.sendTemplatedEmail(
            process.env.ADMIN_EMAIL,
            'BOOKING',
            'LONG_DISTANCE_REQUEST_ADMIN',
            {
              adminName: 'Admin',
              customerName,
              customerEmail,
              customerPhone,
              userType: userId ? 'REGISTERED' : 'GUEST',
              isRegisteredUser: userId ? 'Yes' : 'No',
              isGuestUser: !userId ? 'Yes' : 'No',
              requestId,
              bookingId: pendingBooking.id,
              fromLocation: dto.fromLocation,
              toLocation: dto.toLocation,
              fromCode: dto.fromCode || dto.fromLocation,
              toCode: dto.toCode || dto.toLocation,
              fromCity: dto.fromCity || dto.fromLocation,
              toCity: dto.toCity || dto.toLocation,
              distance: distance.toString(),
              isLongDistance: 'Yes',
              departureDate: format(new Date(dto.departureDate), 'PPP'),
              departureTime: dto.departureTime,
              returnDate: dto.returnDate
                ? format(new Date(dto.returnDate), 'PPP')
                : 'One-way trip',
              returnTime: dto.returnTime || 'N/A',
              totalPassengers: dto.passengerDetails.length.toString(),
              passengerSummary: passengerSummaryText,
              passengerList,
              message: dto.message || 'No special requests',
              adminResponseUrl: `${process.env.ADMIN_URL}/bookings/${pendingBooking.id}/respond`,
              requestedAt: format(new Date(), 'PPP pp'),
            },
          );
        }
      } else {
        // Send email to each admin
        for (const admin of admins) {
          await this.emailService.sendTemplatedEmail(
            admin.email,
            'BOOKING',
            'LONG_DISTANCE_REQUEST_ADMIN',
            {
              adminName: admin.firstName || 'Admin',
              customerName,
              customerEmail,
              customerPhone,
              userType: userId ? 'REGISTERED' : 'GUEST',
              isRegisteredUser: userId ? 'Yes' : 'No',
              isGuestUser: !userId ? 'Yes' : 'No',
              requestId,
              bookingId: pendingBooking.id,
              fromLocation: dto.fromLocation,
              toLocation: dto.toLocation,
              fromCode: dto.fromCode || dto.fromLocation,
              toCode: dto.toCode || dto.toLocation,
              fromCity: dto.fromCity || dto.fromLocation,
              toCity: dto.toCity || dto.toLocation,
              distance: distance.toString(),
              isLongDistance: 'Yes',
              departureDate: format(new Date(dto.departureDate), 'PPP'),
              departureTime: dto.departureTime,
              returnDate: dto.returnDate
                ? format(new Date(dto.returnDate), 'PPP')
                : 'One-way trip',
              returnTime: dto.returnTime || 'N/A',
              totalPassengers: dto.passengerDetails.length.toString(),
              passengerSummary: passengerSummaryText,
              passengerList,
              message: dto.message || 'No special requests',
              adminResponseUrl: `${process.env.ADMIN_URL}/bookings/${pendingBooking.id}/respond`,
              requestedAt: format(new Date(), 'PPP pp'),
            },
          );

          // Create in-app notification for admin
          await this.notificationService.create({
            bookingId: pendingBooking.id,
            userId: admin.id,
            recipientEmail: admin.email,
            recipientName: admin.firstName || 'Admin',
            recipientType: 'ADMIN',
            type: 'LONG_DISTANCE_REQUEST',
            subject: `Long Distance Trip Request: ${dto.fromCode || dto.fromLocation} to ${dto.toCode || dto.toLocation} (${distance}km)`,
            content: `${userId ? 'Registered user' : 'Guest'} ${customerName} requested a long distance trip from ${dto.fromLocation} to ${dto.toLocation} (${distance}km).`,
            status: 'SENT',
          });
        }
      }

      // Send confirmation email to customer
      await this.emailService.sendTemplatedEmail(
        customerEmail,
        'BOOKING',
        'LONG_DISTANCE_REQUEST_CUSTOMER',
        {
          customerName,
          requestId,
          fromLocation: dto.fromLocation,
          toLocation: dto.toLocation,
          fromCode: dto.fromCode || dto.fromLocation,
          toCode: dto.toCode || dto.toLocation,
          distance,
          supportEmail: process.env.SUPPORT_EMAIL || 'support@evotransport.rw',
          responseTime: '24 hours',
          dashboardUrl: userId
            ? `${process.env.FRONTEND_URL}/dashboard/bookings`
            : `${process.env.FRONTEND_URL}/booking-lookup`,
          userType: userId ? 'registered' : 'guest',
        },
      );

      this.logger.log(
        `Long distance request ${requestId} sent successfully for ${dto.fromCode} to ${dto.toCode} (User: ${userId || 'guest'})`,
      );

      return {
        message:
          'Your long distance request has been sent to our admin team. You will receive a response within 24 hours.',
        requestId,
        bookingId: pendingBooking.id,
        createdAt: pendingBooking.createdAt,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send long distance email request: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Failed to process long distance request. Please try again.',
      );
    }
  }

  // Generate unique request reference: REQ-YYYYMMDD-XXXXX
  private generateLongDistanceRequestReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = randomBytes(3).toString('hex').toUpperCase().slice(0, 5);

    return `REQ-${year}${month}${day}-${random}`;
  }

  private async sendLongDistanceEmailToAdmin(
    adminEmail: string,
    adminName: string,
    data: {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      fromLocation: string;
      toLocation: string;
      fromCode?: string;
      toCode?: string;
      fromCity?: string;
      toCity?: string;
      departureDate: string;
      departureTime: string;
      returnDate?: string;
      returnTime?: string;
      passengers: number;
      passengerDetails: any[];
      distance: number;
      message?: string;
      userId: string | null;
      guestSessionId: string | null;
      userType: 'REGISTERED' | 'GUEST';
      requestId: string;
      bookingId: string;
    },
  ): Promise<void> {
    // Calculate passenger summary for email
    const passengerSummary = this.calculatePassengerSummary(
      data.passengerDetails,
    );

    // Format passenger details for email as a string
    const passengerList = data.passengerDetails
      .map(
        (p, index) =>
          `  ${index + 1}. ${p.name} (${p.type})${p.requiresAssistance ? ' - Requires Assistance' : ''}`,
      )
      .join('\n');

    // Create passenger summary as a formatted string for email
    const passengerSummaryText = `
Adults: ${passengerSummary.adultCount}
Children: ${passengerSummary.childCount}
Infants: ${passengerSummary.infantCount}
Seniors: ${passengerSummary.seniorCount}
Require Assistance: ${passengerSummary.requiresAssistanceCount}
  `.trim();

    // Create admin response URL
    const adminResponseUrl = `${process.env.ADMIN_URL}/bookings/${data.bookingId}/respond`;

    await this.emailService.sendTemplatedEmail(
      adminEmail,
      'BOOKING',
      'LONG_DISTANCE_REQUEST_ADMIN',
      {
        adminName,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,

        // User type indicator - these should be strings or booleans, not objects
        userType: data.userType,
        isRegisteredUser: data.userType === 'REGISTERED' ? 'Yes' : 'No',
        isGuestUser: data.userType === 'GUEST' ? 'Yes' : 'No',

        // Request info
        requestId: data.requestId,
        bookingId: data.bookingId,

        // Trip details - all strings
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        fromCode: data.fromCode || data.fromLocation,
        toCode: data.toCode || data.toLocation,
        fromCity: data.fromCity || data.fromLocation,
        toCity: data.toCity || data.toLocation,

        // Distance highlight - number converted to string
        distance: data.distance.toString(),
        isLongDistance: 'Yes',

        // Dates and times - all strings
        departureDate: format(new Date(data.departureDate), 'PPP'),
        departureTime: data.departureTime,
        returnDate: data.returnDate
          ? format(new Date(data.returnDate), 'PPP')
          : 'One-way trip',
        returnTime: data.returnTime || 'N/A',

        // Passenger info - convert numbers to strings
        totalPassengers: data.passengers.toString(),
        passengerSummary: passengerSummaryText, // Send as formatted string instead of object
        passengerList,

        // Additional info
        message: data.message || 'No special requests',

        // Action URL
        adminResponseUrl,

        // Timestamp
        requestedAt: format(new Date(), 'PPP pp'),
      },
    );
  }

  private async sendLongDistanceCustomerEmail(
    customerEmail: string,
    customerName: string,
    data: {
      fromLocation: string;
      toLocation: string;
      fromCode?: string;
      toCode?: string;
      distance: number;
      userType: 'registered' | 'guest';
      requestId: string;
    },
  ): Promise<void> {
    // Different dashboard URL for registered vs guest users
    const dashboardUrl =
      data.userType === 'registered'
        ? `${process.env.FRONTEND_URL}/dashboard/bookings`
        : `${process.env.FRONTEND_URL}/booking-lookup`;

    await this.emailService.sendTemplatedEmail(
      customerEmail,
      'BOOKING',
      'LONG_DISTANCE_REQUEST_CUSTOMER',
      {
        customerName,
        requestId: data.requestId,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        fromCode: data.fromCode || data.fromLocation,
        toCode: data.toCode || data.toLocation,
        distance: data.distance,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@evotransport.rw',
        responseTime: '24 hours',
        dashboardUrl,
        userType: data.userType,
      },
    );
  }

  async getLongDistanceRequests(
    filter: BookingFilterDto,
  ): Promise<BookingListResponseDto> {
    this.logger.log('Fetching long distance requests');

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const skip = (page - 1) * limit;

    const where: any = {
      adminNotes: {
        contains: 'LONG DISTANCE REQUEST',
        mode: 'insensitive',
      },
      status: BookingStatus.PENDING,
    };

    // Add date filters if provided
    if (filter.fromDate || filter.toDate) {
      where.createdAt = {};
      if (filter.fromDate) where.createdAt.gte = filter.fromDate;
      if (filter.toDate) where.createdAt.lte = filter.toDate;
    }

    // Add search filter if provided
    if (filter.search) {
      where.OR = [
        { bookingReference: { contains: filter.search, mode: 'insensitive' } },
        { guestName: { contains: filter.search, mode: 'insensitive' } },
        { guestEmail: { contains: filter.search, mode: 'insensitive' } },
        { fromLocation: { contains: filter.search, mode: 'insensitive' } },
        { toLocation: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.booking.count({ where });

    // Get long distance requests
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

    this.logger.log(`Found ${total} long distance requests`);

    return {
      bookings: bookings.map((b) => this.mapBookingToResponse(b)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  private calculatePassengerSummary(passengers: any[]) {
    const raw = passengers.reduce(
      (acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        if (p.requiresAssistance) {
          acc.requiresAssistance += 1;
        }
        return acc;
      },
      { adult: 0, child: 0, infant: 0, senior: 0, requiresAssistance: 0 },
    );

    return {
      adultCount: raw.adult || 0,
      childCount: raw.child || 0,
      infantCount: raw.infant || 0,
      seniorCount: raw.senior || 0,
      requiresAssistanceCount: raw.requiresAssistance || 0,
    };
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
