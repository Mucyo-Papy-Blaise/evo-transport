import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    // Skip audit for GET requests to reduce noise
    if (method === 'GET') {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async () => {
          const responseTime = Date.now() - startTime;

          // Log to database if user exists
          if (user) {
            try {
              await this.prisma.auditLog.create({
                data: {
                  userId: user.id,
                  action: `${method} ${url}`,
                  method: method,
                  url: url,
                  body: body,
                  status: 'success',
                  ipAddress: request.ip,
                  userAgent: request.get('user-agent') || '',
                  responseTime: responseTime,
                },
              });
            } catch (error) {
              this.logger.error('Failed to create audit log', error);
            }
          }

          this.logger.log(
            `Audit - User: ${user?.id || 'anonymous'} - ${method} ${url} - ${responseTime}ms`,
          );
        },
        error: async (error) => {
          const responseTime = Date.now() - startTime;

          if (user) {
            try {
              await this.prisma.auditLog.create({
                data: {
                  userId: user.id,
                  action: `${method} ${url} - ERROR`,
                  method: method,
                  url: url,
                  body: body,
                  status: 'error',
                  error: error.message,
                  ipAddress: request.ip,
                  userAgent: request.get('user-agent') || '',
                  responseTime: responseTime,
                },
              });
            } catch (logError) {
              this.logger.error('Failed to create error audit log', logError);
            }
          }
        },
      }),
    );
  }
}
