import { UserRole, Language, Currency } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  preferredLanguage: Language;
  preferredCurrency: Currency;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  preferredLanguage: Language;
  preferredCurrency: Currency;
  profilePicture: string | null;
  createdAt: Date;
  permissions?: string[];
}

export interface OrganizationResponse {
  id: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: UserResponse;
}