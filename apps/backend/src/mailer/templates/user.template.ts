import {
  createButton,
  createInfoBox,
  createHighlightBox,
} from './base.template';
import { getPlatformName, getBrandColor } from './template.utils';

const BRAND_COLOR = getBrandColor();

export const USER_TEMPLATES = {
  // Invite new user with auto-generated temp password
  INVITE_USER: (data: {
    fullName: string;
    email: string;
    tempPassword: string;
    role: string;
    loginUrl: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <h2 style="color: ${BRAND_COLOR}; margin-bottom: 16px;">
          You've Been Invited 🎉
        </h2>

        <p>Dear ${data.fullName},</p>

        <p>
          You have been invited to join <strong>${getPlatformName(data)}</strong>
          as a <strong>${data.role}</strong>. Your account is ready and waiting for you.
        </p>

        ${createHighlightBox('Your Login Credentials', {
          Email: data.email,
          'Temporary Password': data.tempPassword,
          Role: data.role,
        })}

        ${createInfoBox(
          `
          <p style="margin: 0; font-weight: 500; color: #D97706;">
            ⚠️ For security, you must change your password on first login.
          </p>
          <p style="margin: 8px 0 0 0; color: #6B7280;">
            Your temporary password will expire after first use.
          </p>
        `,
          { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
        )}

        ${createButton('Accept Invitation & Login', data.loginUrl)}

        <p style="margin-top: 24px; font-size: 14px; color: #6B7280;">
          If you were not expecting this invitation or believe it was sent in error,
          you can safely ignore this email.
        </p>

        <p style="margin-top: 24px;">
          Welcome aboard,<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Account disabled notification
  ACCOUNT_DISABLED: (data: {
    fullName: string;
    email: string;
    reason?: string;
    supportEmail?: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <h2 style="color: #EF4444; margin-bottom: 16px;">
          Your Account Has Been Disabled
        </h2>

        <p>Dear ${data.fullName},</p>

        <p>
          We are writing to inform you that your account on
          <strong>${getPlatformName(data)}</strong> associated with
          <strong>${data.email}</strong> has been disabled.
        </p>

        ${createInfoBox(
          `
          <p style="margin: 0 0 8px 0; font-weight: 500;">
            What this means:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #6B7280; line-height: 1.8;">
            <li>You can no longer log in to the platform</li>
            <li>Your data remains securely stored</li>
            <li>Access can be restored by your administrator</li>
          </ul>
          ${
            data.reason
              ? `
            <p style="margin: 16px 0 0 0; font-weight: 500;">Reason:</p>
            <p style="margin: 4px 0 0 0; color: #6B7280;">${data.reason}</p>
          `
              : ''
          }
        `,
          { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
        )}

        <p style="margin-top: 24px;">
          If you believe this was done in error or would like to appeal,
          please contact your administrator${
            data.supportEmail
              ? ` at <a href="mailto:${data.supportEmail}" style="color: ${BRAND_COLOR};">${data.supportEmail}</a>`
              : ''
          }.
        </p>

        <p style="margin-top: 24px;">
          Best regards,<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Account re-enabled notification
  ACCOUNT_ENABLED: (data: {
    fullName: string;
    loginUrl: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <h2 style="color: #10B981; margin-bottom: 16px;">
          Your Account Has Been Re-enabled ✓
        </h2>

        <p>Dear ${data.fullName},</p>

        <p>
          Good news! Your account on <strong>${getPlatformName(data)}</strong>
          has been re-enabled. You can now log in and access the platform.
        </p>

        ${createButton('Login to Your Account', data.loginUrl)}

        <p style="margin-top: 24px;">
          Welcome back,<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },
};
