import {
  PRICE_GAP_RANGES,
  PRICE_MAX,
  SINGLE_SELECT_GROUPS,
} from '@/constants/search-filter';
import {
  FilterChip,
  FilterGroupKey,
  PriceRange,
  SearchFilters,
} from '@/types/search';
import { WhiskyCategory, WhiskyListRequest } from '@/types/whisky';

export function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function formatPriceRange({ min, max }: PriceRange) {
  const maxLabel =
    max >= PRICE_MAX ? `${formatWon(PRICE_MAX)}+` : formatWon(max);
  return `${formatWon(min)}-${maxLabel}`;
}

/** 전체 구간이면 null로 정규화한다 */
export function normalizePriceRange(range: PriceRange): PriceRange | null {
  return range.min <= 0 && range.max >= PRICE_MAX ? null : range;
}

export function toggleFilterOption(
  filters: SearchFilters,
  group: FilterGroupKey,
  option: string
): SearchFilters {
  const current = filters.options[group];
  const next = current.includes(option)
    ? current.filter((value) => value !== option)
    : SINGLE_SELECT_GROUPS.includes(group)
      ? [option]
      : [...current, option];
  return { ...filters, options: { ...filters.options, [group]: next } };
}

type WhiskyListFilterParams = Pick<
  WhiskyListRequest,
  | 'categoryId'
  | 'minPrice'
  | 'maxPrice'
  | 'minPriceDiffPercent'
  | 'maxPriceDiffPercent'
>;

/** 화면 필터 상태를 GET /whiskies 쿼리 파라미터로 바꾼다. 조건 없는 값은 넣지 않는다 */
export function toWhiskyListParams(
  filters: SearchFilters,
  categories: WhiskyCategory[]
): WhiskyListFilterParams {
  const params: WhiskyListFilterParams = {};

  // 필터는 종류 이름으로 저장되므로 ID로 바꾼다.
  // 마스터 목록 순서를 따라 선택 순서가 달라도 같은 쿼리 키가 되게 한다
  const categoryIds = categories
    .filter(({ name }) => filters.options.category.includes(name))
    .map(({ id }) => id);
  if (categoryIds.length > 0) params.categoryId = categoryIds;

  if (filters.price) {
    if (filters.price.min > 0) params.minPrice = filters.price.min;
    // 슬라이더 상한이면 "이상"이므로 maxPrice를 보내지 않는다
    if (filters.price.max < PRICE_MAX) params.maxPrice = filters.price.max;
  }

  // 가격 차이는 단일 선택이라 첫 번째 값만 본다
  const gap = PRICE_GAP_RANGES[filters.options.priceGap[0]];
  if (gap?.min !== undefined) params.minPriceDiffPercent = gap.min;
  if (gap?.max !== undefined) params.maxPriceDiffPercent = gap.max;

  return params;
}

export function getFilterChips(filters: SearchFilters): FilterChip[] {
  const optionChips = (
    Object.keys(filters.options) as FilterGroupKey[]
  ).flatMap((group) =>
    filters.options[group].map((value) => ({
      id: `${group}:${value}`,
      label: value,
      removed: toggleFilterOption(filters, group, value),
    }))
  );

  const priceChip = filters.price
    ? [
        {
          id: 'price',
          label: formatPriceRange(filters.price),
          removed: { ...filters, price: null },
        },
      ]
    : [];

  return [...optionChips, ...priceChip];
}

export function isSameFilters(a: SearchFilters, b: SearchFilters) {
  return JSON.stringify(a) === JSON.stringify(b);
}
