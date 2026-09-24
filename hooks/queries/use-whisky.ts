import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  fetchRelatedWhiskies,
  fetchWhiskyCategories,
  fetchWhiskyDetail,
  searchWhiskyCandidates,
} from '@/lib/api/test-whisky';
import { fetchWhiskies, fetchWhiskySuggestions } from '@/lib/api/whisky';
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
  candidates: (query: string) =>
    [...whiskyKeys.all, 'candidates', query] as const,
  suggestions: (query: string) =>
    [...whiskyKeys.all, 'suggestions', query] as const,
};

// 위스키 목록 검색
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

// 플래너 추가 모달의 "전체" 탭 검색
export function useWhiskyCandidateSearchQuery(query: string) {
  return useQuery({
    queryKey: whiskyKeys.candidates(query),
    queryFn: () => searchWhiskyCandidates(query),
  });
}

// 검색 모달 추천 검색어
export function useWhiskySuggestionsQuery(query: string, enabled: boolean) {
  const trimmedQuery = query.trim();

  return useQuery({
    queryKey: whiskyKeys.suggestions(trimmedQuery),
    queryFn: () =>
      fetchWhiskySuggestions(trimmedQuery ? { query: trimmedQuery } : {}),
    enabled,
  });
}
