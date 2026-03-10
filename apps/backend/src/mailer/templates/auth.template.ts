import {
  createButton,
  createInfoBox,
  createHighlightBox,
} from './base.template';
import { getPlatformName, getBrandColor } from './template.utils';

// Brand color for consistent styling across all auth templates
const BRAND_COLOR = getBrandColor();

// Authentication Email Templates
export const AUTH_TEMPLATES = {
  WELCOME_NEW_USER: (data: {
    fullName: string;
    email: string;
    tempPassword: string;
    loginUrl: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <h2 style="color: ${BRAND_COLOR}; margin-bottom: 16px;">Welcome to ${getPlatformName(data)}!</h2>
        
        <p>Dear ${data.fullName},</p>
        
        <p>
          We're excited to have you join our learning community! Your account has been successfully created, 
          and you can now access all our courses and learning materials.
        </p>
        
        ${createHighlightBox('Your Login Credentials', {
          Email: data.email,
          'Temporary Password': data.tempPassword,
        })}
        
        ${createButton('Login to Your Account', data.loginUrl)}
        
        <p style="margin-top: 24px;">
          Once logged in, you'll be able to:
        </p>
        <ul style="color: #6B7280; line-height: 1.8;">
          <li>Browse and enroll in courses</li>
          <li>Track your learning progress</li>
          <li>Access course materials and resources</li>
          <li>Participate in discussions and activities</li>
          <li>Earn certificates upon course completion</li>
        </ul>
        
        <p style="margin-top: 24px;">
          If you have any questions or need assistance getting started, our support team is here to help.
        </p>
        
        <p style="margin-top: 24px;">
          Happy learning!<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  WELCOME_NEW_STAFF: (data: {
    fullName: string;
    email: string;
    tempPassword: string;
    institutionName: string;
    loginUrl: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <h2 style="color: ${BRAND_COLOR}; margin-bottom: 16px;">Welcome to ${getPlatformName(data)}! 👋</h2>

        <p>Dear ${data.fullName},</p>

        <p>
          Welcome! Your account has been successfully created for accessing <strong>${data.institutionName}</strong> on our platform.
        </p>

        ${createHighlightBox('Your Login Credentials', {
          Email: data.email,
          'Temporary Password': data.tempPassword,
        })}

        ${createButton('Login to Your Account', data.loginUrl)}

        <p style="margin-top: 24px;">
          If you have any questions or need assistance getting started, our support team is here to help.
        </p>

        <p style="margin-top: 24px;">
          Best regards,<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Existing User
  EXISTING_USER: (data: {
    fullName: string;
    email: string;
    loginUrl: string;
    platformName?: string;
  }): string => {
    return `
    <div style="color: #374151;">
      <h2 style="color: ${BRAND_COLOR}; margin-bottom: 16px;">Account Already Exists 🔑</h2>

      <p>Dear ${data.fullName},</p>

      <p>
        It looks like there's already an account associated with 
        <strong>${data.email}</strong> on 
        <strong>${getPlatformName(data)}</strong>.
      </p>

      ${createInfoBox(`
        <p style="margin: 0; font-weight: 500;">
          Please log in using the password you previously set.
        </p>
        <p style="margin: 8px 0 0 0;">
          If you don’t remember your password, you can easily reset it from the login page.
        </p>
      `)}

      ${createButton('Go to Login', data.loginUrl)}

      <p style="margin-top: 24px;">
        This helps keep your account secure and prevents creating duplicate profiles.
      </p>

      <p style="margin-top: 24px;">
        Best regards,<br>
        <strong>The ${getPlatformName(data)} Team</strong>
      </p>
    </div>
  `;
  },


  // Password reset request
  PASSWORD_RESET: (data: {
    firstName: string;
    lastName: string;
    resetUrl: string;
    expiryHours?: number;
    platformName?: string;
  }): string => {
    const expiry = data.expiryHours || 1;

    return `
      <div style="color: #374151;">
        <h2 style="color: ${BRAND_COLOR}; margin-bottom: 16px;">Password Reset Request 🔐</h2>
        
        <p>Dear ${data.firstName} ${data?.lastName ?? ''},</p>
        
        <p>
          We received a request to reset your password for your account on 
          <strong>${getPlatformName(data)}</strong>.
        </p>
        
        ${createInfoBox(`
          <p style="margin: 0 0 8px 0;">
            If you did not request this password reset, please ignore this email. 
            Your password will remain unchanged.
          </p>
          <p style="margin: 0; font-weight: 500; color: #DC2626;">
            ⚠️ This link will expire in ${expiry} hour${expiry > 1 ? 's' : ''} for security.
          </p>
        `)}
        
        ${createButton('Reset Your Password', data.resetUrl)}
        
        <p style="margin-top: 24px; font-size: 14px; color: #6B7280;">
          If the button above doesn't work, copy and paste this link into your browser:
        </p>
        <p style="
          word-break: break-all; 
          color: ${BRAND_COLOR}; 
          font-size: 13px; 
          background: #F9FAFB; 
          padding: 12px; 
          border-radius: 4px;
          font-family: monospace;
        ">
          ${data.resetUrl}
        </p>
        
        <p style="margin-top: 24px;">
          Best regards,<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Password changed notification
  PASSWORD_CHANGED: (data: {
    firstName: string;
    lastName: string;
    changedAt: string;
    loginUrl: string;
    supportUrl?: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <h2 style="color: #10B981; margin-bottom: 16px;">Password Changed Successfully ✓</h2>
        
        <p>Dear ${data.firstName} ${data.lastName},</p>
        
        <p>
          Your password for <strong>${getPlatformName(data)}</strong> 
          has been changed successfully.
        </p>
        
        ${createHighlightBox('Change Details', {
          'Changed On': data.changedAt,
        })}
        
        ${createInfoBox(
          `
          <p style="margin: 0; font-weight: 500; color: #DC2626;">
            ⚠️ If you did not make this change, please contact support immediately.
          </p>
        `,
          {
            backgroundColor: '#FEF2F2',
            borderColor: '#FCA5A5',
          },
        )}
        
        ${createButton('Login with New Password', data.loginUrl)}
        
        ${
          data.supportUrl
            ? `
          <p style="margin-top: 24px; font-size: 14px; color: #6B7280;">
            Need help? <a href="${data.supportUrl}" style="color: ${BRAND_COLOR};">Contact Support</a>
          </p>
        `
            : ''
        }
        
        <p style="margin-top: 24px;">
          Best regards,<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Email verification request
  EMAIL_VERIFICATION: (data: {
    firstName: string;
    lastName: string;
    verificationUrl: string;
    expiryHours?: number;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <h2 style="color: ${BRAND_COLOR}; margin-bottom: 16px;">Verify Your Email Address 📧</h2>
        
        <p>Dear ${data.firstName} ${data.lastName},</p>
        
        <p>
          Thank you for registering with <strong>${getPlatformName(data)}</strong>!
        </p>
        
        <p>
          To complete your registration and activate your account, please verify your email address 
          by clicking the button below:
        </p>
        
        ${createButton('Verify Email Address', data.verificationUrl)}
        
        <p style="margin-top: 24px; font-size: 14px; color: #6B7280;">
          If the button doesn't work, copy and paste this link:
        </p>
        <p style="
          word-break: break-all; 
          color: ${BRAND_COLOR}; 
          font-size: 13px; 
          background: #F9FAFB; 
          padding: 12px; 
          border-radius: 4px;
          font-family: monospace;
        ">
          ${data.verificationUrl}
        </p>
        
        <p style="margin-top: 24px;">
          Welcome to our learning community!<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Account deactivated notification
  ACCOUNT_DEACTIVATED: (data: {
    firstName: string;
    lastName: string;
    reason?: string;
    reactivationUrl?: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <h2 style="color: #EF4444; margin-bottom: 16px;">Account Deactivated</h2>
        
        <p>Dear ${data.firstName} ${data.lastName},</p>
        
        <p>
          Your account on <strong>${getPlatformName(data)}</strong> 
          has been deactivated.
        </p>
        
        ${createInfoBox(
          `
          <p style="margin: 0 0 12px 0; font-weight: 500;">
            You no longer have access to:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #6B7280;">
            <li>Course materials and resources</li>
            <li>Your learning progress and achievements</li>
            <li>Platform features and discussions</li>
          </ul>
          ${
            data.reason
              ? `
            <p style="margin: 16px 0 0 0; font-weight: 500;">Reason:</p>
            <p style="margin: 4px 0 0 0;">${data.reason}</p>
          `
              : ''
          }
        `,
          {
            backgroundColor: '#FEF2F2',
            borderColor: '#FCA5A5',
          },
        )}
        
        ${
          data.reactivationUrl
            ? `
          <p>
            If you would like to reactivate your account or believe this was done in error, 
            please contact our support team:
          </p>
          ${createButton('Contact Support', data.reactivationUrl)}
        `
            : `
          <p>
            If you believe this was done in error or have any questions, 
            please contact our support team.
          </p>
        `
        }
        
        <p style="margin-top: 24px;">
          Best regards,<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },
};
