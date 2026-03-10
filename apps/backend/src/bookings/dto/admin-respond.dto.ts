import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminRespondDto {
  @ApiProperty({
    example:
      'Your booking has been confirmed. Driver will arrive 10 minutes early.',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}
