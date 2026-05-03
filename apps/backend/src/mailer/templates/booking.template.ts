import {
  createButton,
  createInfoBox,
  createHighlightBox,
  createTwoColumnLayout,
} from './base.template';
import {
  getPlatformName,
  getBrandColor,
  formatCurrency,
} from './template.utils';
import { getMailerConfig } from '../mailer.config';

const BRAND_COLOR = getBrandColor();

// Booking Email Templates for EVO Transport
export const BOOKING_TEMPLATES = {
  // ─── 1. New booking received ─────────────────────────────────────────────
  BOOKING_CONFIRMATION: (data: {
    customerName: string;
    bookingReference: string;
    fromLocation: string;
    toLocation: string;
    fromCode?: string;
    toCode?: string;
    departureDate: string;
    departureTime: string;
    returnDate?: string | null;
    returnTime?: string | null;
    passengers: number;
    price: number;
    currency: string;
    tripType: string;
    status: string;
    platformName?: string;
    supportEmail?: string;
  }): string => {
    const support = data.supportEmail ?? getMailerConfig().supportEmail;
    const routeDisplay =
      data.fromCode && data.toCode
        ? `${data.fromCode} → ${data.toCode}`
        : `${data.fromLocation} → ${data.toLocation}`;

    return `
      <div style="color: #374151;">
        <h2 style="color: ${BRAND_COLOR}; margin-bottom: 16px;">Booking Request Received! 🚌</h2>
        <p>Dear ${data.customerName},</p>
        <p>Thank you for choosing <strong>${getPlatformName(data)}</strong>! We've received your booking request and will confirm it shortly.</p>
        ${createHighlightBox('Booking Reference', {
          Reference: data.bookingReference,
          Status: '⏳ Pending Confirmation',
        })}
        <h3 style="color: ${BRAND_COLOR}; margin: 24px 0 16px 0;">Trip Details</h3>
        ${createTwoColumnLayout(
          [
            { label: 'Route', value: routeDisplay },
            {
              label: 'Trip Type',
              value: data.tripType === 'ONE_WAY' ? 'One Way' : 'Round Trip',
            },
          ],
          [
            {
              label: 'Departure',
              value: `${data.departureDate} at ${data.departureTime}`,
            },
            {
              label: 'Return',
              value:
                data.returnDate && data.returnTime
                  ? `${data.returnDate} at ${data.returnTime}`
                  : 'Not applicable',
            },
          ],
        )}
        ${createTwoColumnLayout(
          [
            { label: 'Passengers', value: data.passengers.toString() },
            {
              label: 'Total Price',
              value: formatCurrency(data.price, data.currency),
            },
          ],
          [
            { label: 'From', value: data.fromLocation },
            { label: 'To', value: data.toLocation },
          ],
        )}
        ${createInfoBox(`
          <p style="margin: 0; font-weight: 500;">What happens next?</p>
          <ol style="margin: 8px 0 0 0; padding-left: 20px; color: #6B7280;">
            <li>Our team will review your booking request</li>
            <li>You'll receive a confirmation email within 2 hours</li>
            <li>Driver details will be shared 1 hour before departure</li>
          </ol>
        `)}
        <p style="margin-top: 24px;">Safe travels!<br><strong>The ${getPlatformName(data)} Team</strong></p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;" />
        <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
          Booking Reference: ${data.bookingReference} | For assistance: ${support}
        </p>
      </div>
    `;
  },

  // ─── 2. Admin notified of new booking ────────────────────────────────────
  ADMIN_BOOKING_NOTIFICATION: (data: {
    adminName: string;
    bookingReference: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    userType: 'REGISTERED' | 'GUEST';
    fromLocation: string;
    toLocation: string;
    fromCode?: string;
    toCode?: string;
    departureDate: string;
    departureTime: string;
    passengers: number;
    price: number;
    currency: string;
    createdAt: string;
    adminUrl: string;
    platformName?: string;
  }): string => {
    const routeDisplay =
      data.fromCode && data.toCode
        ? `${data.fromCode} → ${data.toCode}`
        : `${data.fromLocation} → ${data.toLocation}`;

    return `
      <div style="color: #374151;">
        <div style="background-color: #FEF3C7; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #92400E; margin: 0;">🔔 New Booking Request</h2>
        </div>
        <p>Hello ${data.adminName},</p>
        <p>A new booking has been received and requires your attention.</p>
        ${createHighlightBox('Booking Summary', {
          Reference: data.bookingReference,
          Status: '⏳ PENDING',
          Received: data.createdAt,
        })}
        <h3 style="color: ${BRAND_COLOR}; margin: 24px 0 16px 0;">Customer Information</h3>
        ${createTwoColumnLayout(
          [
            { label: 'Name', value: data.customerName },
            { label: 'Email', value: data.customerEmail },
          ],
          [
            { label: 'Phone', value: data.customerPhone || 'Not provided' },
            {
              label: 'Account Type',
              value:
                data.userType === 'REGISTERED' ? 'Registered User' : 'Guest',
            },
          ],
        )}
        <h3 style="color: ${BRAND_COLOR}; margin: 24px 0 16px 0;">Trip Details</h3>
        ${createTwoColumnLayout(
          [
            { label: 'Route', value: routeDisplay },
            {
              label: 'Departure',
              value: `${data.departureDate} at ${data.departureTime}`,
            },
          ],
          [
            { label: 'Passengers', value: data.passengers.toString() },
            {
              label: 'Price',
              value: formatCurrency(data.price, data.currency),
            },
          ],
        )}
        <div style="margin: 32px 0; text-align: center;">
          <a href="${data.adminUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
            View & Manage Booking
          </a>
        </div>
        <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px;">
          <p style="margin: 0; font-weight: 500;">Quick Actions:</p>
          <div style="margin-top: 12px;">
            <a href="${data.adminUrl}/confirm" style="display:inline-block;background-color:#10B981;color:white;padding:8px 16px;text-decoration:none;border-radius:6px;margin-right:8px;font-size:14px;">✓ Confirm</a>
            <a href="${data.adminUrl}/reject"  style="display:inline-block;background-color:#EF4444;color:white;padding:8px 16px;text-decoration:none;border-radius:6px;margin-right:8px;font-size:14px;">✗ Reject</a>
            <a href="${data.adminUrl}/respond" style="display:inline-block;background-color:#6B7280;color:white;padding:8px 16px;text-decoration:none;border-radius:6px;font-size:14px;">💬 Message</a>
          </div>
        </div>
        <p style="margin-top: 24px; font-size: 14px; color: #6B7280;">Please respond to this booking within 24 hours.</p>
      </div>
    `;
  },

  // ─── 3. Booking confirmed ─────────────────────────────────────────────────
  BOOKING_CONFIRMED: (data: {
    customerName: string;
    bookingReference: string;
    fromLocation: string;
    toLocation: string;
    fromCode?: string;
    toCode?: string;
    departureDate: string;
    departureTime: string;
    returnDate?: string | null;
    returnTime?: string | null;
    reason: string;
    dashboardUrl?: string;
    platformName?: string;
  }): string => {
    const routeDisplay =
      data.fromCode && data.toCode
        ? `${data.fromCode} → ${data.toCode}`
        : `${data.fromLocation} → ${data.toLocation}`;

    return `
      <div style="color: #374151;">
        <div style="background-color: #D1FAE5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #065F46; margin: 0;">✓ Booking Confirmed!</h2>
        </div>
        <p>Dear ${data.customerName},</p>
        <p>Great news! Your booking has been <strong>confirmed</strong>. We're looking forward to serving you!</p>
        ${createHighlightBox('Confirmed Booking', {
          Reference: data.bookingReference,
          Status: '✓ CONFIRMED',
        })}
        <h3 style="color: ${BRAND_COLOR}; margin: 24px 0 16px 0;">Trip Details</h3>
        ${createTwoColumnLayout(
          [
            { label: 'Route', value: routeDisplay },
            {
              label: 'Departure',
              value: `${data.departureDate} at ${data.departureTime}`,
            },
          ],
          [
            {
              label: 'Return',
              value:
                data.returnDate && data.returnTime
                  ? `${data.returnDate} at ${data.returnTime}`
                  : 'Not applicable',
            },
            { label: 'Status', value: '✓ Confirmed' },
          ],
        )}
        ${createInfoBox(
          `
          <p style="margin: 0; font-weight: 500;">📋 Note from our team:</p>
          <p style="margin: 8px 0 0 0; color: #1F2937; font-style: italic;">${data.reason}</p>
        `,
          { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
        )}
        ${createInfoBox(`<p style="margin: 0; font-weight: 500;">🚐 Driver details will be sent 1 hour before departure</p>`, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' })}
        ${data.dashboardUrl ? createButton('View My Booking', data.dashboardUrl) : ''}
        <p style="margin-top: 24px;">Thank you for choosing us!<br><strong>The ${getPlatformName(data)} Team</strong></p>
      </div>
    `;
  },

  // ─── 4. Booking rejected ──────────────────────────────────────────────────
  BOOKING_REJECTED: (data: {
    customerName: string;
    bookingReference: string;
    reason: string;
    supportEmail: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <div style="background-color: #FEE2E2; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #991B1B; margin: 0;">Booking Update</h2>
        </div>
        <p>Dear ${data.customerName},</p>
        <p>We regret to inform you that we're unable to confirm your booking <strong>${data.bookingReference}</strong> at this time.</p>
        ${createInfoBox(
          `
          <p style="margin: 0; font-weight: 500;">Reason:</p>
          <p style="margin: 8px 0 0 0;">${data.reason}</p>
        `,
          { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
        )}
        <p>Please contact our support team for assistance with alternative options:</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="mailto:${data.supportEmail}" style="display:inline-block;background-color:${BRAND_COLOR};color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">
            Contact Support
          </a>
        </p>
        <p>We apologize for any inconvenience.<br><strong>The ${getPlatformName(data)} Team</strong></p>
      </div>
    `;
  },

  // ─── 5. Booking cancelled ─────────────────────────────────────────────────
  BOOKING_CANCELLED: (data: {
    customerName: string;
    bookingReference: string;
    reason: string;
    cancelledBy: 'USER' | 'ADMIN';
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #4B5563; margin: 0;">Booking Cancelled</h2>
        </div>
        <p>Dear ${data.customerName},</p>
        <p>${data.cancelledBy === 'USER' ? `Your booking <strong>${data.bookingReference}</strong> has been cancelled as requested.` : `Your booking <strong>${data.bookingReference}</strong> has been cancelled by our team.`}</p>
        ${createInfoBox(`
          <p style="margin: 0; font-weight: 500;">Reason:</p>
          <p style="margin: 8px 0 0 0;">${data.reason}</p>
        `)}
        <p style="margin-top: 24px;">If you have any questions, please contact our support team.</p>
        <p>Best regards,<br><strong>The ${getPlatformName(data)} Team</strong></p>
      </div>
    `;
  },

  // ─── 6. NEW: Message sent (admin → customer or customer → admin) ──────────
  // Used for the booking chat feature. Works for both guests and registered users.
  NEW_BOOKING_MESSAGE: (data: {
    recipientName: string;
    bookingReference: string;
    fromLocation: string;
    toLocation: string;
    senderLabel: string; // e.g. "EVO Transport Team" or "John Doe"
    messageContent: string;
    replyUrl: string; // guest: /booking/reply?token=xxx | user: dashboard
    isGuest: boolean;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <div style="background-color: #EFF6FF; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #1E40AF; margin: 0;">💬 New Message About Your Booking</h2>
        </div>
        <p>Dear ${data.recipientName},</p>
        <p>You have a new message regarding booking <strong>${data.bookingReference}</strong> (${data.fromLocation} → ${data.toLocation}).</p>
        ${createHighlightBox('Message from ' + data.senderLabel, {
          Booking: data.bookingReference,
        })}
        <div style="background-color:#F8FAFC;border-left:4px solid ${BRAND_COLOR};padding:20px;margin:24px 0;border-radius:0 8px 8px 0;">
          <p style="margin:0;color:#1F2937;font-style:italic;line-height:1.6;">"${data.messageContent}"</p>
        </div>
        ${
          data.isGuest
            ? createInfoBox(`
          <p style="margin:0;font-weight:500;">💡 Tip for guests</p>
          <p style="margin:8px 0 0 0;color:#6B7280;">
            You can also track your booking and view all messages at any time using your reference number: <strong>${data.bookingReference}</strong>
          </p>
        `)
            : ''
        }
        <p>Best regards,<br><strong>The ${getPlatformName(data)} Team</strong></p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #E5E7EB;" />
        <p style="font-size:12px;color:#9CA3AF;text-align:center;">
          Booking: ${data.bookingReference} | Reply link expires in 7 days
        </p>
      </div>
    `;
  },

  // ─── 7. NEW: Admin notified of customer/guest reply ───────────────────────
  ADMIN_NEW_CUSTOMER_MESSAGE: (data: {
    adminName: string;
    bookingReference: string;
    customerName: string;
    customerEmail: string;
    fromLocation: string;
    toLocation: string;
    senderType: 'CUSTOMER' | 'GUEST';
    messageContent: string;
    adminUrl: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <div style="background-color: #FEF3C7; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #92400E; margin: 0;">💬 Customer Reply — Action Needed</h2>
        </div>
        <p>Hello ${data.adminName},</p>
        <p>
          ${data.senderType === 'GUEST' ? 'A <strong>guest</strong>' : 'A <strong>registered customer</strong>'} 
          has sent a message about booking <strong>${data.bookingReference}</strong>.
        </p>
        ${createHighlightBox('Message Details', {
          Booking: data.bookingReference,
          Route: `${data.fromLocation} → ${data.toLocation}`,
          From: `${data.customerName} (${data.customerEmail})`,
          Type: data.senderType,
        })}
        <div style="background-color:#F8FAFC;border-left:4px solid #F59E0B;padding:20px;margin:24px 0;border-radius:0 8px 8px 0;">
          <p style="margin:0;color:#1F2937;font-style:italic;line-height:1.6;">"${data.messageContent}"</p>
        </div>
        <div style="text-align:center;margin:32px 0;">
          <a href="${data.adminUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
            Reply in Admin Panel
          </a>
        </div>
        <p style="font-size:14px;color:#6B7280;">Please respond within 2 hours for the best customer experience.</p>
      </div>
    `;
  },

  // ─── 8. NEW: Status change notification (generic, includes reason) ─────────
  BOOKING_STATUS_UPDATED: (data: {
    customerName: string;
    bookingReference: string;
    status: string;
    reason: string;
    supportEmail: string;
    dashboardUrl?: string;
    platformName?: string;
  }): string => {
    const statusConfig: Record<
      string,
      { color: string; label: string; emoji: string }
    > = {
      CONFIRMED: { color: '#10B981', label: 'Confirmed', emoji: '✓' },
      REJECTED: { color: '#EF4444', label: 'Rejected', emoji: '✗' },
      CANCELLED: { color: '#6B7280', label: 'Cancelled', emoji: '×' },
      COMPLETED: { color: '#3B82F6', label: 'Completed', emoji: '🎉' },
      PENDING: { color: '#F59E0B', label: 'Pending', emoji: '⏳' },
    };
    const cfg = statusConfig[data.status] ?? {
      color: '#6B7280',
      label: data.status,
      emoji: '•',
    };

    return `
      <div style="color: #374151;">
        <h2 style="color: ${cfg.color}; margin-bottom: 16px;">${cfg.emoji} Booking Status Update</h2>
        <p>Dear ${data.customerName},</p>
        <p>The status of your booking <strong>${data.bookingReference}</strong> has been updated.</p>
        ${createHighlightBox('Current Status', {
          Status: `${cfg.emoji} ${cfg.label}`,
          Reference: data.bookingReference,
        })}
        ${createInfoBox(`
          <p style="margin: 0; font-weight: 500;">Reason / Note:</p>
          <p style="margin: 8px 0 0 0;">${data.reason}</p>
        `)}
        ${data.dashboardUrl ? createButton('View Booking', data.dashboardUrl) : ''}
        <p style="margin-top: 24px;">
          Questions? Contact us at <a href="mailto:${data.supportEmail}" style="color:${BRAND_COLOR};">${data.supportEmail}</a>
        </p>
        <p>Best regards,<br><strong>The ${getPlatformName(data)} Team</strong></p>
      </div>
    `;
  },

  // ─── 9. Long distance — admin notification ────────────────────────────────
  LONG_DISTANCE_REQUEST_ADMIN: (data: {
    adminName: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    userType: string;
    isRegisteredUser: string;
    isGuestUser: string;
    requestId: string;
    bookingId: string;
    fromLocation: string;
    toLocation: string;
    fromCode: string;
    toCode: string;
    fromCity: string;
    toCity: string;
    distance: string;
    isLongDistance: string;
    departureDate: string;
    departureTime: string;
    returnDate: string;
    returnTime: string;
    totalPassengers: string;
    passengerSummary: string;
    passengerList: string;
    message: string;
    adminResponseUrl: string;
    requestedAt: string;
    platformName?: string;
  }): string => {
    const routeDisplay = `${data.fromCode} → ${data.toCode} (${data.distance} km)`;
    return `
    <div style="color: #374151; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🚌 Long Distance Trip Request</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Action Required — Admin Response Needed</p>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <p>Dear ${data.adminName},</p>
        <p>A new <strong>long distance trip request</strong> (${data.distance} km) has been submitted.</p>
        ${createHighlightBox('Request Information', {
          'Request ID': data.requestId,
          'Customer Type': data.userType,
          Distance: `${data.distance} km (Over 400 km)`,
          Submitted: data.requestedAt,
        })}
        <h3 style="color: #4F46E5; margin: 30px 0 20px 0;">👤 Customer Details</h3>
        ${createTwoColumnLayout(
          [
            { label: 'Name', value: data.customerName },
            { label: 'Email', value: data.customerEmail },
          ],
          [
            { label: 'Phone', value: data.customerPhone },
            { label: 'Type', value: data.userType },
          ],
        )}
        <h3 style="color: #4F46E5; margin: 30px 0 20px 0;">📍 Trip Details</h3>
        ${createTwoColumnLayout(
          [
            { label: 'Route', value: routeDisplay },
            {
              label: 'Departure',
              value: `${data.departureDate} at ${data.departureTime}`,
            },
          ],
          [
            { label: 'Total Passengers', value: data.totalPassengers },
            {
              label: 'Return',
              value:
                data.returnDate !== 'One-way trip'
                  ? `${data.returnDate} at ${data.returnTime}`
                  : 'One-way trip',
            },
          ],
        )}
        ${
          data.message !== 'No special requests'
            ? createInfoBox(`
          <p style="margin: 0; font-weight: 500;">📝 Customer Message:</p>
          <p style="margin: 8px 0 0 0; color: #6B7280; font-style: italic;">${data.message}</p>
        `)
            : ''
        }
        <div style="text-align: center; margin: 40px 0 20px 0;">
          <a href="${data.adminResponseUrl}" style="background:#4F46E5;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;font-size:16px;">
            ⚡ Respond to Request
          </a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />
        <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
          Request ID: ${data.requestId} | Booking ID: ${data.bookingId}
        </p>
      </div>
    </div>`;
  },

  // ─── 10. Long distance — customer confirmation ────────────────────────────
  LONG_DISTANCE_REQUEST_CUSTOMER: (data: {
    customerName: string;
    requestId: string;
    fromLocation: string;
    toLocation: string;
    fromCode: string;
    toCode: string;
    distance: number;
    supportEmail: string;
    responseTime: string;
    dashboardUrl: string;
    userType: string;
    platformName?: string;
  }): string => {
    return `
    <div style="color: #374151; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">✈️ Long Distance Request Received</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">We'll get back to you within ${data.responseTime}</p>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <p>Dear ${data.customerName},</p>
        <p>Thank you for choosing <strong>${getPlatformName(data)}</strong> for your long distance journey. Our team will review it shortly.</p>
        ${createHighlightBox('Request Reference', {
          'Request ID': data.requestId,
          Status: '⏳ Pending Review',
          'Response Time': data.responseTime,
        })}
        <div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:20px;margin:20px 0;">
          <p style="margin:0;font-weight:500;color:#92400E;">📏 Long Distance Notice</p>
          <p style="margin:8px 0 0 0;color:#B45309;">Your journey is <strong>${data.distance} km</strong>. Our admin team will provide special rates and options.</p>
        </div>
        ${createTwoColumnLayout(
          [
            { label: 'From', value: data.fromLocation },
            { label: 'To', value: data.toLocation },
          ],
          [
            { label: 'Route', value: `${data.fromCode} → ${data.toCode}` },
            { label: 'Distance', value: `${data.distance} km` },
          ],
        )}
        <div style="background:#E0F2FE;border-radius:8px;padding:20px;margin:30px 0;">
          <h4 style="color:#0369A1;margin:0 0 15px 0;">⏱️ What happens next?</h4>
          <ol style="margin:0;padding-left:20px;color:#075985;">
            <li style="margin-bottom:10px;">Our admin team reviews your request</li>
            <li style="margin-bottom:10px;">We calculate special rates for your ${data.distance} km journey</li>
            <li style="margin-bottom:10px;">You'll receive a message with available options</li>
            <li>Once confirmed, we'll finalise your booking</li>
          </ol>
        </div>
        ${
          data.userType === 'registered'
            ? `<div style="text-align:center;margin:30px 0;"><a href="${data.dashboardUrl}" style="background:#4F46E5;color:white;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">📊 Track Request in Dashboard</a></div>`
            : createInfoBox(
                `<p style="margin:0;font-weight:500;">🔍 Track your request</p><p style="margin:8px 0 0 0;color:#6B7280;">Save your request ID: <strong>${data.requestId}</strong>. You can also view this request at any time on our website using your reference number.</p>`,
              )
        }
        <p style="margin-top:30px;">We appreciate your patience!<br><strong>The ${getPlatformName(data)} Team</strong></p>
        <hr style="margin:30px 0;border:none;border-top:1px solid #E5E7EB;" />
        <p style="font-size:12px;color:#9CA3AF;text-align:center;">
          Request ID: ${data.requestId} | For assistance: <a href="mailto:${data.supportEmail}" style="color:#4F46E5;">${data.supportEmail}</a>
        </p>
      </div>
    </div>`;
  },

  // ─── 11. Booking reminder ─────────────────────────────────────────────────
  BOOKING_REMINDER: (data: {
    customerName: string;
    bookingReference: string;
    fromLocation: string;
    toLocation: string;
    fromCode?: string;
    toCode?: string;
    departureDate: string;
    departureTime: string;
    driverName?: string;
    driverPhone?: string;
    vehicleInfo?: string;
    platformName?: string;
  }): string => {
    const routeDisplay =
      data.fromCode && data.toCode
        ? `${data.fromCode} → ${data.toCode}`
        : `${data.fromLocation} → ${data.toLocation}`;

    return `
      <div style="color: #374151;">
        <div style="background-color: #EFF6FF; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #1E40AF; margin: 0;">⏰ Tomorrow's Trip Reminder</h2>
        </div>
        <p>Dear ${data.customerName},</p>
        <p>This is a friendly reminder that your trip is <strong>tomorrow</strong>!</p>
        ${createHighlightBox('Trip Details', {
          Reference: data.bookingReference,
          Route: routeDisplay,
          Departure: `${data.departureDate} at ${data.departureTime}`,
        })}
        ${
          data.driverName
            ? createTwoColumnLayout(
                [
                  { label: 'Driver', value: data.driverName },
                  {
                    label: 'Vehicle',
                    value: data.vehicleInfo || 'Coming soon',
                  },
                ],
                [
                  {
                    label: 'Contact',
                    value: data.driverPhone || 'Coming soon',
                  },
                  { label: 'Status', value: 'Confirmed ✓' },
                ],
              )
            : createInfoBox(
                '<p style="margin:0;">Driver and vehicle details will be sent 1 hour before departure.</p>',
              )
        }
        <p style="margin-top: 24px;">Safe travels!<br><strong>The ${getPlatformName(data)} Team</strong></p>
      </div>
    `;
  },

  // Admin response message
  ADMIN_RESPONSE: (data: {
    customerName: string;
    bookingReference: string;
    message: string;
    supportEmail: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <h2 style="color: ${BRAND_COLOR}; margin-bottom: 16px;">Response to Your Booking</h2>
        <p>Dear ${data.customerName},</p>
        <p>Regarding your booking <strong>${data.bookingReference}</strong>:</p>
        <div style="background-color:#F3F4F6;padding:20px;border-radius:8px;margin:24px 0;border-left:4px solid ${BRAND_COLOR};">
          <p style="margin:0;font-style:italic;color:#1F2937;">"${data.message}"</p>
        </div>
        <p style="text-align:center;margin:24px 0;">
          <a href="mailto:${data.supportEmail}" style="display:inline-block;background-color:${BRAND_COLOR};color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">Reply to Support</a>
        </p>
        <p>Best regards,<br><strong>${getPlatformName(data)} Team</strong></p>
      </div>
    `;
  },
};
