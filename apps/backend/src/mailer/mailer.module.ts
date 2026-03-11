import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';
import { TemplateService } from './templates/template.service';

// Provides email sending functionality with templating support
// Transport: Resend SMTP relay (smtp.resend.com:465, SSL)
@Module({
  imports: [
    ConfigModule,
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.resend.com',
          port: 465,
          secure: true, // SSL on port 465
          auth: {
            user: 'resend', // Resend SMTP username is always "resend"
            pass: configService.get<string>('RESEND_API_KEY'),
          },
          pool: true,
          maxConnections: configService.get<number>('MAIL_MAX_CONNECTIONS', 5),
          maxMessages: configService.get<number>('MAIL_MAX_MESSAGES', 100),
          rateDelta: configService.get<number>('MAIL_RATE_DELTA', 1000),
          rateLimit: configService.get<number>('MAIL_RATE_LIMIT', 5),
        },
        defaults: {
          from: {
            name: configService.get<string>('MAIL_FROM_NAME', 'EVO TRANSPORT'),
            // Must be an email from a domain you've verified in Resend
            address: configService.get<string>('MAIL_FROM_ADDRESS'),
          },
        },
        preview: configService.get<boolean>('MAIL_PREVIEW', false),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailerService, TemplateService],
  exports: [MailerService, TemplateService],
})
export class MailerModule {}
