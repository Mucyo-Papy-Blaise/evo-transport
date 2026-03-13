import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  Matches,
  ValidateNested,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripType, Currency } from '@prisma/client';
import { PassengerType, AssistanceType } from 'src/types/passenger.types';

export class PassengerDetailDto {
  @ApiProperty({ enum: PassengerType, example: PassengerType.ADULT })
  @IsEnum(PassengerType)
  type: PassengerType;

  @ApiProperty({ example: 35, minimum: 0, maximum: 120 })
  @IsNumber()
  @Min(0)
  @Max(120)
  age: number;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  requiresAssistance: boolean;

  @ApiPropertyOptional({ enum: AssistanceType })
  @IsOptional()
  @IsEnum(AssistanceType)
  assistanceType?: AssistanceType;

  @ApiPropertyOptional({ example: 'Needs aisle seat' })
  @IsOptional()
  @IsString()
  specialNeeds?: string;

  @ApiPropertyOptional({ example: 'window' })
  @IsOptional()
  @IsString()
  seatPreference?: string;

  @ApiPropertyOptional({ example: 'vegetarian' })
  @IsOptional()
  @IsString()
  mealPreference?: string;
}

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

  @ApiProperty({
    type: [PassengerDetailDto],
    description: 'Detailed passenger information',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDetailDto)
  passengerDetails: PassengerDetailDto[];

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
