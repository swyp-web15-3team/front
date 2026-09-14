import { useQuery } from '@tanstack/react-query';

import { fetchCollections } from '@/lib/api/test-collection';

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
