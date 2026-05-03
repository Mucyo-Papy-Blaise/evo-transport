import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { TemplateService } from './templates/template.service';

// Transactional email via SMTP (see `mailer.config.ts` + `MailerService`)
@Module({
  imports: [ConfigModule],
  providers: [MailerService, TemplateService],
  exports: [MailerService, TemplateService],
})
export class MailerModule {}
