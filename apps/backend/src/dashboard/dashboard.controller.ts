import { Controller, Get, Query, UseGuards, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  DashboardService,
  DashboardStatsDto,
  RecentBookingDto,
} from './dashboard.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin/dashboard')
@Controller('admin/dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard stats' })
  getStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent bookings (admin only)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max number of bookings',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recent bookings list' })
  getRecentBookings(
    @Query('limit') limit?: string,
  ): Promise<RecentBookingDto[]> {
    const limitNum = limit ? Math.min(Math.max(1, parseInt(limit, 10)), 50) : 5;
    return this.dashboardService.getRecentBookings(limitNum);
  }
}
