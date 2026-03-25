import { Injectable } from '@nestjs/common';
import { Currency, PricingSettings } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  MeteorologicalSeason,
  meteorologicalSeasonFromDate,
  parseDepartureDateUtc,
} from './pricing-season.util';
import { UpdatePricingDto } from './dto/update-pricing.dto';

const SINGLETON_ID = 'default';

export interface PublicPricingDto {
  springPricePerKm: number;
  summerPricePerKm: number;
  autumnPricePerKm: number;
  winterPricePerKm: number;
  currency: Currency;
  /** Season for the requested departure date, or "today" if no query param */
  season: MeteorologicalSeason;
  effectivePricePerKm: number;
}

@Injectable()
export class PricingSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private toNumbers(row: PricingSettings): Omit<
    PublicPricingDto,
    'season' | 'effectivePricePerKm'
  > {
    return {
      springPricePerKm: Number(row.springPricePerKm),
      summerPricePerKm: Number(row.summerPricePerKm),
      autumnPricePerKm: Number(row.autumnPricePerKm),
      winterPricePerKm: Number(row.winterPricePerKm),
      currency: row.currency,
    };
  }

  private rateForSeason(
    row: PricingSettings,
    season: MeteorologicalSeason,
  ): number {
    switch (season) {
      case 'SPRING':
        return Number(row.springPricePerKm);
      case 'SUMMER':
        return Number(row.summerPricePerKm);
      case 'AUTUMN':
        return Number(row.autumnPricePerKm);
      default:
        return Number(row.winterPricePerKm);
    }
  }

  async ensureDefaults(): Promise<PricingSettings> {
    const existing = await this.prisma.pricingSettings.findUnique({
      where: { id: SINGLETON_ID },
    });
    if (existing) return existing;

    return this.prisma.pricingSettings.create({
      data: { id: SINGLETON_ID },
    });
  }

  async getPublicPricing(departureDateIso?: string): Promise<PublicPricingDto> {
    const row = await this.ensureDefaults();
    const base = this.toNumbers(row);
    const ref = departureDateIso
      ? parseDepartureDateUtc(departureDateIso)
      : new Date();
    const season = meteorologicalSeasonFromDate(ref);
    const effectivePricePerKm = this.rateForSeason(row, season);
    return { ...base, season, effectivePricePerKm };
  }

  async updatePricing(dto: UpdatePricingDto): Promise<PublicPricingDto> {
    await this.ensureDefaults();
    const data: Record<string, number> = {};
    if (dto.springPricePerKm !== undefined)
      data.springPricePerKm = dto.springPricePerKm;
    if (dto.summerPricePerKm !== undefined)
      data.summerPricePerKm = dto.summerPricePerKm;
    if (dto.autumnPricePerKm !== undefined)
      data.autumnPricePerKm = dto.autumnPricePerKm;
    if (dto.winterPricePerKm !== undefined)
      data.winterPricePerKm = dto.winterPricePerKm;

    if (Object.keys(data).length > 0) {
      await this.prisma.pricingSettings.update({
        where: { id: SINGLETON_ID },
        data,
      });
    }
    return this.getPublicPricing();
  }
}
