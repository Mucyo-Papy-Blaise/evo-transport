import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
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
import {
  LongDistanceRequestDto,
  LongDistanceResponseDto,
} from './dto/long-distance-request.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Create a new booking (for both registered and guest users)',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: BookingResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async createBooking(
    @Request() req,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const userId = req.user?.id || null;
    const guestSessionId = req.headers['x-guest-session-id'] || null;

    return this.bookingService.createBooking(userId, guestSessionId, dto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all bookings (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingListResponseDto })
  async getAllBookings(@Query() filter: BookingFilterDto) {
    return this.bookingService.getBookings(filter, true);
  }

  @Get('my-bookings')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingListResponseDto })
  async getMyBookings(
    @CurrentUser('id') userId: string,
    @Query() filter: BookingFilterDto,
  ) {
    const userFilter = {
      ...filter,
      userId,
    };
    return this.bookingService.getBookings(userFilter);
  }

  @Get('reference/:reference')
  @Public()
  @ApiOperation({ summary: 'Get booking by reference number' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  async getBookingByReference(
    @Param('reference') reference: string,
  ): Promise<BookingResponseDto> {
    return this.bookingService.getBookingByReference(reference);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get booking by ID (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  async getBookingById(@Param('id') id: string): Promise<BookingResponseDto> {
    return this.bookingService.getBookingById(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update booking status (confirm/reject/cancel) - Admin only',
  })
  @ApiResponse({ status: HttpStatus.OK, type: BookingResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  async updateBookingStatus(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<BookingResponseDto> {
    return this.bookingService.updateBookingStatus(id, adminId, dto);
  }

  @Post(':id/respond')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin respond to booking (send message to customer)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: MessageResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  async adminRespond(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: AdminRespondDto,
  ): Promise<MessageResponseDto> {
    return this.bookingService.adminRespond(id, adminId, dto);
  }

  @Post('long-distance')
  @Public()
  @ApiOperation({
    summary:
      'Submit a long distance request (>400km) - works for both guests and registered users',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: LongDistanceResponseDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or distance <= 400km',
  })
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
}
