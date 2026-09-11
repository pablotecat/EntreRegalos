import type { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { useLogout } from './useAuth';

vi.mock('../api/auth.api', () => ({ authApi: { logout: vi.fn() } }));

afterEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  useAuthStore.setState({ user: null, accessToken: null });
});

describe('TEST-007 logout state', () => {
  it.each(['success', 'error'])('clears all cached and local auth state on remote %s', async (outcome) => {
    const remoteError = new Error('remote error');
    if (outcome === 'success') vi.mocked(authApi.logout).mockResolvedValue(undefined);
    else vi.mocked(authApi.logout).mockRejectedValue(remoteError);
    const client = new QueryClient();
    client.setQueryData(['lists', 'mine'], [{ id: 'list-1' }]);
    client.setQueryData(['users'], [{ id: 'user-2' }]);
    useAuthStore.getState().setAuth({
      id: 'user-1', username: 'ana', role: 'USER', isActive: true,
      createdAt: '2026-01-01', updatedAt: '2026-01-01',
    }, 'token');
    const wrapper = ({ children }: PropsWithChildren) => (
      <MemoryRouter initialEntries={['/listas']}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </MemoryRouter>
    );
    const { result } = renderHook(useLogout, { wrapper });
    await act(async () => {
      const mutation = result.current.mutateAsync();
      if (outcome === 'success') await expect(mutation).resolves.toBeUndefined();
      else await expect(mutation).rejects.toBe(remoteError);
    });
    expect(client.getQueryCache().getAll()).toHaveLength(0);
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null });
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
