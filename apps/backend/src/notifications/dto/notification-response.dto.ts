import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() bookingId: string | null;
  @ApiPropertyOptional() bookingReference?: string;
  @ApiProperty() type: string;
  @ApiProperty() subject: string;
  @ApiProperty() content: string | null;
  @ApiProperty() readAt: Date | null;
  @ApiProperty() sentAt: Date;
  @ApiProperty() recipientEmail: string;
  @ApiProperty() recipientName: string | null;
  @ApiProperty() recipientType: string;
  @ApiPropertyOptional() fromLocation?: string;
  @ApiPropertyOptional() toLocation?: string;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  notifications: NotificationResponseDto[];
  
  @ApiProperty() unreadCount: number;
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export class UnreadCountResponseDto {
  @ApiProperty() count: number;
}