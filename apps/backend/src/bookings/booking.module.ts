import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { NotificationModule } from 'src/notifications/notification.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, MailerModule, NotificationModule, AuthModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
