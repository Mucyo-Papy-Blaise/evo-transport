import { AUTH_TEMPLATES } from './auth.template';
import { USER_TEMPLATES } from './user.template';
import { BOOKING_TEMPLATES } from './booking.template';

export * from './base.template';
export * from './template.utils';

// Export auth templates
export { AUTH_TEMPLATES } from './auth.template';

export const EMAIL_TEMPLATES = {
  AUTH: AUTH_TEMPLATES,
  USER: USER_TEMPLATES,
  BOOKING: BOOKING_TEMPLATES,
};

// Define the type for template categories
export type TemplateCategory = keyof typeof EMAIL_TEMPLATES;
export type AuthTemplateKey = keyof (typeof EMAIL_TEMPLATES)['AUTH'];
export type USERTemplateKey = keyof (typeof EMAIL_TEMPLATES)['USER'];
export type BOOKINGTemplateKey = keyof (typeof EMAIL_TEMPLATES)['USER'];
export type TemplateKey = AuthTemplateKey;

// Helper function to check if a template exists
export function templateExists(
  category: TemplateCategory,
  templateKey: string,
): boolean {
  return (
    EMAIL_TEMPLATES[category] !== undefined &&
    EMAIL_TEMPLATES[category][
      templateKey as keyof (typeof EMAIL_TEMPLATES)[TemplateCategory]
    ] !== undefined
  );
}

// Function to get a specific template function
export function getTemplate(
  category: TemplateCategory,
  templateKey: string,
): ((...args: unknown[]) => unknown) | null {
  if (templateExists(category, templateKey)) {
    return EMAIL_TEMPLATES[category][
      templateKey as keyof (typeof EMAIL_TEMPLATES)[TemplateCategory]
    ] as any;
  }
  return null;
}
