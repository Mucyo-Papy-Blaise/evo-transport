// Get platform name with environment variable fallback
export function getPlatformName(data: { platformName?: string }): string {
  return data.platformName || process.env.PLATFORM_NAME || 'EIG CAPITALSUITE';
}

// Get brand color with environment variable fallback
export function getBrandColor(): string {
  return process.env.BRAND_COLOR || '#078ece';
}
