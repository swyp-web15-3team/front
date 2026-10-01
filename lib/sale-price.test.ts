import { describe, expect, it } from 'vitest';

import { findLowestPriceKrw, getSalePriceKrw } from '@/lib/sale-price';
import { SaleProduct } from '@/types/whisky';

function sale(price: SaleProduct['price']): SaleProduct {
  return {
    id: 1,
    retailerName: '돈키호테',
    countryCode: 'JP',
    isDutyFree: false,
    productUrl: '',
    isSoldOut: false,
    price,
  };
}

const base = { collectedAt: '2026-09-08T03:00:00+09:00', stale: false };

describe('getSalePriceKrw', () => {
  it('원화 가격은 그대로, 엔화 가격은 원화 환산가를 쓴다', () => {
    expect(
      getSalePriceKrw(
        sale({ ...base, amount: 50000, currency: 'KRW', amountKrw: null })
      )
    ).toBe(50000);
    expect(
      getSalePriceKrw(
        sale({ ...base, amount: 4000, currency: 'JPY', amountKrw: 36000 })
      )
    ).toBe(36000);
  });

  it('가격이 없거나 환산가가 없으면 null', () => {
    expect(getSalePriceKrw(sale(null))).toBeNull();
    expect(
      getSalePriceKrw(
        sale({ ...base, amount: 4000, currency: 'JPY', amountKrw: null })
      )
    ).toBeNull();
  });
});

describe('findLowestPriceKrw', () => {
  it('비교 가능한 가격 중 최저가를 고른다', () => {
    expect(
      findLowestPriceKrw([
        sale({ ...base, amount: 50000, currency: 'KRW', amountKrw: null }),
        sale({ ...base, amount: 4000, currency: 'JPY', amountKrw: 36000 }),
        sale(null),
      ])
    ).toBe(36000);
  });

  it('가격이 하나도 없으면 null', () => {
    expect(findLowestPriceKrw([sale(null)])).toBeNull();
    expect(findLowestPriceKrw([])).toBeNull();
  });
});
