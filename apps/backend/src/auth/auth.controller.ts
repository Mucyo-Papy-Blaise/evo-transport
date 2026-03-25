import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  LoginResponse,
  ChangePasswordResponse,
  UpdateProfileResponse,
} from '../types/auth.types';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a passenger account',
    description: 'Registers a non-guest user and returns tokens (same shape as login).',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Account created' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered',
  })
  async register(@Body() dto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Authenticate user and receive JWT tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or account inactive',
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getMe(@CurrentUser('id') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.authService.getLoggedInUser(userId);
  }

  @Patch('update-profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UpdateProfileResponse> {
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    return this.authService.updateProfile(userId, dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if account exists',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change user password',
    description: 'Change password after verifying the current password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired token',
  })
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<ChangePasswordResponse> {
    return this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidate the current session',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
  })
  logout(@CurrentUser('sub') userId: string) {
    return this.authService.logout(userId);
  }
}
