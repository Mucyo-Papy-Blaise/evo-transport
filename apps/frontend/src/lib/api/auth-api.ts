import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, ForgotPasswordDto, LoginPayload, LoginResponse, MeResponse, ResetPasswordDto } from '@/types';

export const authApi = {
  login: (payload: LoginPayload) => apiClient.post<LoginResponse>('/auth/login', payload),
  logout: () => apiClient.post<void>('/auth/logout', {}),
  me: () => apiClient.get<MeResponse>('/auth/me'),
  refresh: (refreshToken: string) =>
    apiClient.post<LoginResponse>('/auth/refresh', { refreshToken }),

  forgotPassword: async (data: ForgotPasswordDto): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/forgot-password', data);
    return response;
  },

  resetPassword: async (data: ResetPasswordDto): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/reset-password', {
      token: data.token,
      newPassword: data.newPassword,
    });
    return response;
  },
};
