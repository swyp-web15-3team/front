import { PRICE_MAX } from '@/constants/search-filter';
import {
  FilterChip,
  FilterGroupKey,
  PriceRange,
  SearchFilters,
} from '@/types/search';

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
    : [...current, option];
  return { ...filters, options: { ...filters.options, [group]: next } };
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
