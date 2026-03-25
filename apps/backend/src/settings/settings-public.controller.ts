import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { PricingSettingsService } from './pricing-settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsPublicController {
  constructor(private readonly pricing: PricingSettingsService) {}

  @Public()
  @Get('pricing')
  @ApiOperation({
    summary: 'Public seasonal price-per-km (Europe meteorological seasons)',
  })
  @ApiQuery({
    name: 'departureDate',
    required: false,
    description: 'YYYY-MM-DD — season (and effective rate) follow this date',
  })
  getPricing(@Query('departureDate') departureDate?: string) {
    if (
      departureDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)
    ) {
      throw new BadRequestException(
        'departureDate must be in YYYY-MM-DD format',
      );
    }
    return this.pricing.getPublicPricing(departureDate);
  }
}
