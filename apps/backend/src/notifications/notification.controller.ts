import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  NotificationFilterDto,
  MarkAsReadDto,
} from './dto/notification-filter.dto';
import {
  NotificationListResponseDto,
  NotificationResponseDto,
  UnreadCountResponseDto,
} from './dto/notification-response.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { UserRole } from '@prisma/client';
import { ResponseUtil } from 'src/utils/response.util';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get admin notifications' })
  @ApiResponse({ status: HttpStatus.OK, type: NotificationListResponseDto })
  async getAdminNotifications(
    @CurrentUser('id') adminId: string,
    @Query() filter: NotificationFilterDto,
  ): Promise<NotificationListResponseDto> {
    const { page = 1, limit = 20, unreadOnly, type } = filter;
    const skip = (page - 1) * limit;

    const result = await this.notificationService.getAdminNotifications(
      adminId,
      {
        skip,
        take: limit,
        unreadOnly,
        type,
      },
    );

    return {
      notifications: result.notifications,
      unreadCount: result.unreadCount,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  @Get('user')
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: HttpStatus.OK, type: NotificationListResponseDto })
  async getUserNotifications(
    @CurrentUser('id') userId: string,
    @Query() filter: NotificationFilterDto,
  ): Promise<NotificationListResponseDto> {
    const { page = 1, limit = 20, unreadOnly, type } = filter;
    const skip = (page - 1) * limit;

    const result = await this.notificationService.getUserNotifications(userId, {
      skip,
      take: limit,
      unreadOnly,
      type,
    });

    return {
      notifications: result.notifications,
      unreadCount: result.unreadCount,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: HttpStatus.OK, type: UnreadCountResponseDto })
  async getUnreadCount(
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<UnreadCountResponseDto> {
    const count = await this.notificationService.getUnreadCount(
      user.id,
      user.role === UserRole.ADMIN ? 'ADMIN' : 'CUSTOMER',
    );
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: NotificationResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  async getNotificationById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationService.getNotificationById(
      id,
      user.id,
      user.role === UserRole.ADMIN ? 'ADMIN' : 'CUSTOMER',
    );
    return notification;
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: HttpStatus.OK })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    await this.notificationService.markAsRead(
      id,
      user.id,
      user.role === UserRole.ADMIN,
    );
    return ResponseUtil.success({}, 'Notification marked as read');
  }

  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: HttpStatus.OK })
  async markAllAsRead(
    @CurrentUser() user: { id: string; role: UserRole },
    @Query() dto: MarkAsReadDto,
  ) {
    await this.notificationService.markAllAsRead(
      user.id,
      user.role === UserRole.ADMIN ? 'ADMIN' : 'CUSTOMER',
      { type: dto.type },
    );
    return ResponseUtil.success({}, 'All notifications marked as read');
  }

  @Patch(':id/unread')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as unread' })
  @ApiResponse({ status: HttpStatus.OK })
  async markAsUnread(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    await this.notificationService.markAsUnread(
      id,
      user.id,
      user.role === UserRole.ADMIN ? 'ADMIN' : 'CUSTOMER',
    );
    return ResponseUtil.success({}, 'Notification marked as unread');
  }
}
