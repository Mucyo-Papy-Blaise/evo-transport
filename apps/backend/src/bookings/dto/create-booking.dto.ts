import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripType, Currency } from '@prisma/client';

export class CreateBookingDto {
  @ApiPropertyOptional({ example: 'guest@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  guestEmail?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiPropertyOptional({ example: '+250788123456' })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @ApiProperty({ enum: TripType, example: TripType.ONE_WAY })
  @IsEnum(TripType)
  tripType: TripType;

  @ApiProperty({ example: 'Kigali International Airport' })
  @IsString()
  fromLocation: string;

  @ApiProperty({ example: 'Musanze' })
  @IsString()
  toLocation: string;

  @ApiPropertyOptional({ example: 'KGL' })
  @IsOptional()
  @IsString()
  fromCode?: string;

  @ApiPropertyOptional({ example: 'MZN' })
  @IsOptional()
  @IsString()
  toCode?: string;

  @ApiPropertyOptional({ example: 'Kigali' })
  @IsOptional()
  @IsString()
  fromCity?: string;

  @ApiPropertyOptional({ example: 'Musanze' })
  @IsOptional()
  @IsString()
  toCity?: string;

  @ApiProperty({ example: '2025-03-15' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'departureDate must be in YYYY-MM-DD format',
  })
  departureDate: string;

  @ApiPropertyOptional({ example: '2025-03-20' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'returnDate must be in YYYY-MM-DD format',
  })
  returnDate?: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid time format. Use HH:MM',
  })
  departureTime: string;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid time format. Use HH:MM',
  })
  returnTime?: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 20 })
  @IsNumber()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  passengers: number;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ enum: Currency, default: Currency.RWF })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}
