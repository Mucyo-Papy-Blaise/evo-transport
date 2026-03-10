// Get platform name with environment variable fallback
export function getPlatformName(data: { platformName?: string }): string {
  return data.platformName || process.env.PLATFORM_NAME || 'EVO TRANSPORT';
}

// Get brand color with environment variable fallback
export function getBrandColor(): string {
  return process.env.BRAND_COLOR || '#078ece';
}

export const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    RWF: 'FRw',
  };

  const symbol = symbols[currency] || currency;

  if (currency === 'RWF') {
    return `${symbol} ${amount.toLocaleString()}`;
  }

  return `${symbol}${amount.toLocaleString()}`;
};

export const getStatusBadge = (status: string): string => {
  const badges: Record<string, { color: string; bg: string; text: string }> = {
    PENDING: { color: '#92400E', bg: '#FEF3C7', text: '⏳ Pending' },
    CONFIRMED: { color: '#065F46', bg: '#D1FAE5', text: '✓ Confirmed' },
    REJECTED: { color: '#991B1B', bg: '#FEE2E2', text: '✗ Rejected' },
    CANCELLED: { color: '#4B5563', bg: '#F3F4F6', text: '✕ Cancelled' },
    COMPLETED: { color: '#1E40AF', bg: '#DBEAFE', text: '✓ Completed' },
  };

  const badge = badges[status] || badges.PENDING;

  return `
    <span style="
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background-color: ${badge.bg};
      color: ${badge.color};
    ">
      ${badge.text}
    </span>
  `;
};
