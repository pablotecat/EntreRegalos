import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Item, List } from '../types';
import { authApi } from './auth.api';
import { invitationsApi } from './invitations.api';
import { listsApi } from './lists.api';

const fetchMock = vi.fn();
const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1';
const list: List = {
  id: 'list-028', name: 'Regalos', visibility: 'PUBLIC', ownerId: 'user-029',
  owner: { id: 'user-029', username: 'amigo' }, _count: { items: 0 },
  createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z',
};
const item: Item = {
  id: 'item-030', listId: list.id, name: 'Libro', description: 'Edicion original', order: 0,
  createdAt: list.createdAt, updatedAt: list.updatedAt,
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('contratos del consumidor con wrappers y cliente HTTP reales', () => {
  it.each([
    {
      title: 'TEST-017 refresh devuelve accessToken sin enviar body',
      invoke: () => authApi.refresh(), path: '/auth/refresh', method: 'POST',
      response: { accessToken: 'renewed-access-token' },
    },
    {
      title: 'TEST-028 findPublic devuelve List[]',
      invoke: () => listsApi.findPublic(), path: '/lists/public', method: 'GET', response: [list],
    },
    {
      title: 'TEST-028 findPublic admite una coleccion vacia',
      invoke: () => listsApi.findPublic(), path: '/lists/public', method: 'GET', response: [],
    },
    {
      title: 'TEST-029 findByUser transmite el userId y devuelve List[]',
      invoke: () => listsApi.findByUser('user-029'), path: '/lists/user/user-029', method: 'GET', response: [list],
    },
    {
      title: 'TEST-029 findByUser admite otro userId sin listas',
      invoke: () => listsApi.findByUser('user-empty'), path: '/lists/user/user-empty', method: 'GET', response: [],
    },
    {
      title: 'TEST-039 validate transmite el token y devuelve valid true',
      invoke: () => invitationsApi.validate('invitation-039'),
      path: '/invitations/validate?token=invitation-039', method: 'GET', response: { valid: true },
    },
  ])('$title', async ({ invoke, path, method, response }) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));

    await expect(invoke()).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${baseURL}${path}`);
    expect(options.method ?? 'GET').toBe(method);
    expect(options.body).toBeUndefined();
  });

  it.each([
    {
      title: 'TEST-030 update lista solo nombre',
      changes: { name: 'Regalos actualizados' }, path: `/lists/${list.id}`, original: list,
      invoke: () => listsApi.update(list.id, { name: 'Regalos actualizados' }),
    },
    {
      title: 'TEST-030 update lista solo visibilidad',
      changes: { visibility: 'PRIVATE' }, path: `/lists/${list.id}`, original: list,
      invoke: () => listsApi.update(list.id, { visibility: 'PRIVATE' }),
    },
    {
      title: 'TEST-030 update lista nombre y visibilidad',
      changes: { name: 'Regalos actualizados', visibility: 'PRIVATE' }, path: `/lists/${list.id}`, original: list,
      invoke: () => listsApi.update(list.id, { name: 'Regalos actualizados', visibility: 'PRIVATE' }),
    },
    {
      title: 'TEST-030 updateItem solo nombre',
      changes: { name: 'Libro actualizado' }, path: `/lists/${list.id}/items/${item.id}`, original: item,
      invoke: () => listsApi.updateItem(list.id, item.id, { name: 'Libro actualizado' }),
    },
    {
      title: 'TEST-030 updateItem solo descripcion',
      changes: { description: 'Nueva edicion' }, path: `/lists/${list.id}/items/${item.id}`, original: item,
      invoke: () => listsApi.updateItem(list.id, item.id, { description: 'Nueva edicion' }),
    },
    {
      title: 'TEST-030 updateItem nombre y descripcion',
      changes: { name: 'Libro actualizado', description: 'Nueva edicion' },
      path: `/lists/${list.id}/items/${item.id}`, original: item,
      invoke: () => listsApi.updateItem(list.id, item.id, { name: 'Libro actualizado', description: 'Nueva edicion' }),
    },
  ])('$title transmite solo los cambios y devuelve la entidad', async ({ invoke, changes, path, original }) => {
    const response = { ...original, ...changes, updatedAt: '2026-09-02T10:00:00.000Z' };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));

    await expect(invoke()).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${baseURL}${path}`);
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual(changes);
  });

  it('TEST-039 validate propaga el rechazo de una invitacion consumida', async () => {
    const error = { statusCode: 410, message: 'La invitacion ha expirado o ya ha sido utilizada', error: 'Gone' };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(error), { status: 410 }));

    await expect(invitationsApi.validate('used-invitation-039')).rejects.toEqual(error);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${baseURL}/invitations/validate?token=used-invitation-039`);
    expect(options.method ?? 'GET').toBe('GET');
    expect(options.body).toBeUndefined();
  });
});
