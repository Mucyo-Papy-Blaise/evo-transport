// src/booking/dto/long-distance-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEmail,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TripType, Currency } from '@prisma/client';
import { PassengerDetailDto } from './create-booking.dto';

export class LongDistanceRequestDto {
  @ApiProperty({ required: false, example: 'guest@example.com' })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiProperty({ required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiProperty({ required: false, example: '+250788123456' })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @ApiProperty({ enum: TripType, example: TripType.ONE_WAY })
  @IsEnum(TripType)
  @IsNotEmpty()
  tripType: TripType;

  @ApiProperty({ example: 'Kigali International Airport' })
  @IsString()
  @IsNotEmpty()
  fromLocation: string;

  @ApiProperty({ example: 'Musanze' })
  @IsString()
  @IsNotEmpty()
  toLocation: string;

  @ApiProperty({ required: false, example: 'KGL' })
  @IsOptional()
  @IsString()
  fromCode?: string;

  @ApiProperty({ required: false, example: 'MZN' })
  @IsOptional()
  @IsString()
  toCode?: string;

  @ApiProperty({ required: false, example: 'Kigali' })
  @IsOptional()
  @IsString()
  fromCity?: string;

  @ApiProperty({ required: false, example: 'Musanze' })
  @IsOptional()
  @IsString()
  toCity?: string;

  @ApiProperty({ example: '2024-12-25' })
  @IsString()
  @IsNotEmpty()
  departureDate: string;

  @ApiProperty({ required: false, example: '2024-12-30' })
  @IsOptional()
  @IsString()
  returnDate?: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  departureTime: string;

  @ApiProperty({ required: false, example: '18:00' })
  @IsOptional()
  @IsString()
  returnTime?: string;

  @ApiProperty({ example: 450, minimum: 401, maximum: 5000 })
  @IsNumber()
  @Min(401)
  @Max(5000)
  distance: number;

  @ApiProperty({
    type: [PassengerDetailDto],
    description: 'Detailed passenger information',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDetailDto)
  passengerDetails: PassengerDetailDto[];

  @ApiProperty({
    required: false,
    example: 'I need a large vehicle for luggage',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ enum: Currency, default: Currency.RWF, example: Currency.RWF })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}

// Response DTO for long distance requests
export class LongDistanceResponseDto {
  @ApiProperty({
    example:
      'Your long distance request has been sent to our admin team. You will receive a response within 24 hours.',
  })
  message: string;

  @ApiProperty({ example: 'REQ-20240314-ABC12' })
  requestId: string;

  @ApiProperty({ example: 'booking_id_123' })
  bookingId: string;

  @ApiProperty({ example: '2024-03-14T10:30:00Z' })
  createdAt: Date;
}
