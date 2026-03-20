import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  MailerOptions,
  EmailLog,
  BulkMailResponse,
  QueueStatus,
  TemplateCategory,
} from './types/mailer';
import { TemplateService } from './templates/template.service';

// Handles email sending via Resend HTTP API (faster than SMTP)
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private emailLogs: EmailLog[] = [];
  private readonly CONCURRENT_EMAILS = 5;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [10000, 30000, 60000]; // 10s, 30s, 60s
  private emailQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private readonly resend: Resend;
  private readonly from: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    const fromName = this.configService.get<string>(
      'MAIL_FROM_NAME',
      'ECO TRANSPORT',
    );
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');
    this.from = fromAddress
      ? `${fromName} <${fromAddress}>`
      : `${fromName} <onboarding@resend.dev>`;
  }

  // Send email using predefined template
  async sendTemplatedEmail(
    to: string | string[],
    category: TemplateCategory,
    templateKey: string,
    data: Record<string, string | number | boolean | null>,
    options?: {
      attachments?: MailerOptions['attachments'];
      metadata?: MailerOptions['metadata'];
    },
  ): Promise<boolean> {
    try {
      // Render template
      const { subject, html } = this.templateService.renderTemplate(
        category,
        templateKey,
        data,
        options?.metadata,
      );

      // Send email
      return await this.sendMail({
        to,
        subject,
        html,
        attachments: options?.attachments,
        metadata: {
          ...options?.metadata,
          template: `${category}.${templateKey}`,
        },
      });
    } catch (error) {
      this.logger.error('Error sending templated email:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category,
        templateKey,
        to,
      });
      return false;
    }
  }

  // Send email with custom HTML or raw template
  async sendMail(options: MailerOptions): Promise<boolean> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    this.logger.log(
      `Queuing email to: ${recipients.join(', ')}, Subject: ${options.subject}`,
    );

    return new Promise((resolve) => {
      const task = async () => {
        try {
          this.logger.debug('Attempting to send email:', {
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject: options.subject,
            hasAttachments: !!options.attachments?.length,
          });

          const success = await this.sendMailWithRetry(
            options,
            this.MAX_RETRIES,
          );

          if (!success) {
            this.logger.warn('Email sending failed after all retry attempts');
            resolve(false);
            return;
          }

          resolve(true);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          this.logEmail({
            success: false,
            to: options.to,
            subject: options.subject,
            template:
              typeof options.metadata?.template === 'string'
                ? options.metadata.template
                : undefined,
            metadata: options.metadata,
            error: errorMessage,
            timestamp: new Date(),
          });

          this.logger.warn(
            `Email sending failed but continuing: ${errorMessage}`,
          );
          resolve(false);
        }
      };

      this.emailQueue.push(task);
      this.processQueue().catch((error) => {
        this.logger.error('Queue processing error (non-blocking):', error);
      });
    });
  }

  // Send bulk emails with progress tracking
  async sendBulkMail(optionsArray: MailerOptions[]): Promise<BulkMailResponse> {
    this.logger.log(
      `Starting bulk email send to ${optionsArray.length} recipients`,
    );

    const results: BulkMailResponse = {
      total: optionsArray.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Split into chunks to avoid overwhelming the server
      const chunks = this.chunkArray(optionsArray, 50);
      this.logger.log(
        `Split into ${chunks.length} chunks of max 50 emails each`,
      );

      for (const [index, chunk] of chunks.entries()) {
        try {
          this.logger.log(`Processing chunk ${index + 1}/${chunks.length}`);

          const promises = chunk.map((options) =>
            this.sendMail(options)
              .then((success) => {
                if (success) {
                  results.success++;
                } else {
                  results.failed++;
                  results.errors.push({
                    to: Array.isArray(options.to)
                      ? options.to.join(', ')
                      : options.to,
                    error: 'Email sending failed',
                    retryable: false,
                  });
                }
              })
              .catch((error) => {
                results.failed++;
                results.errors.push({
                  to: Array.isArray(options.to)
                    ? options.to.join(', ')
                    : options.to,
                  error:
                    error instanceof Error ? error.message : 'Unknown error',
                  retryable: this.isRetryableError(error),
                });
              }),
          );

          await Promise.all(promises);

          // Delay between chunks to avoid rate limiting
          if (index < chunks.length - 1) {
            this.logger.debug('Waiting 5 seconds before next chunk');
            await this.delay(5000);
          }
        } catch (error) {
          this.logger.error(`Error processing chunk ${index + 1}:`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            chunkSize: chunk.length,
          });

          // Mark chunk emails as failed
          chunk.forEach((options) => {
            results.failed++;
            results.errors.push({
              to: Array.isArray(options.to)
                ? options.to.join(', ')
                : options.to,
              error: 'Chunk processing failed',
              retryable: true,
            });
          });
        }
      }
    } catch (error) {
      this.logger.error('Critical error in bulk email sending:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    this.logger.log('Bulk email sending completed:', results);
    return results;
  }

  // Send bulk templated emails
  async sendBulkTemplatedEmails(
    recipients: Array<{
      to: string;
      data: Record<string, string | number | boolean | null>;
    }>,
    category: TemplateCategory,
    templateKey: string,
    commonData?: Record<string, string | number | boolean | null>,
    metadata?: MailerOptions['metadata'],
  ): Promise<BulkMailResponse> {
    const mailOptions = recipients.map((recipient) => {
      const { subject, html } = this.templateService.renderTemplate(
        category,
        templateKey,
        { ...commonData, ...recipient.data },
        metadata,
      );

      return {
        to: recipient.to,
        subject,
        html,
        metadata: {
          ...metadata,
          template: `${category}.${templateKey}`,
        },
      };
    });

    return this.sendBulkMail(mailOptions);
  }

  // Process email queue with concurrency control
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.emailQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    this.logger.log(
      `Processing email queue. Queue size: ${this.emailQueue.length}`,
    );

    try {
      while (this.emailQueue.length > 0) {
        const batch: Array<() => Promise<void>> = [];

        // Create batch up to concurrent limit
        while (
          batch.length < this.CONCURRENT_EMAILS &&
          this.emailQueue.length > 0
        ) {
          const task = this.emailQueue.shift();
          if (task) {
            batch.push(task);
          }
        }

        if (batch.length > 0) {
          const results = await Promise.allSettled(batch.map((task) => task()));

          const successCount = results.filter(
            (r) => r.status === 'fulfilled',
          ).length;
          const failureCount = results.filter(
            (r) => r.status === 'rejected',
          ).length;

          this.logger.debug(
            `Batch processed: ${successCount} succeeded, ${failureCount} failed. Remaining: ${this.emailQueue.length}`,
          );

          // Log failures
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              this.logger.error(`Batch task ${index + 1} failed:`, {
                error:
                  result.reason instanceof Error
                    ? result.reason.message
                    : 'Unknown error',
              });
            }
          });
        }
      }
    } catch (error) {
      this.logger.error('Critical error in queue processing:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      this.isProcessingQueue = false;
      this.logger.log('Finished processing email queue');
    }
  }

  // Send email via Resend HTTP API with retry
  private async sendMailWithRetry(
    options: MailerOptions,
    maxRetries: number,
  ): Promise<boolean> {
    let lastError: Error | null = null;
    const to = Array.isArray(options.to) ? options.to : [options.to];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const payload: Parameters<Resend['emails']['send']>[0] = {
          from: this.from,
          to,
          subject: options.subject,
          html: options.html ?? '',
        };
        if (options.attachments?.length) {
          payload.attachments = options.attachments.map((a) => ({
            filename: a.filename,
            content:
              typeof a.content === 'string'
                ? Buffer.from(a.content)
                : a.content,
          }));
        }
        const { error } = await this.resend.emails.send(payload);
        if (error) throw new Error(error.message);

        this.logEmail({
          success: true,
          to: options.to,
          subject: options.subject,
          template:
            typeof options.metadata?.template === 'string'
              ? options.metadata.template
              : undefined,
          metadata: options.metadata,
          timestamp: new Date(),
          retryAttempts: attempt,
        });

        if (attempt > 0) {
          this.logger.log(
            `Email sent on retry attempt ${attempt + 1} (${to.join(', ')})`,
          );
        }

        return true;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const isRetryable = this.isRetryableError(error);

        if (!isRetryable || attempt >= maxRetries) {
          this.logger.error(
            `Email failed${attempt > 0 ? ` after ${attempt + 1} attempts` : ''}:`,
            {
              error: lastError.message,
              to: to.join(', '),
              retryable: isRetryable,
            },
          );
          break;
        }

        const delayMs = this.RETRY_DELAYS[attempt] || 60000;
        this.logger.warn(
          `Email failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delayMs / 1000}s`,
        );

        await this.delay(delayMs);
      }
    }

    this.logEmail({
      success: false,
      to: options.to,
      subject: options.subject,
      template:
        typeof options.metadata?.template === 'string'
          ? options.metadata.template
          : undefined,
      metadata: options.metadata,
      error: lastError instanceof Error ? lastError.message : 'Unknown error',
      timestamp: new Date(),
      retryAttempts: maxRetries + 1,
    });

    return false;
  }

  // Check if error is retryable
  private isRetryableError(error: unknown): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const lowerMessage = errorMessage.toLowerCase();

    const retryablePatterns = [
      'timeout',
      'connection',
      'econnreset',
      'etimedout',
      'enotfound',
      'econnrefused',
      'temporary',
      'retry',
      'rate limit',
      'too many',
      'unavailable',
      '503',
      '502',
      '504',
    ];

    const permanentPatterns = [
      'invalid email',
      'authentication failed',
      'unauthorized',
      'forbidden',
      '550',
      '551',
      '552',
      '553',
      '554',
      'invalid recipient',
    ];

    if (permanentPatterns.some((pattern) => lowerMessage.includes(pattern))) {
      return false;
    }

    return retryablePatterns.some((pattern) => lowerMessage.includes(pattern));
  }

  // Log email activity
  private logEmail(log: EmailLog): void {
    this.emailLogs.push(log);

    // Keep only last 1000 logs in memory
    if (this.emailLogs.length > 1000) {
      this.emailLogs = this.emailLogs.slice(-1000);
    }

    const logData = {
      to: log.to,
      subject: log.subject,
      template: log.template,
      timestamp: log.timestamp,
      success: log.success,
      retryAttempts: log.retryAttempts,
    };

    if (log.success) {
      this.logger.log('Email sent successfully:', logData);
    } else {
      this.logger.error('Email sending failed:', {
        ...logData,
        error: log.error,
      });
    }
  }

  // Utility: Split array into chunks
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Utility: Delay execution
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get recent email logs
  getRecentLogs(limit = 100): EmailLog[] {
    return this.emailLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  //  Get queue status
  getQueueStatus(): QueueStatus {
    const recentLogs = this.getRecentLogs(50);
    const recentFailures = recentLogs.filter((log) => !log.success).length;
    const failureRate =
      recentLogs.length > 0 ? recentFailures / recentLogs.length : 0;

    return {
      size: this.emailQueue.length,
      isProcessing: this.isProcessingQueue,
      isHealthy: this.isHealthy(),
      failureRate,
    };
  }

  // Check if email service is healthy
  isHealthy(): boolean {
    try {
      const isQueueStuck =
        this.isProcessingQueue && this.emailQueue.length === 0;
      const recentLogs = this.getRecentLogs(50);
      const recentFailures = recentLogs.filter((log) => !log.success).length;
      const failureRate =
        recentLogs.length > 0 ? recentFailures / recentLogs.length : 0;

      return !isQueueStuck && failureRate < 0.8;
    } catch (error) {
      this.logger.error('Error checking health:', error);
      return false;
    }
  }

  // Clear email queue (emergency use only)
  clearQueue(): void {
    const queueSize = this.emailQueue.length;
    this.emailQueue = [];
    this.isProcessingQueue = false;
    this.logger.warn(`Email queue cleared. Removed ${queueSize} emails.`);
  }

  // Get email statistics
  getStatistics(hours = 24): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  } {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentLogs = this.emailLogs.filter(
      (log) => log.timestamp >= cutoffTime,
    );

    const total = recentLogs.length;
    const successful = recentLogs.filter((log) => log.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      total,
      successful,
      failed,
      successRate,
    };
  }
}
