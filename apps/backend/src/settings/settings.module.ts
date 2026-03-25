import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { PricingSettingsService } from './pricing-settings.service';
import { SettingsPublicController } from './settings-public.controller';
import { AdminSettingsController } from './admin-settings.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SettingsPublicController, AdminSettingsController],
  providers: [PricingSettingsService],
  exports: [PricingSettingsService],
})
export class SettingsModule {}
