import { Invitation } from '../types';
import { api } from './client';

export const invitationsApi = {
  create: (data: { reference?: string }) => api.post<Invitation & { invitationUrl: string }>('/invitations', data),
  findAll: () => api.get<Invitation[]>('/invitations'),
  validate: (token: string) => api.get<{ valid: true }>(`/invitations/validate?token=${token}`),
};
