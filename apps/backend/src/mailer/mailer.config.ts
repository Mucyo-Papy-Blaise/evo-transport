import type { EmailMetadata } from './types/mailer';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    email: string;
    name: string;
  };
}

export interface MailerConfig {
  smtp: SmtpConfig;
  appName: string;
  frontendUrl: string;
  adminUrl: string;
  appUrl: string;
  supportEmail: string;
  platformLogoUrl: string;
  brandColor: string;
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * SMTP + app URLs (TUMA-style) — single source for mailer, templates, booking, auth.
 */
export function getMailerConfig(): MailerConfig {
  const appName =
    process.env.APP_NAME || process.env.PLATFORM_NAME || 'ECO TRANSPORT';

  const frontendUrl = trimTrailingSlash(
    process.env.FRONTEND_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000',
  );

  const adminUrl = trimTrailingSlash(
    process.env.ADMIN_URL || `${frontendUrl}/admin`,
  );

  const appUrl = trimTrailingSlash(
    process.env.APP_URL || process.env.BACKEND_URL || 'http://localhost:4000',
  );

  const smtpFromEmail =
    process.env.SMTP_FROM_EMAIL ||
    process.env.MAIL_FROM_ADDRESS ||
    'noreply@ecotransport.com';

  const supportEmail = process.env.SUPPORT_EMAIL?.trim() || smtpFromEmail;

  return {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      from: {
        email: smtpFromEmail,
        name:
          process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || appName,
      },
    },
    appName,
    frontendUrl,
    adminUrl,
    appUrl,
    supportEmail,
    platformLogoUrl: process.env.PLATFORM_LOGO_URL || '',
    brandColor: process.env.BRAND_COLOR || '#078ece',
  };
}

/** Default header/footer metadata for all transactional emails */
export function getDefaultEmailMetadata(): EmailMetadata {
  const c = getMailerConfig();
  return {
    platformName: c.appName,
    platformIcon:
      c.platformLogoUrl || 'https://via.placeholder.com/40x40.png?text=EVO',
    platformUrl: c.frontendUrl,
  };
}
