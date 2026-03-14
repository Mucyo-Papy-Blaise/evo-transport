import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { TemplateService } from './templates/template.service';

// Email via Resend HTTP API (free tier, no SMTP delay)
@Module({
  imports: [ConfigModule],
  providers: [MailerService, TemplateService],
  exports: [MailerService, TemplateService],
})
export class MailerModule {}
