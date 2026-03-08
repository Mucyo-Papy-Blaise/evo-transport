import { User, UserRole, Language, Currency } from '@prisma/client';

// Create User Types
export interface CreateUserInput {
  email: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  isGuest?: boolean;
  guestSessionId?: string;
  role?: UserRole;
  preferredLanguage?: Language;
  preferredCurrency?: Currency;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  preferredLanguage?: Language;
  preferredCurrency?: Currency;
  isEmailVerified?: boolean;
  isGuest?: boolean;
}

// Repository Types
export interface FindUserOptions {
  includeSavedLocations?: boolean;
  includeBookings?: boolean;
}

export type SafeUser = Omit<
  User,
  | 'passwordHash'
  | 'emailVerificationToken'
  | 'passwordResetToken'
  | 'passwordResetExpires'
>;

// Filter Types
export interface UserFilter {
  email?: string;
  role?: UserRole;
  isGuest?: boolean;
  isActive?: boolean;
  isEmailVerified?: boolean;
}
