import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcryptjs from 'bcryptjs';
import { randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  JwtPayload,
  LoginResponse,
  UserResponse,
  ChangePasswordResponse,
  UpdateProfileResponse,
} from '../types/auth.types';
import { ResponseUtil } from 'src/utils/response.util';
import { ErrorUtil } from 'src/utils/error.util';
import { MailerService } from 'src/mailer/mailer.service';
import { AccountStatus, User, UserRole } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly emailService: MailerService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  private async issueLoginResponse(user: User): Promise<LoginResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      preferredLanguage: user.preferredLanguage,
      preferredCurrency: user.preferredCurrency,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload),
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: this.mapUserResponse(user),
    };
  }

  private mapUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      fullName:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      preferredLanguage: user.preferredLanguage,
      preferredCurrency: user.preferredCurrency,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    };
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`Login attempt: ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is inactive');
    }
    const isPasswordValid = await this.comparePassword(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueLoginResponse(user);
  }

  async register(dto: RegisterDto): Promise<LoginResponse> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone?.trim() || null,
        role: UserRole.PASSENGER,
        isGuest: false,
        status: AccountStatus.ACTIVE,
        isEmailVerified: false,
      },
    });

    this.logger.log(`Registered passenger: ${user.email}`);
    return this.issueLoginResponse(user);
  }

  async getLoggedInUser(userId: string): Promise<UserResponse> {
    this.logger.log(`Getting logged in user with ID: ${userId}`);

    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.mapUserResponse(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UpdateProfileResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        status: AccountStatus.ACTIVE,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.profilePicture !== undefined && {
          profilePicture: dto.profilePicture,
        }),
        ...(dto.preferredLanguage !== undefined && {
          preferredLanguage: dto.preferredLanguage,
        }),
        ...(dto.preferredCurrency !== undefined && {
          preferredCurrency: dto.preferredCurrency,
        }),
      },
    });

    return {
      message: 'Profile updated successfully',
      user: this.mapUserResponse(updatedUser),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return ResponseUtil.success(
        {},
        'If an account exists with this email, you will receive a password reset link.',
      );
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const hashedToken = await bcryptjs.hash(resetToken, 10);

    // Set expiry to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store reset token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await this.emailService.sendTemplatedEmail(
        user.email,
        'AUTH',
        'PASSWORD_RESET',
        {
          email: user.email,
          firstName: user.firstName || 'User',
          resetUrl,
          expiryHours: 1,
        },
      );
    } catch (error) {
      this.logger.error('Failed to send password reset email:', error);
    }

    return ResponseUtil.success(
      {},
      'If an account exists with this email, you will receive a password reset link.',
    );
  }

  async resetPassword(token: string, newPassword: string) {
    // Find user with valid reset token
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user || !user.passwordResetToken) {
      return ErrorUtil.throwBadRequest('Invalid or expired reset token');
    }

    // Verify token
    const isValidToken = await bcryptjs.compare(token, user.passwordResetToken);
    if (!isValidToken) {
      return ErrorUtil.throwBadRequest('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    try {
      // Using your exact pattern from the shared project
      await this.emailService.sendTemplatedEmail(
        user.email,
        'AUTH',
        'PASSWORD_CHANGED',
        {
          email: user.email,
          firstName: user.firstName || 'User',
          changedAt: new Date().toLocaleString(),
          loginUrl: `${process.env.FRONTEND_URL}/login`,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to send password change confirmation email:',
        error,
      );
    }

    return ResponseUtil.success({}, 'Password has been reset successfully');
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      ErrorUtil.throwNotFound('User not found');
    }

    const verificationToken = randomBytes(32).toString('hex');
    const hashedToken = await bcryptjs.hash(verificationToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: hashedToken },
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    try {
      await this.emailService.sendTemplatedEmail(
        user.email,
        'AUTH',
        'EMAIL_VERIFICATION',
        {
          email: user.email,
          firstName: user.firstName || 'User',
          verificationUrl,
        },
      );
    } catch (error) {
      this.logger.error('Failed to send verification email:', error);
    }

    return ResponseUtil.success({}, 'Verification email sent');
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<ChangePasswordResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Cannot change password for guest account');
    }

    const isCurrentValid = await this.comparePassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        status: AccountStatus.ACTIVE,
      },
    });
    return !!user;
  }

  logout(userId: string) {
    this.logger.log(`User logged out: ${userId}`);
    return ResponseUtil.success({}, 'Logged out successfully');
  }
}
