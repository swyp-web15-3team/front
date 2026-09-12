import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  fetchRelatedWhiskies,
  fetchWhiskies,
  fetchWhiskyCategories,
  fetchWhiskyDetail,
} from '@/lib/api/test-whisky';
import { WhiskyListRequest } from '@/types/whisky';

type WhiskyListFilters = Omit<WhiskyListRequest, 'page'>;

export const whiskyKeys = {
  all: ['whiskies'] as const,
  lists: () => [...whiskyKeys.all, 'list'] as const,
  list: (filters: WhiskyListFilters) =>
    [...whiskyKeys.lists(), filters] as const,
  categories: () => [...whiskyKeys.all, 'categories'] as const,
  details: () => [...whiskyKeys.all, 'detail'] as const,
  detail: (whiskyId: number) => [...whiskyKeys.details(), whiskyId] as const,
  related: (whiskyId: number) =>
    [...whiskyKeys.detail(whiskyId), 'related'] as const,
};

export function useWhiskyListQuery(filters: WhiskyListFilters = {}) {
  return useInfiniteQuery({
    queryKey: whiskyKeys.list(filters),
    queryFn: ({ pageParam }) => fetchWhiskies({ ...filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

export function useWhiskyCategoryListQuery() {
  return useQuery({
    queryKey: whiskyKeys.categories(),
    queryFn: fetchWhiskyCategories,
  });
}

export function useWhiskyDetailQuery(whiskyId: number) {
  return useQuery({
    queryKey: whiskyKeys.detail(whiskyId),
    queryFn: () => fetchWhiskyDetail(whiskyId),
  });
}

export function useRelatedWhiskyListQuery(whiskyId: number) {
  return useQuery({
    queryKey: whiskyKeys.related(whiskyId),
    queryFn: () => fetchRelatedWhiskies(whiskyId),
  });
}
