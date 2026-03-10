import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface CreateNotificationDto {
  bookingId?: string;
  userId?: string | null;
  recipientEmail: string;
  recipientName?: string;
  recipientType: 'ADMIN' | 'CUSTOMER' | 'GUEST';
  type: string;
  subject: string;
  content?: string;
  status: 'SENT' | 'FAILED' | 'DELIVERED';
  errorMessage?: string;
}

export interface NotificationFilter {
  skip?: number;
  take?: number;
  unreadOnly?: boolean;
  type?: string;
}

export interface NotificationResult {
  notifications: any[];
  unreadCount: number;
  total: number;
}

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto): Promise<void> {
    await this.prisma.notification.create({
      data: {
        bookingId: dto.bookingId,
        userId: dto.userId,
        recipientEmail: dto.recipientEmail,
        recipientName: dto.recipientName,
        recipientType: dto.recipientType,
        type: dto.type,
        subject: dto.subject,
        content: dto.content,
        status: dto.status,
        errorMessage: dto.errorMessage,
        sentAt: new Date(),
      },
    });
  }

  async markAsRead(
    notificationId: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    // Build where clause to ensure user has permission
    const where: any = {
      id: notificationId,
    };

    if (!isAdmin) {
      where.userId = userId;
      where.recipientType = { in: ['CUSTOMER', 'GUEST'] };
    } else {
      where.recipientType = 'ADMIN';
    }

    const notification = await this.prisma.notification.findFirst({ where });

    if (!notification) {
      throw new NotFoundException('Notification not found or access denied');
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(
    userId: string,
    recipientType: 'ADMIN' | 'CUSTOMER',
    options?: { type?: string },
  ): Promise<void> {
    const where: any = {
      readAt: null,
    };

    if (recipientType === 'ADMIN') {
      where.recipientType = 'ADMIN';
    } else {
      where.userId = userId;
      where.recipientType = { in: ['CUSTOMER', 'GUEST'] };
    }

    // Add type filter if provided
    if (options?.type) {
      where.type = options.type;
    }

    await this.prisma.notification.updateMany({
      where,
      data: { readAt: new Date() },
    });
  }

  async getAdminNotifications(
    adminId: string,
    filter: NotificationFilter,
  ): Promise<NotificationResult> {
    const { skip = 0, take = 20, unreadOnly, type } = filter;

    const where: any = {
      recipientType: 'ADMIN',
    };

    if (unreadOnly) {
      where.readAt = null;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take,
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              fromLocation: true,
              toLocation: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          ...where,
          readAt: null,
        },
      }),
    ]);

    return {
      notifications: this.mapNotifications(notifications),
      unreadCount,
      total,
    };
  }

  async getUserNotifications(
    userId: string,
    filter: NotificationFilter,
  ): Promise<NotificationResult> {
    const { skip = 0, take = 20, unreadOnly, type } = filter;

    const where: any = {
      userId,
      recipientType: { in: ['CUSTOMER', 'GUEST'] },
    };

    if (unreadOnly) {
      where.readAt = null;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take,
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              fromLocation: true,
              toLocation: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          ...where,
          readAt: null,
        },
      }),
    ]);

    return {
      notifications: this.mapNotifications(notifications),
      unreadCount,
      total,
    };
  }

  async getUnreadCount(
    userId: string,
    recipientType: 'ADMIN' | 'CUSTOMER',
  ): Promise<number> {
    const where: any = {
      readAt: null,
    };

    if (recipientType === 'ADMIN') {
      where.recipientType = 'ADMIN';
    } else {
      where.userId = userId;
      where.recipientType = { in: ['CUSTOMER', 'GUEST'] };
    }

    return this.prisma.notification.count({ where });
  }

  async getNotificationById(
    id: string,
    userId: string,
    recipientType: 'ADMIN' | 'CUSTOMER',
  ): Promise<any> {
    const where: any = { id };

    if (recipientType === 'ADMIN') {
      where.recipientType = 'ADMIN';
    } else {
      where.userId = userId;
      where.recipientType = { in: ['CUSTOMER', 'GUEST'] };
    }

    const notification = await this.prisma.notification.findFirst({
      where,
      include: {
        booking: {
          select: {
            id: true,
            bookingReference: true,
            fromLocation: true,
            toLocation: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.mapNotification(notification);
  }

  async markAsUnread(
    id: string,
    userId: string,
    recipientType: 'ADMIN' | 'CUSTOMER',
  ): Promise<void> {
    const where: any = { id };

    if (recipientType === 'ADMIN') {
      where.recipientType = 'ADMIN';
    } else {
      where.userId = userId;
    }

    const notification = await this.prisma.notification.findFirst({ where });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.update({
      where: { id },
      data: { readAt: null },
    });
  }

  private mapNotifications(notifications: any[]): any[] {
    return notifications.map((n) => this.mapNotification(n));
  }

  private mapNotification(notification: any): any {
    return {
      id: notification.id,
      bookingId: notification.bookingId,
      bookingReference: notification.booking?.bookingReference,
      fromLocation: notification.booking?.fromLocation,
      toLocation: notification.booking?.toLocation,
      type: notification.type,
      subject: notification.subject,
      content: notification.content,
      readAt: notification.readAt,
      sentAt: notification.sentAt,
      recipientEmail: notification.recipientEmail,
      recipientName: notification.recipientName,
      recipientType: notification.recipientType,
    };
  }
}
