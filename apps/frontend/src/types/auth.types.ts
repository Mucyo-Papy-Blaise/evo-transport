import { UserRole } from './enum';

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  errorCode?: number;
  data?: T;
  user?: User;
  accessToken?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  /** Backend permission codes (e.g. CREATE_BRANCH, VIEW_REPORTS) for sidebar/access */
  permissions?: string[];
}

export type AuthUser = User;

//  Login 
export interface LoginPayload {
  email: string;
  password: string;
}


export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type MeResponse = User;

//  Change password 
export interface ChangePasswordRequest {
  newPassword: string;
}


export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export function getDisplayName(user: User): string {
  return user.fullName || user.email.split('@')[0] || 'User';
}

export function getInitials(user: User): string {
  const name = getDisplayName(user);
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}