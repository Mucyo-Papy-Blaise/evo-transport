import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, TripType, Currency } from '@prisma/client';

class BookingUserDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() firstName: string | null;
  @ApiProperty() lastName: string | null;
}

export class BookingResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() bookingReference: string;

  @ApiProperty() userId: string | null;
  @ApiProperty() guestEmail: string | null;
  @ApiProperty() guestName: string | null;
  @ApiProperty() guestPhone: string | null;
  @ApiProperty() userType: 'REGISTERED' | 'GUEST';

  @ApiProperty({ enum: TripType }) tripType: TripType;
  @ApiProperty() fromLocation: string;
  @ApiProperty() toLocation: string;
  @ApiProperty() fromCode: string | null;
  @ApiProperty() toCode: string | null;
  @ApiProperty() fromCity: string | null;
  @ApiProperty() toCity: string | null;
  @ApiProperty() departureDate: Date;
  @ApiProperty() returnDate: Date | null;
  @ApiProperty() departureTime: string;
  @ApiProperty() returnTime: string | null;
  @ApiProperty() passengers: number;

  @ApiProperty() price: number;
  @ApiProperty({ enum: Currency }) currency: Currency;

  @ApiProperty({ enum: BookingStatus }) status: BookingStatus;
  @ApiProperty() adminNotes: string | null;
  @ApiProperty() adminRespondedAt: Date | null;
  @ApiProperty() adminRespondedBy: string | null;

  @ApiProperty() createdAt: Date;
  @ApiProperty() confirmedAt: Date | null;
  @ApiProperty() cancelledAt: Date | null;

  @ApiPropertyOptional() user?: BookingUserDto | null;
}

export class BookingListResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  bookings: BookingResponseDto[];

  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export class MessageResponseDto {
  @ApiProperty() message: string;
}
