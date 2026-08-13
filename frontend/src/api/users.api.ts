import { User } from '../types';
import { api } from './client';

export interface PasswordResetToken {
  id: string;
  token: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
  userId: string;
  user: { id: string; username: string };
  resetUrl: string;
}

export const usersApi = {
  findAll: () => api.get<User[]>('/users'),
  findPasswordResetTokens: () => api.get<PasswordResetToken[]>('/users/password-reset-tokens'),
  deactivate: (id: string) => api.patch<User>(`/users/${id}/deactivate`),
  activate: (id: string) => api.patch<User>(`/users/${id}/activate`),
  createPasswordResetToken: (id: string) =>
    api.post<{ token: string; resetUrl: string }>(`/users/${id}/reset-password`),
};
