import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccountStatus } from '@prisma/client';

/**
 * For public routes: never blocks. If a valid Bearer token is present, sets `req.user`.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) return true;

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        token,
        { secret: process.env.JWT_SECRET },
      );
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub, status: AccountStatus.ACTIVE },
      });
      if (user) (request as any).user = user;
    } catch {
      /* invalid token — treat as anonymous */
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, t] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? t : undefined;
  }
}
