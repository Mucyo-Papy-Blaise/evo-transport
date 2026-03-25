import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RebookRequestDto {
  @ApiPropertyOptional({
    description: 'Optional message to the team about the re-booking request',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
