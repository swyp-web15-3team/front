import { FilterGroupKey, SearchFilters } from '@/types/search';

/**
 * 가격 차이 옵션별 일본 할인율(%) 구간. min은 포함, max는 미포함.
 * 서버가 구간을 하나만 받으므로 가격 차이는 단일 선택이다 (SINGLE_SELECT_GROUPS)
 */
export const PRICE_GAP_RANGES: Record<string, { min?: number; max?: number }> =
  {
    '20% 미만': { max: 20 },
    '20%-40%': { min: 20, max: 40 },
    '40%-60%': { min: 40, max: 60 },
    '60%-80%': { min: 60, max: 80 },
    '80% 이상': { min: 80 },
  };

// 종류(category)는 GET /whisky-categories 응답으로 채운다 (useSearchFilterOptions)
export const STATIC_FILTER_OPTIONS: Record<
  Exclude<FilterGroupKey, 'category'>,
  string[]
> = {
  priceGap: Object.keys(PRICE_GAP_RANGES),
};

/** 새 옵션을 고르면 기존 선택을 대체하는 그룹 */
export const SINGLE_SELECT_GROUPS: FilterGroupKey[] = ['priceGap'];

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
