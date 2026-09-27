import {
  skipToken,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  addCollectionItem,
  COPY_COLLECTION_ITEMS_MAX,
  copyCollectionItems,
  createCollection,
  deleteCollection,
  fetchCollectionItems,
  fetchCollections,
  moveCollectionItems,
  removeCollectionItems,
  renameCollection,
} from '@/lib/api/collection';

export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  items: () => [...collectionKeys.all, 'items'] as const,
  item: (collectionId: number | null) =>
    [...collectionKeys.items(), collectionId] as const,
};

export function useCollectionListQuery() {
  return useQuery({
    queryKey: collectionKeys.lists(),
    queryFn: fetchCollections,
  });
}

// 컬렉션이 아직 안 정해졌으면 null을 넘긴다. 0 같은 가짜 id로 요청이 나가면
// 서버에 없는 컬렉션을 조회하게 된다.
export function useCollectionItemQuery(collectionId: number | null) {
  return useQuery({
    queryKey: collectionKeys.item(collectionId),
    queryFn:
      collectionId === null
        ? skipToken
        : () => fetchCollectionItems(collectionId),
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
      whiskyIds,
    }: {
      collectionId: number;
      whiskyIds: number[];
    }) => removeCollectionItems(collectionId, whiskyIds),
    onSuccess: (_data, { collectionId }) => {
      queryClient.invalidateQueries({
        queryKey: collectionKeys.item(collectionId),
      });
    },
  });
}

export function useMoveCollectionItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      targetCollectionId,
      whiskyIds,
    }: {
      collectionId: number;
      targetCollectionId: number;
      whiskyIds: number[];
    }) => moveCollectionItems(collectionId, targetCollectionId, whiskyIds),
    // 출발지/도착지 둘 다 목록이 바뀐다.
    onSuccess: (_data, { collectionId, targetCollectionId }) => {
      queryClient.invalidateQueries({
        queryKey: collectionKeys.item(collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: collectionKeys.item(targetCollectionId),
      });
    },
  });
}

// 복사는 한 번에 20개까지라 그보다 많으면 나눠 보낸다. 서버가 도착 그룹의
// 중복은 알아서 건너뛰므로 재시도로 중복이 쌓이지는 않는다.
export function useCopyCollectionItemsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collectionId,
      targetCollectionId,
      whiskyIds,
    }: {
      collectionId: number;
      targetCollectionId: number;
      whiskyIds: number[];
    }) => {
      for (let i = 0; i < whiskyIds.length; i += COPY_COLLECTION_ITEMS_MAX) {
        await copyCollectionItems(
          collectionId,
          targetCollectionId,
          whiskyIds.slice(i, i + COPY_COLLECTION_ITEMS_MAX)
        );
      }
    },
    // 출발 그룹은 그대로라 도착 그룹만 다시 불러온다.
    onSuccess: (_data, { targetCollectionId }) => {
      queryClient.invalidateQueries({
        queryKey: collectionKeys.item(targetCollectionId),
      });
    },
  });
}
