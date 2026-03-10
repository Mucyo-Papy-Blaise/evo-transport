import { EmailMetadata } from '../types/mailer';

//  Base template configuration
interface BaseTemplateConfig {
  platformName: string;
  platformIcon: string;
  platformUrl?: string;
  brandColor: string;
}

//   Default configuration for
const DEFAULT_CONFIG: BaseTemplateConfig = {
  platformName: process.env.PLATFORM_NAME || 'EVO TRANSPORT',
  platformIcon:
    process.env.PLATFORM_LOGO_URL ||
    'https://via.placeholder.com/40x40.png?text=E-Learn',
  platformUrl: process.env.PLATFORM_URL || 'https://elearning.example.com',
  brandColor: process.env.BRAND_COLOR || '#078ece',
};

// Generates the email header with platform/workspace branding
export function generateEmailHeader(metadata?: EmailMetadata): string {
  const config = { ...DEFAULT_CONFIG };

  const displayName =
    metadata?.workspaceName || metadata?.platformName || config.platformName;
  const displayIcon =
    metadata?.workspaceIcon || metadata?.platformIcon || config.platformIcon;
  const hasWorkspace = !!metadata?.workspaceName;

  return `
    <header style="margin-bottom: 16px;">
      <center>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
            <div style="padding-right: 10px;">
              <img 
                style="aspect-ratio: 1; width: 48px; height: 48px; object-fit: contain; display: block; border-radius: 100% ;" 
                src="${displayIcon}" 
                width="48" 
                height="48"
                alt="Platform Logo"
              />
            </div>
            <div>
              <h3 style="font-size: 22px; margin: 0; font-weight: 600; color: #111827;">
                ${hasWorkspace ? config.platformName : displayName}
              </h3>
              ${
                hasWorkspace
                  ? `
                <h4 style="font-size: 16px; margin: 4px 0 0 0; font-weight: 500; color: #6B7280;">
                  ${displayName}
                </h4>
              `
                  : ''
              }
            </div>
          </div>
        </div>
      </center>
    </header>
  `;
}

// Generates the email footer
export function generateEmailFooter(metadata?: EmailMetadata): string {
  const config = { ...DEFAULT_CONFIG };
  const platformName = metadata?.platformName || config.platformName;
  const platformUrl = metadata?.platformUrl || config.platformUrl;
  const currentYear = new Date().getFullYear();

  return `
    <footer style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 13px;">
      <p style="margin: 8px 0; line-height: 1.6;">
        This email was sent by <strong>${platformName}</strong>.
      </p>
      <p style="margin: 8px 0; line-height: 1.6;">
        If you have any questions, please contact our support team.
      </p>
      ${
        platformUrl
          ? `
        <p style="margin: 8px 0; line-height: 1.6;">
          <a href="${platformUrl}" style="color: ${config.brandColor}; text-decoration: none;">
            Visit ${platformName}
          </a>
        </p>
      `
          : ''
      }
      <p style="margin: 16px 0 0 0; font-size: 12px; color: #9CA3AF;">
        © ${currentYear} ${platformName}. All rights reserved.
      </p>
    </footer>
  `;
}

