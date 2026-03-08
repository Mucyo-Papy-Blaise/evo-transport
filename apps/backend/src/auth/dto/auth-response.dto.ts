import { ApiProperty } from '@nestjs/swagger';
import { UserRole, Language, Currency } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() firstName: string | null;
  @ApiProperty() lastName: string | null;
  @ApiProperty({ enum: UserRole }) role: UserRole;
  @ApiProperty() isEmailVerified: boolean;
  @ApiProperty({ enum: Language }) preferredLanguage: Language;
  @ApiProperty({ enum: Currency }) preferredCurrency: Currency;
  @ApiProperty() createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty() user: UserResponseDto;
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
}

export class MessageResponseDto {
  @ApiProperty() message: string;
}
