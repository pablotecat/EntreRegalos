import { Item, List } from '../types';
import { api } from './client';

export interface CreateListPayload { name: string; visibility?: 'PUBLIC' | 'PRIVATE'; }
export interface UpdateListPayload { name?: string; visibility?: 'PUBLIC' | 'PRIVATE'; }
export interface CreateItemPayload { name: string; description?: string; }
export interface UpdateItemPayload { name?: string; description?: string; }

export const listsApi = {
  findMine: () => api.get<List[]>('/lists'),
  findPublic: () => api.get<List[]>('/lists/public'),
  findByUser: (userId: string) => api.get<List[]>(`/lists/user/${userId}`),
  findById: (id: string) => api.get<List>(`/lists/${id}`),
  create: (data: CreateListPayload) => api.post<List>('/lists', data),
  update: (id: string, data: UpdateListPayload) => api.patch<List>(`/lists/${id}`, data),
  delete: (id: string) => api.delete<void>(`/lists/${id}`),

  createItem: (listId: string, data: CreateItemPayload) =>
    api.post<Item>(`/lists/${listId}/items`, data),
  updateItem: (listId: string, itemId: string, data: UpdateItemPayload) =>
    api.patch<Item>(`/lists/${listId}/items/${itemId}`, data),
  deleteItem: (listId: string, itemId: string) =>
    api.delete<void>(`/lists/${listId}/items/${itemId}`),
};
