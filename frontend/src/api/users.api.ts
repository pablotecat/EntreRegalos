import { User } from '../types';
import { api } from './client';

export const usersApi = {
  findAll: () => api.get<User[]>('/users'),
  deactivate: (id: string) => api.patch<User>(`/users/${id}/deactivate`),
  activate: (id: string) => api.patch<User>(`/users/${id}/activate`),
};
