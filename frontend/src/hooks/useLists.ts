import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateItemPayload, CreateListPayload, listsApi, UpdateListPayload } from '../api/lists.api';

export function useMyLists() {
  return useQuery({ queryKey: ['lists', 'mine'], queryFn: listsApi.findMine });
}

export function usePublicLists() {
  return useQuery({ queryKey: ['lists', 'public'], queryFn: listsApi.findPublic });
}

export function useList(id: string) {
  return useQuery({ queryKey: ['lists', id], queryFn: () => listsApi.findById(id) });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListPayload) => listsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists', 'mine'] }),
  });
}

export function useUpdateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListPayload }) =>
      listsApi.update(id, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ['lists', 'mine'] });
      qc.invalidateQueries({ queryKey: ['lists', id] });
    },
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists', 'mine'] }),
  });
}

export function useCreateItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateItemPayload) => listsApi.createItem(listId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists', listId] }),
  });
}

export function useDeleteItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => listsApi.deleteItem(listId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists', listId] }),
  });
}
