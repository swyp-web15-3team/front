import { STATIC_FILTER_OPTIONS } from '@/constants/search-filter';
import { useWhiskyCategoryListQuery } from '@/hooks/queries/use-whisky';
import { FilterGroupKey } from '@/types/search';

// 검색 필터 그룹별 옵션 목록. 종류는 서버 마스터 목록, 나머지는 상수
export function useSearchFilterOptions(): Record<FilterGroupKey, string[]> {
  const { data } = useWhiskyCategoryListQuery();

  return {
    ...STATIC_FILTER_OPTIONS,
    category: data?.categories.map((category) => category.name) ?? [],
  };
}
