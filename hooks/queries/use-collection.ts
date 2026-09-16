import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  addCollectionItem,
  createCollection,
  fetchCollectionItems,
  fetchCollections,
} from '@/lib/api/test-collection';

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

export function useCollectionItemQuery(collectionId: number) {
  return useQuery({
    queryKey: collectionKeys.item(collectionId),
    queryFn: () => fetchCollectionItems(collectionId),
  });
}

// 컬렉션 탭 전체 컬렉션의 아이템을 병렬 조회한다.
// 검색어와 매칭되는 위스키가 속한 컬렉션을 찾아 드롭다운을 자동으로 펼치는 데 쓰인다.
export function useCollectionItemsQueries(collectionIds: number[]) {
  return useQueries({
    queries: collectionIds.map((collectionId) => ({
      queryKey: collectionKeys.item(collectionId),
      queryFn: () => fetchCollectionItems(collectionId),
    })),
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
