import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addCollectionItem,
  createCollection,
  deleteCollection,
  fetchCollectionWhiskies,
  fetchCollections,
  removeCollectionItem,
  renameCollection,
} from '@/lib/api/collection';

export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  items: () => [...collectionKeys.all, 'items'] as const,
  item: (collectionId: number) =>
    [...collectionKeys.items(), collectionId] as const,
};

export function useCollectionListQuery() {
  return useQuery({
    queryKey: collectionKeys.lists(),
    queryFn: fetchCollections,
  });
}

// 활성 컬렉션의 위스키만 조회한다. 선택된 컬렉션이 없으면(null) 요청하지 않는다.
export function useCollectionWhiskyQuery(collectionId: number | null) {
  return useQuery({
    queryKey: collectionKeys.item(collectionId ?? 0),
    queryFn: () => fetchCollectionWhiskies(collectionId as number),
    enabled: collectionId !== null,
  });
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useRenameCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      name,
    }: {
      collectionId: number;
      name: string;
    }) => renameCollection(collectionId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: number) => deleteCollection(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useAddCollectionItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      whiskyId,
    }: {
      collectionId: number;
      whiskyId: number;
    }) => addCollectionItem(collectionId, whiskyId),
    onSuccess: (_data, { collectionId }) => {
      queryClient.invalidateQueries({
        queryKey: collectionKeys.item(collectionId),
      });
    },
  });
}

export function useRemoveCollectionItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      whiskyId,
    }: {
      collectionId: number;
      whiskyId: number;
    }) => removeCollectionItem(collectionId, whiskyId),
    onSuccess: (_data, { collectionId }) => {
      queryClient.invalidateQueries({
        queryKey: collectionKeys.item(collectionId),
      });
    },
  });
}
