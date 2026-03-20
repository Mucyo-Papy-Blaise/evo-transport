import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { AdminRespondDto } from './dto/admin-respond.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import {
  LongDistanceRequestDto,
  LongDistanceResponseDto,
} from './dto/long-distance-request.dto';
import {
  SendMessageDto,
  GuestReplyDto,
  BookingMessageResponseDto,
  GuestMessageDto,
} from './dto/booking-message.dto';
import {
  BookingResponseDto,
  BookingListResponseDto,
  MessageResponseDto,
} from './dto/booking-response.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // ─── Create ────────────────────────────────────────────────────────────────

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Create a new booking (guests and registered users)',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: BookingResponseDto })
  async createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    const userId = req.user?.id || null;
    const guestSessionId = req.headers['x-guest-session-id'] || null;
    return this.bookingService.createBooking(userId, guestSessionId, dto);
  }

  // ─── Long distance ─────────────────────────────────────────────────────────

  @Post('long-distance')
  @Public()
  @ApiOperation({ summary: 'Submit a long distance request (>400 km)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: LongDistanceResponseDto })
  async sendLongDistanceRequest(
    @Request() req,
    @Body() dto: LongDistanceRequestDto,
  ) {
    const userId = req.user?.id || null;
    const guestSessionId = req.headers['x-guest-session-id'] || null;
    return this.bookingService.sendEmailOverDistance(
      userId,
      guestSessionId,
      dto,
      dto.distance,
    );
  }

  @Get('long-distance')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all long distance requests (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingListResponseDto })
  getLongDistanceRequests(@Query() filter: BookingFilterDto) {
    return this.bookingService.getLongDistanceRequests(filter);
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all bookings (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingListResponseDto })
  getAllBookings(@Query() filter: BookingFilterDto) {
    return this.bookingService.getBookings(filter, true);
  }

  @Get('my-bookings')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingListResponseDto })
  getMyBookings(
    @CurrentUser('id') userId: string,
    @Query() filter: BookingFilterDto,
  ) {
    return this.bookingService.getMyBookings(userId, filter);
  }

  @Get('reference/:reference')
  @Public()
  @ApiOperation({
    summary: 'Get booking by reference (public — for lookup page)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: BookingResponseDto })
  getByReference(@Param('reference') reference: string) {
    return this.bookingService.getBookingByReference(reference);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get booking by ID (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingResponseDto })
  getById(@Param('id') id: string) {
    return this.bookingService.getBookingById(id);
  }

  // ─── Status update ─────────────────────────────────────────────────────────

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Update booking status — reason is required and will be shown to the customer',
  })
  @ApiResponse({ status: HttpStatus.OK, type: BookingResponseDto })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingService.updateBookingStatus(id, adminId, dto);
  }

  // ─── Cancel (by customer) ──────────────────────────────────────────────────

  @Patch(':id/cancel')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel a booking (customer only)' })
  @HttpCode(HttpStatus.OK)
  cancelBooking(
    @CurrentUser('id') userId: string,
    @Param('id') bookingId: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingService.cancelBooking(userId, bookingId, reason);
  }

  // ─── Messaging (booking chat) ──────────────────────────────────────────────

  @Get(':id/messages')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all messages for a booking (admin or owner)' })
  @ApiResponse({ status: HttpStatus.OK, type: [BookingMessageResponseDto] })
  getMessages(@Param('id') bookingId: string) {
    return this.bookingService.getBookingMessages(bookingId);
  }

  @Post(':id/messages')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin sends a message to the customer' })
  @ApiResponse({ status: HttpStatus.CREATED, type: BookingMessageResponseDto })
  adminSendMessage(
    @Param('id') bookingId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.bookingService.sendAdminMessage(bookingId, adminId, dto);
  }

  @Post(':id/messages/customer')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Registered customer sends a message about their booking',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: BookingMessageResponseDto })
  customerSendMessage(
    @Param('id') bookingId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: GuestMessageDto,
  ) {
    return this.bookingService.sendCustomerMessage(bookingId, userId, dto);
  }

  @Post('messages/guest-reply')
  @Public()
  @ApiOperation({
    summary: 'Guest replies using a one-time token from their email',
    description:
      "Token is embedded in the reply link sent to guest's email. Single-use.",
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: BookingMessageResponseDto })
  guestReply(@Body() dto: GuestReplyDto) {
    return this.bookingService.sendGuestReply(dto);
  }

  @Patch(':id/messages/read')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all unread messages as read' })
  markRead(
    @Param('id') bookingId: string,
    @Query('as') readerType: 'ADMIN' | 'CUSTOMER' | 'GUEST' = 'CUSTOMER',
  ) {
    return this.bookingService.markMessagesRead(bookingId, readerType);
  }

  //  Legacy admin respond (kept for compatibility)
  @Post(':id/respond')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Admin sends a direct response message (legacy — use /messages instead)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: MessageResponseDto })
  adminRespond(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: AdminRespondDto,
  ) {
    return this.bookingService.adminRespond(id, adminId, dto);
  }

  @Post(':id/messages/guest')
  @Public()
  @ApiOperation({
    summary: 'Guest sends a message — verified by bookingReference',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: BookingMessageResponseDto })
  guestSendMessage(
    @Param('id') bookingId: string,
    @Body() dto: GuestMessageDto,
  ) {
    return this.bookingService.sendGuestMessage(bookingId, dto);
  }
}
