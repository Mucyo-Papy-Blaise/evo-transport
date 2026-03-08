import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';
import { TemplateService } from './templates/template.service';

// Provides email sending functionality with templating support
@Module({
  imports: [
    ConfigModule,
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: configService.get<boolean>('MAIL_SECURE', false),
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
          // Additional transport options
          pool: true,
          maxConnections: configService.get<number>('MAIL_MAX_CONNECTIONS', 5),
          maxMessages: configService.get<number>('MAIL_MAX_MESSAGES', 100),
          rateDelta: configService.get<number>('MAIL_RATE_DELTA', 1000),
          rateLimit: configService.get<number>('MAIL_RATE_LIMIT', 5),
        },
        defaults: {
          from: {
            name: configService.get<string>('MAIL_FROM_NAME', 'EIG CAPITALSUITE'),
            address: configService.get<string>(
              'MAIL_FROM_ADDRESS',
              'noreply@elearning.com',
            ),
          },
        },
        // Preview emails in development (optional)
        preview: configService.get<boolean>('MAIL_PREVIEW', false),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailerService, TemplateService],
  exports: [MailerService, TemplateService],
})
export class MailerModule {}
