import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageSenderType } from '@prisma/client';

//  Requests 
export class SendMessageDto {
  @ApiProperty({ example: 'Your driver will pick you up at 08:45.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}

export class GuestReplyDto {
  @ApiProperty({ description: 'One-time token from the reply email link' })
  @IsString()
  @IsNotEmpty()
  replyToken: string;

  @ApiProperty({ example: 'Thank you, I will be ready.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  senderName?: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export class BookingMessageResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() bookingId: string;
  @ApiProperty({ enum: MessageSenderType }) senderType: MessageSenderType;
  @ApiPropertyOptional() senderId: string | null;
  @ApiPropertyOptional() senderName: string | null;
  @ApiProperty() content: string;
  @ApiProperty() isRead: boolean;
  @ApiPropertyOptional() readAt: Date | null;
  @ApiProperty() createdAt: Date;
}

export class GuestMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookingReference: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  senderName?: string;
}