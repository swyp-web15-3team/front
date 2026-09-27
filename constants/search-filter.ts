import { FilterGroupKey, SearchFilters } from '@/types/search';

// 종류(category)는 GET /whisky-categories 응답으로 채운다 (useSearchFilterOptions)
// TODO: 나머지 그룹도 필터 API 연동 후 서버 응답 기준으로 교체한다
export const STATIC_FILTER_OPTIONS: Record<
  Exclude<FilterGroupKey, 'category'>,
  string[]
> = {
  priceGap: ['20% 미만', '20%-40%', '40%-60%', '60%-80%', '80% 이상'],
};

export const FILTER_GROUP_LABELS: Record<FilterGroupKey, string> = {
  category: '종류',
  priceGap: '가격 차이',
};

/** 가격 슬라이더 상한. 이 값이면 "이상"(상한 없음)으로 취급한다 */
export const PRICE_MAX = 1_000_000;
export const PRICE_STEP = 10_000;

// TODO: 가격 분포 API 연동 후 교체 — 0 ~ PRICE_MAX를 균등 분할한 구간별 상품 수
export const PRICE_HISTOGRAM = [2, 5, 10, 4, 2, 4, 5, 4, 2, 4];

export const EMPTY_SEARCH_FILTERS: SearchFilters = {
  options: { category: [], priceGap: [] },
  price: null,
};
