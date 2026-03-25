import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdatePricingDto {
  @ApiPropertyOptional({ example: 1.15, description: 'EUR per km, spring (Mar–May)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(9999)
  springPricePerKm?: number;

  @ApiPropertyOptional({ example: 1.35, description: 'EUR per km, summer (Jun–Aug)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(9999)
  summerPricePerKm?: number;

  @ApiPropertyOptional({ example: 1.15, description: 'EUR per km, autumn (Sep–Nov)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(9999)
  autumnPricePerKm?: number;

  @ApiPropertyOptional({ example: 1.05, description: 'EUR per km, winter (Dec–Feb)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(9999)
  winterPricePerKm?: number;
}
