import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addCollectionItem,
  createCollection,
  fetchCollections,
} from '@/lib/api/test-collection';

export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
};

export function useCollectionListQuery() {
  return useQuery({
    queryKey: collectionKeys.lists(),
    queryFn: fetchCollections,
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

export function useAddCollectionItemMutation() {
  return useMutation({
    mutationFn: ({
      collectionId,
      whiskyId,
    }: {
      collectionId: number;
      whiskyId: number;
    }) => addCollectionItem(collectionId, whiskyId),
  });
}
