import { IsEnum, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
    description: 'New booking status',
  })
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({
    example: 'Vehicle confirmed for your pickup time.',
    description:
      'Reason or message shown to the customer — required for all status changes',
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty({ message: 'A reason is required when changing booking status' })
  @MinLength(5, { message: 'Reason must be at least 5 characters' })
  reason: string;
}