// Wraps email content with consistent header and footer
export function wrapEmailContent(
  content: string,
  metadata?: EmailMetadata,
): string {
  const header = generateEmailHeader(metadata);
  const footer = generateEmailFooter(metadata);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Email from ${metadata?.platformName || DEFAULT_CONFIG.platformName}</title>
    </head>
    <body style='
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        padding: 12px 8px; /* reduced outer padding to make body more compact */
      margin: 0;
      background-color: #F3F4F6;
      color: #1F2937;
      font-size: 15px;
      line-height: 1.6;
    '>
      <center>
        <div style="
          width: 100%;
          max-width: 600px;
          background: #ffffff;
            padding: 16px 12px; /* reduce inner container padding */
          text-align: left;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        ">
          ${header}
            <hr style="border: 0; height: 1px; background: #E5E7EB; margin: 8px 0;">
          <main style="color: #374151;">
            ${content}
          </main>
          ${footer}
        </div>
      </center>
    </body>
    </html>
  `;
}

// Creates a button component for emails
export function createButton(
  text: string,
  url: string,
  options?: {
    color?: string;
    backgroundColor?: string;
    padding?: string;
  },
): string {
  const bgColor = options?.backgroundColor || DEFAULT_CONFIG.brandColor;
  const color = options?.color || '#ffffff';
  const padding = options?.padding || '12px 24px';

  return `
    <a href="${url}" style="
      display: inline-block;
      background-color: ${bgColor};
      color: ${color};
      padding: ${padding};
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 12px 0;
      transition: opacity 0.2s;
    ">
      ${text}
    </a>
  `;
}

// Creates an info box component for emails

export function createInfoBox(
  content: string,
  options?: {
    backgroundColor?: string;
    borderColor?: string;
    icon?: string;
  },
): string {
  const bgColor = options?.backgroundColor || '#F9FAFB';
  const borderColor = options?.borderColor || '#E5E7EB';

  return `
    <div style="
      background: ${bgColor};
      border: 1px solid ${borderColor};
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
      border-left: 4px solid ${DEFAULT_CONFIG.brandColor};
    ">
      ${options?.icon ? `<div style="margin-bottom: 12px;">${options.icon}</div>` : ''}
      ${content}
    </div>
  `;
}

// Creates a highlight box for important information (credentials, codes, etc.)
export function createHighlightBox(
  title: string,
  items: Record<string, string>,
): string {
  const itemsHtml = Object.entries(items)
    .map(
      ([key, value]) => `
      <tr>
        <td style="padding: 8px 0; color: #6B7280; font-weight: 500;">${key}:</td>
        <td style="padding: 8px 0 8px 16px; color: #111827; font-weight: 600;">${value}</td>
      </tr>
    `,
    )
    .join('');

  return `
    <div style="
      background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
      border: 2px solid ${DEFAULT_CONFIG.brandColor};
      padding: 16px;
      margin: 16px 0;
      border-radius: 8px;
    ">
      <h4 style="margin: 0 0 12px 0; color: ${DEFAULT_CONFIG.brandColor}; font-size: 16px;">
        ${title}
      </h4>
      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHtml}
      </table>
    </div>
  `;
}

// Creates a large display code/OTP box
export function createCodeDisplay(
  code: string,
  expiryMinutes?: number,
): string {
  return `
    <div style="
      background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
      padding: 20px;
      text-align: center;
      margin: 16px 0;
      border-radius: 8px;
      border: 2px dashed ${DEFAULT_CONFIG.brandColor};
    ">
      <h2 style="
        color: ${DEFAULT_CONFIG.brandColor};
        letter-spacing: 8px;
        margin: 0;
        font-size: 36px;
        font-weight: 700;
        font-family: 'Courier New', monospace;
      ">
        ${code}
      </h2>
      ${
        expiryMinutes
          ? `
        <p style="margin: 8px 0 0 0; color: #6B7280; font-size: 13px;">
          This code will expire in ${expiryMinutes} minutes
        </p>
      `
          : ''
      }
    </div>
  `;
}

export function createTwoColumnLayout(
  leftColumn: Array<{ label: string; value: string }>,
  rightColumn: Array<{ label: string; value: string }>,
  options?: {
    leftWidth?: string;
    rightWidth?: string;
    gap?: string;
  },
): string {
  const leftWidth = options?.leftWidth || '48%';
  const rightWidth = options?.rightWidth || '48%';
  const gap = options?.gap || '4%';

  const renderColumn = (items: Array<{ label: string; value: string }>) => {
    return items
      .map(
        (item) => `
        <div style="margin-bottom: 12px;">
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${item.label}
          </div>
          <div style="font-size: 14px; color: #111827; font-weight: 500; word-break: break-word;">
            ${item.value}
          </div>
        </div>
      `,
      )
      .join('');
  };

  return `
    <div style="
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin: 16px 0;
      padding: 12px;
      background-color: #F9FAFB;
      border-radius: 8px;
    ">
      <div style="width: ${leftWidth};">
        ${renderColumn(leftColumn)}
      </div>
      <div style="width: ${rightWidth};">
        ${renderColumn(rightColumn)}
      </div>
    </div>
  `;
}

// You can also add a three-column layout if needed
export function createThreeColumnLayout(
  columns: Array<Array<{ label: string; value: string }>>,
  options?: {
    columnWidths?: string[];
    gap?: string;
  },
): string {
  const defaultWidths = ['32%', '32%', '32%'];
  const columnWidths = options?.columnWidths || defaultWidths;
  const gap = options?.gap || '2%';

  const renderColumn = (items: Array<{ label: string; value: string }>) => {
    return items
      .map(
        (item) => `
        <div style="margin-bottom: 12px;">
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${item.label}
          </div>
          <div style="font-size: 14px; color: #111827; font-weight: 500; word-break: break-word;">
            ${item.value}
          </div>
        </div>
      `,
      )
      .join('');
  };

  return `
    <div style="
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin: 16px 0;
      padding: 12px;
      background-color: #F9FAFB;
      border-radius: 8px;
    ">
      ${columns
        .map(
          (column, index) => `
          <div style="width: ${columnWidths[index]};">
            ${renderColumn(column)}
          </div>
        `,
        )
        .join('')}
    </div>
  `;
}
