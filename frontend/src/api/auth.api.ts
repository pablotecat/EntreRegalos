import { User } from '../types';
import { api } from './client';

export interface LoginPayload { username: string; password: string; }
export interface RegisterPayload { invitationToken: string; username: string; password: string; }
export interface ResetPasswordPayload { token: string; password: string; }
export interface TokenResponse { accessToken: string; }

export const authApi = {
  login: (data: LoginPayload) => api.post<TokenResponse>('/auth/login', data),
  register: (data: RegisterPayload) => api.post<TokenResponse>('/auth/register', data),
  refresh: () => api.post<TokenResponse>('/auth/refresh'),
  logout: () => api.post<void>('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
  validateResetToken: (token: string) =>
    api.get<{ valid: true; username: string }>(`/auth/reset-password/validate?token=${token}`),
  resetPassword: (data: ResetPasswordPayload) =>
    api.post<void>('/auth/reset-password', data),
};
