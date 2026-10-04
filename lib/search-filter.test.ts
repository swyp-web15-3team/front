import { describe, expect, it } from 'vitest';

import { EMPTY_SEARCH_FILTERS, PRICE_MAX } from '@/constants/search-filter';
import {
  parseSearchFilters,
  toggleFilterOption,
  toWhiskyListParams,
  writeSearchFilters,
} from '@/lib/search-filter';
import { SearchFilters } from '@/types/search';

const categories = [
  { id: 2, name: '버번' },
  { id: 4, name: '싱글몰트' },
  { id: 9, name: '블렌디드' },
];

function withOptions(
  options: Partial<SearchFilters['options']>,
  price: SearchFilters['price'] = null
): SearchFilters {
  return {
    options: { ...EMPTY_SEARCH_FILTERS.options, ...options },
    price,
  };
}

describe('toWhiskyListParams', () => {
  it('필터가 없으면 빈 객체를 반환한다', () => {
    expect(toWhiskyListParams(EMPTY_SEARCH_FILTERS, categories)).toEqual({});
  });

  it('종류 이름을 마스터 목록 순서의 ID 배열로 바꾼다', () => {
    const filters = withOptions({ category: ['블렌디드', '버번'] });
    expect(toWhiskyListParams(filters, categories)).toEqual({
      categoryId: [2, 9],
    });
  });

  it('가격 하한 0과 슬라이더 상한은 보내지 않는다', () => {
    expect(
      toWhiskyListParams(withOptions({}, { min: 0, max: 300_000 }), categories)
    ).toEqual({ maxPrice: 300_000 });
    expect(
      toWhiskyListParams(
        withOptions({}, { min: 100_000, max: PRICE_MAX }),
        categories
      )
    ).toEqual({ minPrice: 100_000 });
  });

  it('가격 차이 단일 구간의 열린 끝은 보내지 않는다', () => {
    expect(
      toWhiskyListParams(withOptions({ priceGap: ['20% 미만'] }), categories)
    ).toEqual({ maxPriceDiffPercent: 20 });
    expect(
      toWhiskyListParams(withOptions({ priceGap: ['80% 이상'] }), categories)
    ).toEqual({ minPriceDiffPercent: 80 });
  });

  it('가격 차이 중간 구간은 최소·최대를 모두 보낸다', () => {
    expect(
      toWhiskyListParams(withOptions({ priceGap: ['40%-60%'] }), categories)
    ).toEqual({ minPriceDiffPercent: 40, maxPriceDiffPercent: 60 });
  });
});

describe('toggleFilterOption', () => {
  it('종류는 여러 개를 선택할 수 있다', () => {
    const next = toggleFilterOption(
      withOptions({ category: ['버번'] }),
      'category',
      '싱글몰트'
    );
    expect(next.options.category).toEqual(['버번', '싱글몰트']);
  });

  it('가격 차이는 새로 고르면 기존 선택을 대체한다', () => {
    const next = toggleFilterOption(
      withOptions({ priceGap: ['20% 미만'] }),
      'priceGap',
      '80% 이상'
    );
    expect(next.options.priceGap).toEqual(['80% 이상']);
  });

  it('선택된 옵션을 다시 누르면 해제된다', () => {
    const next = toggleFilterOption(
      withOptions({ priceGap: ['20% 미만'] }),
      'priceGap',
      '20% 미만'
    );
    expect(next.options.priceGap).toEqual([]);
  });
});

describe('parseSearchFilters / writeSearchFilters', () => {
  it('필터를 URL에 쓰고 다시 읽으면 같은 값이 된다', () => {
    const filters = withOptions(
      { category: ['버번', '싱글몰트'], priceGap: ['20%-40%'] },
      { min: 100_000, max: 300_000 }
    );
    const params = writeSearchFilters(new URLSearchParams('q=발베니'), filters);

    expect(params.get('q')).toBe('발베니');
    expect(params.getAll('category')).toEqual(['버번', '싱글몰트']);
    expect(parseSearchFilters(params)).toEqual(filters);
  });

  it('필터를 비우면 필터 키만 지우고 나머지 쿼리는 유지한다', () => {
    const params = writeSearchFilters(
      new URLSearchParams('q=a&sort=id,desc&category=버번&minPrice=1000'),
      EMPTY_SEARCH_FILTERS
    );
    expect(params.toString()).toBe(
      new URLSearchParams('q=a&sort=id,desc').toString()
    );
  });

  it('가격 한쪽만 있으면 나머지는 열린 끝으로 채운다', () => {
    expect(
      parseSearchFilters(new URLSearchParams('minPrice=50000')).price
    ).toEqual({ min: 50_000, max: PRICE_MAX });
    expect(
      parseSearchFilters(new URLSearchParams('maxPrice=50000')).price
    ).toEqual({ min: 0, max: 50_000 });
  });

  it('잘못된 값은 버린다', () => {
    const filters = parseSearchFilters(
      new URLSearchParams('priceGap=없는구간&minPrice=abc&maxPrice=-1')
    );
    expect(filters).toEqual(EMPTY_SEARCH_FILTERS);
    expect(
      parseSearchFilters(new URLSearchParams('minPrice=500&maxPrice=100')).price
    ).toBeNull();
  });
});
