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

const BRAND_COLOR = getBrandColor();

// Booking Email Templates for EVO Transport
export const BOOKING_TEMPLATES = {
  // Customer booking confirmation (sent immediately after booking)
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
  }): string => {
    const routeDisplay =
      data.fromCode && data.toCode
        ? `${data.fromCode} → ${data.toCode}`
        : `${data.fromLocation} → ${data.toLocation}`;

    return `
      <div style="color: #374151;">
        <h2 style="color: ${BRAND_COLOR}; margin-bottom: 16px;">Booking Request Received! 🚌</h2>
        
        <p>Dear ${data.customerName},</p>
        
        <p>
          Thank you for choosing <strong>${getPlatformName(data)}</strong>! We've received your booking request 
          and will confirm it shortly. Your booking reference is:
        </p>
        
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
        
        <p style="margin-top: 24px;">
          Need to make changes? Contact our support team.
        </p>
        
        <p style="margin-top: 24px;">
          Safe travels!<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
        
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;" />
        
        <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
          Booking Reference: ${data.bookingReference} | 
          For assistance: support@evotransport.rw
        </p>
      </div>
    `;
  },

  // Admin notification for new booking
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
        
        <p>
          A new booking has been received and requires your attention.
        </p>
        
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
          <a href="${data.adminUrl}" style="
            display: inline-block;
            background-color: ${BRAND_COLOR};
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          ">
            View & Manage Booking
          </a>
        </div>
        
        <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px;">
          <p style="margin: 0; font-weight: 500;">Quick Actions:</p>
          <div style="margin-top: 12px;">
            <a href="${data.adminUrl}/confirm" style="
              display: inline-block;
              background-color: #10B981;
              color: white;
              padding: 8px 16px;
              text-decoration: none;
              border-radius: 6px;
              margin-right: 8px;
              font-size: 14px;
            ">✓ Confirm</a>
            <a href="${data.adminUrl}/reject" style="
              display: inline-block;
              background-color: #EF4444;
              color: white;
              padding: 8px 16px;
              text-decoration: none;
              border-radius: 6px;
              margin-right: 8px;
              font-size: 14px;
            ">✗ Reject</a>
            <a href="${data.adminUrl}/respond" style="
              display: inline-block;
              background-color: #6B7280;
              color: white;
              padding: 8px 16px;
              text-decoration: none;
              border-radius: 6px;
              font-size: 14px;
            ">💬 Respond</a>
          </div>
        </div>
        
        <p style="margin-top: 24px; font-size: 14px; color: #6B7280;">
          Please respond to this booking within 24 hours.
        </p>
      </div>
    `;
  },

  // Booking confirmed (sent when admin confirms)
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
        
        <p>
          Great news! Your booking has been confirmed. We're looking forward to serving you!
        </p>
        
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
            { label: 'Status', value: 'Confirmed ✓' },
          ],
        )}
        
        ${createInfoBox(
          `
          <p style="margin: 0; font-weight: 500;">🚐 Driver details will be sent 1 hour before departure</p>
        `,
          {
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE',
          },
        )}
        
        ${data.dashboardUrl ? createButton('View My Booking', data.dashboardUrl) : ''}
        
        <p style="margin-top: 24px;">
          Thank you for choosing us!<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Booking rejected (sent when admin rejects)
  BOOKING_REJECTED: (data: {
    customerName: string;
    bookingReference: string;
    reason?: string;
    supportEmail: string;
    platformName?: string;
  }): string => {
    return `
      <div style="color: #374151;">
        <div style="background-color: #FEE2E2; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #991B1B; margin: 0;">Booking Update</h2>
        </div>
        
        <p>Dear ${data.customerName},</p>
        
        <p>
          We regret to inform you that we're unable to confirm your booking 
          <strong>${data.bookingReference}</strong> at this time.
        </p>
        
        ${
          data.reason
            ? createInfoBox(
                `
          <p style="margin: 0; font-weight: 500;">Reason:</p>
          <p style="margin: 8px 0 0 0;">${data.reason}</p>
        `,
                {
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FCA5A5',
                },
              )
            : ''
        }
        
        <p>
          Please contact our support team for assistance with alternative options:
        </p>
        
        <p style="text-align: center; margin: 24px 0;">
          <a href="mailto:${data.supportEmail}" style="
            display: inline-block;
            background-color: ${BRAND_COLOR};
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
          ">
            Contact Support
          </a>
        </p>
        
        <p>
          We apologize for any inconvenience caused.
        </p>
        
        <p>
          Best regards,<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Booking cancelled (by user or admin)
  BOOKING_CANCELLED: (data: {
    customerName: string;
    bookingReference: string;
    reason?: string;
    cancelledBy: 'USER' | 'ADMIN';
    refundStatus?: 'PENDING' | 'PROCESSED' | 'NOT_APPLICABLE';
    platformName?: string;
  }): string => {
    const isUserCancelled = data.cancelledBy === 'USER';

    return `
      <div style="color: #374151;">
        <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #4B5563; margin: 0;">Booking Cancelled</h2>
        </div>
        
        <p>Dear ${data.customerName},</p>
        
        <p>
          ${
            isUserCancelled
              ? `Your booking <strong>${data.bookingReference}</strong> has been cancelled as requested.`
              : `Booking <strong>${data.bookingReference}</strong> has been cancelled.`
          }
        </p>
        
        ${
          data.reason
            ? createInfoBox(`
          <p style="margin: 0; font-weight: 500;">Reason:</p>
          <p style="margin: 8px 0 0 0;">${data.reason}</p>
        `)
            : ''
        }
        
        ${
          data.refundStatus && data.refundStatus !== 'NOT_APPLICABLE'
            ? createInfoBox(`
          <p style="margin: 0; font-weight: 500;">Refund Status:</p>
          <p style="margin: 8px 0 0 0;">
            ${data.refundStatus === 'PENDING' ? '⏳ Refund pending processing' : '✓ Refund processed'}
          </p>
          <p style="margin: 8px 0 0 0; font-size: 14px;">
            Refunds typically take 5-7 business days to appear on your statement.
          </p>
        `)
            : ''
        }
        
        <p style="margin-top: 24px;">
          If you have any questions, please contact our support team.
        </p>
        
        <p>
          Best regards,<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Admin response to booking inquiry
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
        
        <p>
          Regarding your booking <strong>${data.bookingReference}</strong>:
        </p>
        
        <div style="
          background-color: #F3F4F6;
          padding: 20px;
          border-radius: 8px;
          margin: 24px 0;
          border-left: 4px solid ${BRAND_COLOR};
        ">
          <p style="margin: 0; font-style: italic; color: #1F2937;">
            "${data.message}"
          </p>
        </div>
        
        <p>
          If you need further assistance, please don't hesitate to reach out:
        </p>
        
        <p style="text-align: center; margin: 24px 0;">
          <a href="mailto:${data.supportEmail}" style="
            display: inline-block;
            background-color: ${BRAND_COLOR};
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 6px;
          ">
            Reply to Support
          </a>
        </p>
        
        <p>
          Best regards,<br>
          <strong>${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Booking reminder (24 hours before departure)
  BOOKING_REMINDER: (data: {
    customerName: string;
    bookingReference: string;
    fromLocation: string;
    toLocation: string;
    fromCode?: string;
    toCode?: string;
    departureDate: string;
    departureTime: string;
    pickupAddress?: string;
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
        
        <p>
          This is a friendly reminder that your trip is tomorrow!
        </p>
        
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
                    value: data.vehicleInfo || 'Information coming soon',
                  },
                ],
                [
                  {
                    label: 'Contact',
                    value: data.driverPhone || 'Will be shared shortly',
                  },
                  {
                    label: 'Pickup',
                    value:
                      data.pickupAddress || 'Check your booking for details',
                  },
                ],
              )
            : createInfoBox(`
          <p style="margin: 0;">
            Driver and vehicle details will be sent to you 1 hour before departure.
          </p>
        `)
        }
        
        <p style="margin-top: 24px;">
          Thank you for choosing ${getPlatformName(data)}!
        </p>
        
        <p>
          Safe travels!<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },

  // Booking status update (general)
  BOOKING_STATUS_UPDATED: (data: {
    customerName: string;
    bookingReference: string;
    status: string;
    reason?: string;
    supportEmail: string;
    platformName?: string;
  }): string => {
    const statusColors: Record<string, string> = {
      CONFIRMED: '#10B981',
      REJECTED: '#EF4444',
      CANCELLED: '#6B7280',
      COMPLETED: '#3B82F6',
      PENDING: '#F59E0B',
    };

    const color = statusColors[data.status] || '#6B7280';

    return `
      <div style="color: #374151;">
        <h2 style="color: ${color}; margin-bottom: 16px;">Booking Status Update</h2>
        
        <p>Dear ${data.customerName},</p>
        
        <p>
          The status of your booking <strong>${data.bookingReference}</strong> has been updated.
        </p>
        
        ${createHighlightBox('Current Status', {
          Status: data.status,
          Reference: data.bookingReference,
        })}
        
        ${
          data.reason
            ? createInfoBox(`
          <p style="margin: 0; font-weight: 500;">Update details:</p>
          <p style="margin: 8px 0 0 0;">${data.reason}</p>
        `)
            : ''
        }
        
        <p style="margin-top: 24px;">
          If you have any questions, please contact our support team at 
          <a href="mailto:${data.supportEmail}" style="color: ${BRAND_COLOR};">${data.supportEmail}</a>
        </p>
        
        <p>
          Best regards,<br>
          <strong>The ${getPlatformName(data)} Team</strong>
        </p>
      </div>
    `;
  },
};
