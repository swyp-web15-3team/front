import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchCurations } from '@/lib/api/curation';
import { CurationListRequest } from '@/types/whisky';

type CurationListFilters = Omit<CurationListRequest, 'page'>;

export const curationKeys = {
  all: ['curations'] as const,
  lists: () => [...curationKeys.all, 'list'] as const,
  list: (filters: CurationListFilters) =>
    [...curationKeys.lists(), filters] as const,
};

export function useCurationListQuery(filters: CurationListFilters = {}) {
  return useInfiniteQuery({
    queryKey: curationKeys.list(filters),
    queryFn: ({ pageParam }) => fetchCurations({ ...filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}
