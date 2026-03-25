import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PricingSettingsService } from './pricing-settings.service';
import { UpdatePricingDto } from './dto/update-pricing.dto';

@ApiTags('admin/settings')
@Controller('admin/settings')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminSettingsController {
  constructor(private readonly pricing: PricingSettingsService) {}

  @Patch('pricing')
  @ApiOperation({ summary: 'Update seasonal EUR per-km rates (admin)' })
  updatePricing(@Body() dto: UpdatePricingDto) {
    return this.pricing.updatePricing(dto);
  }
}
