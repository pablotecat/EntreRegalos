import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { listsApi } from '../api/lists.api';
import { useCreateItem, useCreateList, useDeleteItem, useDeleteList, useMyLists } from './useLists';

vi.mock('../api/lists.api', () => ({
  listsApi: {
    findMine: vi.fn(), create: vi.fn(), delete: vi.fn(),
    createItem: vi.fn(), deleteItem: vi.fn(),
  },
}));

function setup<T>(hook: () => T) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { ...renderHook(hook, { wrapper }), client };
}

beforeEach(() => { vi.resetAllMocks(); });

describe('React Query contracts from session 2', () => {
  it('TEST-018 stores own lists under the documented key', async () => {
    vi.mocked(listsApi.findMine).mockResolvedValue([]);
    const { result, client } = setup(useMyLists);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(['lists', 'mine'])).toEqual([]);
  });

  type Mutation = { mutateAsync: (input: never) => Promise<unknown> };
  it.each([
    {
      title: 'TEST-020 create list', hook: () => useCreateList() as unknown as Mutation,
      api: listsApi.create as unknown as Mock, input: { name: 'Navidad', visibility: 'PRIVATE' },
      output: { id: 'list-1' }, key: ['lists', 'mine'],
    },
    {
      title: 'TEST-021 delete list', hook: () => useDeleteList() as unknown as Mutation,
      api: listsApi.delete as unknown as Mock, input: 'list-1', output: undefined,
      key: ['lists', 'mine'],
    },
    {
      title: 'TEST-024 create item', hook: () => useCreateItem('list-1') as unknown as Mutation,
      api: listsApi.createItem as unknown as Mock, input: { name: 'Libro' },
      output: { id: 'item-1' }, key: ['lists', 'list-1'],
    },
    {
      title: 'TEST-026 delete item', hook: () => useDeleteItem('list-1') as unknown as Mutation,
      api: listsApi.deleteItem as unknown as Mock, input: 'item-1', output: undefined,
      key: ['lists', 'list-1'],
    },
  ])('$title invalidates only after success', async ({ hook, api, input, output, key }) => {
    let resolve!: (value: unknown) => void;
    api.mockReturnValue(new Promise((done) => { resolve = done; }));
    const { result, client } = setup(hook);
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    let mutation!: Promise<unknown>;
    act(() => { mutation = result.current.mutateAsync(input as never); });
    await waitFor(() => expect(api).toHaveBeenCalledOnce());
    expect(invalidate).not.toHaveBeenCalled();
    await act(async () => {
      resolve(output);
      await mutation;
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: key });
  });
});
