import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Prisma,
  BookingStatus,
  Currency,
  UserRole,
  AccountStatus,
  MessageSenderType,
} from '@prisma/client';
import { MailerService } from 'src/mailer/mailer.service';
import {
  getDefaultEmailMetadata,
  getMailerConfig,
} from 'src/mailer/mailer.config';
import { NotificationService } from '../notifications/notification.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { AdminRespondDto } from './dto/admin-respond.dto';
import { LongDistanceRequestDto } from './dto/long-distance-request.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { SendMessageDto, GuestReplyDto, GuestMessageDto } from './dto/booking-message.dto';
import { BookingListResponse } from 'src/types/booking.types';
import { randomBytes } from 'crypto';
import { format } from 'date-fns';
import { ResponseUtil } from 'src/utils/response.util';

const BOOKING_INCLUDE = {
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
};

const MESSAGE_INCLUDE = {
  sender: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
};

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: MailerService,
    private readonly notificationService: NotificationService,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private generateReference(prefix: 'EVO' | 'REQ'): string {
    const d = new Date();
    const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const rand = randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
    return `${prefix}-${date}-${rand}`;
  }

  private parsePassengerDetails(raw: any): any[] {
    if (!raw) return [];
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }

  private calculatePassengerSummary(passengers: any[]) {
    const acc = passengers.reduce(
      (a, p) => {
        a[p.type] = (a[p.type] || 0) + 1;
        if (p.requiresAssistance) a.requiresAssistance += 1;
        return a;
      },
      { adult: 0, child: 0, infant: 0, senior: 0, requiresAssistance: 0 },
    );
    return {
      adultCount: acc.adult,
      childCount: acc.child,
      infantCount: acc.infant,
      seniorCount: acc.senior,
      requiresAssistanceCount: acc.requiresAssistance,
    };
  }

  private customerName(booking: any): string {
    return (
      booking.guestName ||
      (booking.user
        ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim()
        : '') ||
      'Valued Customer'
    );
  }

  private customerEmail(booking: any): string | null {
    return booking.guestEmail || booking.user?.email || null;
  }

  private mapBookingToResponse(booking: any) {
    const passengerDetails = this.parsePassengerDetails(
      booking.passengerDetails,
    );
    return {
      id: booking.id,
      bookingReference: booking.bookingReference,
      userId: booking.userId,
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      userType: booking.userId ? 'REGISTERED' : 'GUEST',
      tripType: booking.tripType,
      fromLocation: booking.fromLocation,
      toLocation: booking.toLocation,
      fromCode: booking.fromCode,
      toCode: booking.toCode,
      fromCity: booking.fromCity,
      toCity: booking.toCity,
      distance: booking.distance,
      message: booking.requestMessage ?? null,
      departureDate: booking.departureDate,
      returnDate: booking.returnDate,
      departureTime: booking.departureTime,
      returnTime: booking.returnTime,
      passengers: booking.passengers,
      passengerDetails,
      passengerSummary: this.calculatePassengerSummary(passengerDetails),
      price: booking.price,
      currency: booking.currency,
      status: booking.status,
      statusReason: booking.statusReason,
      adminNotes: booking.adminNotes,
      adminRespondedAt: booking.adminRespondedAt,
      adminRespondedBy: booking.adminRespondedBy,
      createdAt: booking.createdAt,
      confirmedAt: booking.confirmedAt,
      cancelledAt: booking.cancelledAt,
      rejectedAt: booking.rejectedAt,
      user: booking.user || null,
    };
  }

  private async getActiveAdmins() {
    return this.prisma.user.findMany({
      where: { role: UserRole.ADMIN, status: AccountStatus.ACTIVE },
      select: { id: true, email: true, firstName: true },
    });
  }

  // Create Booking
  async createBooking(
    userId: string | null,
    guestSessionId: string | null,
    dto: CreateBookingDto,
  ) {
    this.logger.log(
      `Creating booking for ${userId ? 'user:' + userId : 'guest'}`,
    );

    if (!userId && !dto.guestEmail)
      throw new BadRequestException('Guest email is required');
    if (!dto.guestPhone?.trim())
      throw new BadRequestException('Phone number is required');
    if (!dto.passengerDetails?.length)
      throw new BadRequestException('Passenger details are required');

    const booking = await this.prisma.booking.create({
      data: {
        bookingReference: this.generateReference('EVO'),
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
        distance: dto.distance,
        departureDate: new Date(dto.departureDate),
        returnDate: dto.returnDate ? new Date(dto.returnDate) : null,
        departureTime: dto.departureTime,
        returnTime: dto.returnTime,
        passengers: dto.passengerDetails.length,
        passengerDetails:
          dto.passengerDetails as unknown as Prisma.InputJsonValue,
        price: Number(dto.price),
        currency: dto.currency || Currency.RWF,
        status: BookingStatus.PENDING,
      },
      include: BOOKING_INCLUDE,
    });

    // Fire-and-forget emails
    this.sendNewBookingEmails(booking).catch((e) =>
      this.logger.error(`Email error on createBooking: ${e.message}`),
    );

    return this.mapBookingToResponse(booking);
  }

  private async sendNewBookingEmails(booking: any) {
    const name = this.customerName(booking);
    const email = this.customerEmail(booking);
    const { adminUrl: adminBase, supportEmail, appName } = getMailerConfig();
    const adminUrl = `${adminBase}/bookings/${booking.id}`;
    const emailMeta = { metadata: getDefaultEmailMetadata() };

    // Customer confirmation
    if (email) {
      await this.emailService.sendTemplatedEmail(
        email,
        'BOOKING',
        'BOOKING_CONFIRMATION',
        {
          customerName: name,
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
          platformName: appName,
          supportEmail,
        },
        emailMeta,
      );

      await this.notificationService.create({
        bookingId: booking.id,
        userId: booking.userId,
        recipientEmail: email,
        recipientName: name,
        recipientType: booking.userId ? 'CUSTOMER' : 'GUEST',
        type: 'BOOKING_CREATED_CUSTOMER',
        subject: `Booking Received: ${booking.bookingReference}`,
        status: 'SENT',
      });
    }

    // Admin notifications
    const admins = await this.getActiveAdmins();
    for (const admin of admins) {
      await this.emailService.sendTemplatedEmail(
        admin.email,
        'BOOKING',
        'ADMIN_BOOKING_NOTIFICATION',
        {
          adminName: admin.firstName || 'Admin',
          bookingReference: booking.bookingReference,
          customerName: name,
          customerEmail: email || 'No email',
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
          platformName: appName,
        },
        emailMeta,
      );

      await this.notificationService.create({
        bookingId: booking.id,
        userId: admin.id,
        recipientEmail: admin.email,
        recipientName: admin.firstName || 'Admin',
        recipientType: 'ADMIN',
        type: 'BOOKING_CREATED_ADMIN',
        subject: `New Booking: ${booking.bookingReference}`,
        content: `${name} — ${booking.fromLocation} → ${booking.toLocation}`,
        status: 'SENT',
      });
    }
  }

  // ─── Long Distance Request ─────────────────────────────────────────────────

  async sendEmailOverDistance(
    userId: string | null,
    guestSessionId: string | null,
    dto: LongDistanceRequestDto,
    distance: number,
  ) {
    this.logger.log(`Long distance request: ${distance} km`);

    if (distance <= 400)
      throw new BadRequestException('Route is not long distance');

    let customerEmail = dto.guestEmail;
    let customerName = dto.guestName || 'Valued Customer';
    const customerPhone = dto.guestPhone || 'Not provided';

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true },
      });
      if (user) {
        customerEmail = user.email;
        customerName =
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          'Valued Customer';
      }
    }

    if (!customerEmail) throw new BadRequestException('Email is required');

    const requestId = this.generateReference('REQ');
    const passengerList = dto.passengerDetails
      .map(
        (p, i) =>
          `${i + 1}. ${p.name ?? p.type} (${p.type})${p.requiresAssistance ? ' — Needs assistance' : ''}`,
      )
      .join('\n');
    const summary = this.calculatePassengerSummary(dto.passengerDetails);
    const summaryText = `Adults: ${summary.adultCount}\nChildren: ${summary.childCount}\nInfants: ${summary.infantCount}\nSeniors: ${summary.seniorCount}\nNeeds Assistance: ${summary.requiresAssistanceCount}`;

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
        distance: String(distance),
        requestMessage: dto.message,
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
        adminNotes: `LONG_DISTANCE: ${distance} km — awaiting admin response`,
      },
    });

    const { adminUrl: adminBase, frontendUrl, supportEmail, appName } =
      getMailerConfig();
    const adminResponseUrl = `${adminBase}/bookings/${pendingBooking.id}/respond`;
    const admins = await this.getActiveAdmins();
    const emailMeta = { metadata: getDefaultEmailMetadata() };

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
          isGuestUser: userId ? 'No' : 'Yes',
          requestId,
          bookingId: pendingBooking.id,
          fromLocation: dto.fromLocation,
          toLocation: dto.toLocation,
          fromCode: dto.fromCode || dto.fromLocation,
          toCode: dto.toCode || dto.toLocation,
          fromCity: dto.fromCity || dto.fromLocation,
          toCity: dto.toCity || dto.toLocation,
          distance: String(distance),
          isLongDistance: 'Yes',
          departureDate: format(new Date(dto.departureDate), 'PPP'),
          departureTime: dto.departureTime,
          returnDate: dto.returnDate
            ? format(new Date(dto.returnDate), 'PPP')
            : 'One-way trip',
          returnTime: dto.returnTime || 'N/A',
          totalPassengers: String(dto.passengerDetails.length),
          passengerSummary: summaryText,
          passengerList,
          message: dto.message || 'No special requests',
          adminResponseUrl,
          requestedAt: format(new Date(), 'PPP pp'),
          platformName: appName,
        },
        emailMeta,
      );

      await this.notificationService.create({
        bookingId: pendingBooking.id,
        userId: admin.id,
        recipientEmail: admin.email,
        recipientName: admin.firstName || 'Admin',
        recipientType: 'ADMIN',
        type: 'LONG_DISTANCE_REQUEST',
        subject: `Long Distance Request: ${dto.fromLocation} → ${dto.toLocation} (${distance} km)`,
        content: `${customerName} requested a long distance trip — ${distance} km`,
        status: 'SENT',
      });
    }

    // Customer confirmation
    const dashboardUrl = userId
      ? `${frontendUrl}/dashboard/bookings`
      : `${frontendUrl}/booking/lookup`;

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
        supportEmail,
        responseTime: '24 hours',
        dashboardUrl,
        userType: userId ? 'registered' : 'guest',
        platformName: appName,
      },
      emailMeta,
    );

    return {
      message:
        'Your long distance request has been sent. We will contact you within 24 hours.',
      requestId,
      bookingId: pendingBooking.id,
      createdAt: pendingBooking.createdAt,
    };
  }

  // ─── Update Status ─────────────────────────────────────────────────────────

  async updateBookingStatus(
    id: string,
    adminId: string,
    dto: UpdateBookingStatusDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);

    const updateData: any = {
      status: dto.status,
      statusReason: dto.reason, // always saved, always shown to customer
      adminRespondedAt: new Date(),
      adminRespondedBy: adminId,
    };

    if (dto.status === BookingStatus.CONFIRMED)
      updateData.confirmedAt = new Date();
    if (dto.status === BookingStatus.CANCELLED)
      updateData.cancelledAt = new Date();
    if (dto.status === BookingStatus.REJECTED)
      updateData.rejectedAt = new Date();

    const updated = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: BOOKING_INCLUDE,
    });

    // Post a system message in the booking chat so the customer sees it inline
    await this.prisma.bookingMessage.create({
      data: {
        bookingId: id,
        senderType: MessageSenderType.ADMIN,
        senderId: adminId,
        senderName: 'ECO Transport Team',
        content: `**${dto.status}**.\n\n${dto.reason}`,
      },
    });

    // Email customer
    await this.sendStatusEmail(updated, dto.status, dto.reason);

    return this.mapBookingToResponse(updated);
  }

  private async sendStatusEmail(
    booking: any,
    status: BookingStatus,
    reason: string,
  ) {
    const email = this.customerEmail(booking);
    if (!email) return;

    const name = this.customerName(booking);
    const { frontendUrl, supportEmail, appName } = getMailerConfig();
    const emailMeta = { metadata: getDefaultEmailMetadata() };
    const dashboardUrl = booking.userId
      ? `${frontendUrl}/dashboard/bookings/${booking.id}`
      : `${frontendUrl}/booking/lookup?ref=${booking.bookingReference}`;

    const templateMap: Record<string, string> = {
      [BookingStatus.CONFIRMED]: 'BOOKING_CONFIRMED',
      [BookingStatus.REJECTED]: 'BOOKING_REJECTED',
      [BookingStatus.CANCELLED]: 'BOOKING_CANCELLED',
    };

    const templateKey = templateMap[status] || 'BOOKING_STATUS_UPDATED';

    const baseData = {
      customerName: name,
      bookingReference: booking.bookingReference,
      fromLocation: booking.fromLocation,
      toLocation: booking.toLocation,
      fromCode: booking.fromCode,
      toCode: booking.toCode,
      departureDate: format(booking.departureDate, 'PPP'),
      departureTime: booking.departureTime,
      returnDate: booking.returnDate ? format(booking.returnDate, 'PPP') : null,
      returnTime: booking.returnTime,
      reason,
      status,
      supportEmail,
      dashboardUrl,
      cancelledBy: 'ADMIN' as const,
      platformName: appName,
    };

    await this.emailService.sendTemplatedEmail(
      email,
      'BOOKING',
      templateKey as any,
      baseData,
      emailMeta,
    );

    await this.notificationService.create({
      bookingId: booking.id,
      userId: booking.userId,
      recipientEmail: email,
      recipientName: name,
      recipientType: booking.userId ? 'CUSTOMER' : 'GUEST',
      type: `BOOKING_${status}`,
      subject: `Booking ${status}: ${booking.bookingReference}`,
      status: 'SENT',
    });
  }

  // ─── Messaging (Booking Chat) ──────────────────────────────────────────────

  /** Admin sends a message to the customer */
  async sendAdminMessage(
    bookingId: string,
    adminId: string,
    dto: SendMessageDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { firstName: true, lastName: true },
    });

    const message = await this.prisma.bookingMessage.create({
      data: {
        bookingId,
        senderType: MessageSenderType.ADMIN,
        senderId: adminId,
        senderName: admin
          ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim() ||
            'ECO Transport Team'
          : 'ECO Transport Team',
        content: dto.content,
        // Generate a one-time guest reply token for non-registered users
        guestReplyToken: !booking.userId
          ? randomBytes(24).toString('hex')
          : null,
      },
      include: MESSAGE_INCLUDE,
    });

    // Notify customer via email
    const email = this.customerEmail(booking);
    const name = this.customerName(booking);

    if (email) {
      const { frontendUrl, appName } = getMailerConfig();
      const emailMeta = { metadata: getDefaultEmailMetadata() };
      const isGuest = !booking.userId;
      const replyUrl = isGuest
        ? `${frontendUrl}/booking/reply?token=${message.guestReplyToken}`
        : `${frontendUrl}/dashboard/bookings/${bookingId}`;

      await this.emailService.sendTemplatedEmail(
        email,
        'BOOKING',
        'NEW_BOOKING_MESSAGE',
        {
          recipientName: name,
          bookingReference: booking.bookingReference,
          fromLocation: booking.fromLocation,
          toLocation: booking.toLocation,
          senderLabel: message.senderName || 'EVO Transport Team',
          messageContent: dto.content,
          replyUrl,
          isGuest,
          platformName: appName,
        },
        emailMeta,
      );

      // In-app notification for registered users
      if (booking.userId) {
        await this.notificationService.create({
          bookingId,
          userId: booking.userId,
          recipientEmail: email,
          recipientName: name,
          recipientType: 'CUSTOMER',
          type: 'NEW_MESSAGE',
          subject: `New message about booking ${booking.bookingReference}`,
          content: dto.content.slice(0, 120),
          status: 'SENT',
        });
      }
    }

    return message;
  }

  /** Registered customer sends a message */
  async sendCustomerMessage(
    bookingId: string,
    userId: string,
    dto: SendMessageDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);
    if (booking.userId !== userId)
      throw new BadRequestException('This booking does not belong to you');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });

    const message = await this.prisma.bookingMessage.create({
      data: {
        bookingId,
        senderType: MessageSenderType.CUSTOMER,
        senderId: userId,
        senderName: user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
          : 'Customer',
        content: dto.content,
      },
      include: MESSAGE_INCLUDE,
    });

    // Notify all admins
    await this.notifyAdminsOfCustomerMessage(
      booking,
      user?.email || '',
      message.senderName!,
      dto.content,
    );
    return message;
  }

  /** Guest replies using the one-time token embedded in the email link */
  async sendGuestReply(dto: GuestReplyDto) {
    // Find the original message by the reply token
    const originalMessage = await this.prisma.bookingMessage.findUnique({
      where: { guestReplyToken: dto.replyToken },
      include: { booking: { include: BOOKING_INCLUDE } },
    });
    if (!originalMessage)
      throw new NotFoundException('Invalid or expired reply token');

    const booking = originalMessage.booking;

    const message = await this.prisma.bookingMessage.create({
      data: {
        bookingId: booking.id,
        senderType: MessageSenderType.GUEST,
        senderId: null,
        senderName: dto.senderName || booking.guestName || 'Guest',
        content: dto.content,
      },
      include: MESSAGE_INCLUDE,
    });

    // Invalidate the token so it can't be reused
    await this.prisma.bookingMessage.update({
      where: { id: originalMessage.id },
      data: { guestReplyToken: null },
    });

    // Notify admins
    const guestEmail = booking.guestEmail || 'guest@unknown';
    await this.notifyAdminsOfCustomerMessage(
      booking,
      guestEmail,
      message.senderName!,
      dto.content,
    );

    return message;
  }

  async sendGuestMessage(bookingId: string, dto: GuestMessageDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    if (booking.bookingReference !== dto.bookingReference) {
      throw new BadRequestException('Booking reference does not match');
    }

    const message = await this.prisma.bookingMessage.create({
      data: {
        bookingId,
        senderType: MessageSenderType.GUEST,
        senderId: null,
        senderName: dto.senderName || booking.guestName || 'Guest',
        content: dto.content,
        guestReplyToken: randomBytes(24).toString('hex'),
      },
      include: MESSAGE_INCLUDE,
    });

    await this.notifyAdminsOfCustomerMessage(
      booking,
      booking.guestEmail || '',
      message.senderName!,
      dto.content,
    );

    return message;
  }

  private async notifyAdminsOfCustomerMessage(
    booking: any,
    customerEmail: string,
    senderName: string,
    content: string,
  ) {
    const admins = await this.getActiveAdmins();
    const { adminUrl: adminBase, appName } = getMailerConfig();
    const emailMeta = { metadata: getDefaultEmailMetadata() };
    for (const admin of admins) {
      await this.emailService.sendTemplatedEmail(
        admin.email,
        'BOOKING',
        'ADMIN_NEW_CUSTOMER_MESSAGE',
        {
          adminName: admin.firstName || 'Admin',
          bookingReference: booking.bookingReference,
          customerName: senderName,
          customerEmail,
          fromLocation: booking.fromLocation,
          toLocation: booking.toLocation,
          senderType: booking.userId ? 'CUSTOMER' : 'GUEST',
          messageContent: content,
          adminUrl: `${adminBase}/bookings/${booking.id}`,
          platformName: appName,
        },
        emailMeta,
      );

      await this.notificationService.create({
        bookingId: booking.id,
        userId: admin.id,
        recipientEmail: admin.email,
        recipientName: admin.firstName || 'Admin',
        recipientType: 'ADMIN',
        type: 'CUSTOMER_MESSAGE',
        subject: `Reply from ${senderName} — ${booking.bookingReference}`,
        content: content.slice(0, 120),
        status: 'SENT',
      });
    }
  }

  /** Passenger: booking must belong to userId. Admin: any booking. */
  private async assertThreadAccess(
    bookingId: string,
    userId: string,
    role: UserRole,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, userId: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (role === UserRole.ADMIN) return;
    if (booking.userId !== userId) {
      throw new ForbiddenException('You cannot access this booking');
    }
  }

  /** Get all messages for a booking (admin or booking owner). */
  async getBookingMessages(
    bookingId: string,
    userId: string,
    role: UserRole,
  ) {
    await this.assertThreadAccess(bookingId, userId, role);
    return this.prisma.bookingMessage.findMany({
      where: { bookingId },
      include: MESSAGE_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Guest reads a booking thread using their bookingReference (public). */
  async getGuestBookingMessages(
    bookingId: string,
    bookingReference: string,
  ) {
    if (!bookingReference?.trim()) {
      throw new BadRequestException('bookingReference is required');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, bookingReference: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.bookingReference !== bookingReference) {
      throw new ForbiddenException('Booking reference does not match');
    }

    return this.prisma.bookingMessage.findMany({
      where: { bookingId },
      include: MESSAGE_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Mark messages as read (called when user/admin opens the thread). */
  async markMessagesRead(
    bookingId: string,
    readerType: 'ADMIN' | 'CUSTOMER' | 'GUEST',
    userId?: string,
    role?: UserRole,
  ) {
    if (readerType === 'CUSTOMER') {
      if (!userId || !role)
        throw new BadRequestException('Authentication required');
      await this.assertThreadAccess(bookingId, userId, role);
    } else if (readerType === 'ADMIN') {
      if (role !== UserRole.ADMIN) {
        throw new ForbiddenException('Admin only');
      }
    }

    await this.prisma.bookingMessage.updateMany({
      where: {
        bookingId,
        isRead: false,
        senderType:
          readerType === 'ADMIN'
            ? { not: MessageSenderType.ADMIN }
            : MessageSenderType.ADMIN,
      },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // ─── Admin Respond (legacy — sends a message + updates notes) ─────────────
  async adminRespond(id: string, adminId: string, dto: AdminRespondDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);

    // Save as both a chat message and a note on the booking
    await this.prisma.booking.update({
      where: { id },
      data: {
        adminNotes: dto.message,
        adminRespondedAt: new Date(),
        adminRespondedBy: adminId,
      },
    });

    await this.sendAdminMessage(id, adminId, { content: dto.message });

    return ResponseUtil.success({}, 'Response sent successfully');
  }

  // ─── Queries ───────────────────────────────────────────────────────────────
  async getBookings(filter: BookingFilterDto, isAdmin = false) {
    const {
      status,
      fromDate,
      toDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter as any;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
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
    if (!isAdmin && (filter as any).userId) {
      where.userId = (filter as any).userId;
    }

    const [total, bookings] = await this.prisma.$transaction([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: BOOKING_INCLUDE,
      }),
    ]);

    return {
      bookings: bookings.map((b) => this.mapBookingToResponse(b)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLongDistanceRequests(filter: BookingFilterDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      fromDate,
      toDate,
    } = filter;
    const skip = (page - 1) * limit;

    const where: any = {
      adminNotes: { contains: 'LONG_DISTANCE', mode: 'insensitive' },
    };
    if (search) {
      where.OR = [
        { bookingReference: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    const [total, bookings] = await this.prisma.$transaction([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: BOOKING_INCLUDE,
      }),
    ]);

    return {
      bookings: bookings.map((b) => this.mapBookingToResponse(b)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return this.mapBookingToResponse(booking);
  }

  async getBookingForPassenger(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new ForbiddenException('This booking does not belong to you');
    }
    return this.mapBookingToResponse(booking);
  }

  async requestRebook(
    userId: string,
    bookingId: string,
    dto?: { note?: string },
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new BadRequestException('This booking does not belong to you');
    }

    const passenger = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!passenger) throw new NotFoundException('User not found');

    const admins = await this.getActiveAdmins();
    const note = dto?.note?.trim() || '';
    const customerLabel =
      `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim() ||
      passenger.email;

    for (const admin of admins) {
      await this.notificationService.create({
        bookingId: booking.id,
        userId: admin.id,
        recipientEmail: admin.email,
        recipientName: admin.firstName || 'Admin',
        recipientType: 'ADMIN',
        type: 'REBOOK_REQUEST',
        subject: `Re-book request — ${booking.bookingReference}`,
        content: `${customerLabel} requested to book this route again.${note ? ` Note: ${note}` : ''}`,
        status: 'SENT',
      });
    }

    await this.notificationService.create({
      bookingId: booking.id,
      userId: passenger.id,
      recipientEmail: passenger.email,
      recipientName: customerLabel,
      recipientType: 'CUSTOMER',
      type: 'REBOOK_REQUEST_CONFIRMED',
      subject: 'Re-book request received',
      content:
        'Our team has been notified. You can also use Re-book on your dashboard to start a new booking with the same route.',
      status: 'SENT',
    });

    return ResponseUtil.success(
      { bookingId: booking.id, bookingReference: booking.bookingReference },
      'Re-book request sent',
    );
  }

  async getBookingByReference(reference: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingReference: reference },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException(`Booking ${reference} not found`);
    return this.mapBookingToResponse(booking);
  }

  async getMyBookings(userId: string, filter: any) {
    return ResponseUtil.success(
      await this.getBookings({ ...filter, userId }, false),
      'Bookings fetched successfully',
    );
  }

  async cancelBooking(userId: string, bookingId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId)
      throw new BadRequestException('Not your booking');
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        'Only pending bookings can be cancelled online. For confirmed trips, message our team in your booking chat.',
      );
    }

    const cancelReason = reason || 'Cancelled by customer';

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        statusReason: cancelReason,
        cancelledAt: new Date(),
      },
      include: BOOKING_INCLUDE,
    });

    await this.sendStatusEmail(updated, BookingStatus.CANCELLED, cancelReason);
    return ResponseUtil.success(
      this.mapBookingToResponse(updated),
      'Booking cancelled successfully',
    );
  }
}
