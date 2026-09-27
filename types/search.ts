// 검색 결과 페이지 필터 (FilterBar / FilterModal / FilterChips 공용)

export type FilterGroupKey = 'category' | 'priceGap';

export interface PriceRange {
  min: number;
  max: number;
}

export interface SearchFilters {
  options: Record<FilterGroupKey, string[]>;
  /** null이면 가격 조건 없음 (전체 구간) */
  price: PriceRange | null;
}

export interface FilterChip {
  id: string;
  label: string;
  /** 이 칩을 제거했을 때의 필터 상태 */
  removed: SearchFilters;
}
