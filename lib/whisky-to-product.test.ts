import { describe, expect, it } from 'vitest';

import { whiskyToProduct } from '@/lib/utils';
import type { WhiskyListItem } from '@/types/whisky';

// GET /collections/{id}/whiskies 실제 응답 한 건. 서버가 목록/검색과 같은
// WhiskyListItem 형태로 내려주는 것을 고정해 둔다.
const SERVER_ITEM = {
  id: 1,
  name: '더 글렌그란트 12년 셰리 캐스크',
  imageUrl: 'https://cdn.example.com/a.webp',
  volumeMl: 700,
  abv: 40.0,
  category: { id: 4, name: '싱글몰트' },
  origin: null,
  region: null,
  kr: {
    amount: 80000.0,
    currency: 'KRW',
    retailerName: '위스키 오크통',
    collectedAt: '2026-09-22T11:15:45.547559Z',
    stale: false,
  },
  jp: null,
  comparison: null,
} as unknown as WhiskyListItem;

describe('whiskyToProduct', () => {
  it('서버 응답 필드를 카드 Product로 옮긴다', () => {
    expect(whiskyToProduct(SERVER_ITEM)).toEqual({
      id: 1,
      imageUrl: 'https://cdn.example.com/a.webp',
      name: '더 글렌그란트 12년 셰리 캐스크',
      originalName: '',
      discountRate: 0,
      krPrice: 80000,
      jpPrice: 0,
      jpPriceYen: 0,
      volumeMl: 700,
    });
  });

  // kr/jp/comparison은 null로 오는 경우가 흔하다.
  it('가격이 없으면 0으로 떨어뜨린다', () => {
    const product = whiskyToProduct({
      ...SERVER_ITEM,
      kr: null,
      jp: null,
    } as WhiskyListItem);

    expect(product.krPrice).toBe(0);
    expect(product.jpPrice).toBe(0);
  });

  it('comparison이 있으면 할인율로 환산한다', () => {
    const product = whiskyToProduct({
      ...SERVER_ITEM,
      comparison: {
        diffAmountKrw: 20000,
        diffRatio: 0.25,
        cheaperCountry: 'JP',
      },
    } as WhiskyListItem);

    expect(product.discountRate).toBe(-25);
  });

  it('imageUrl이 없으면 빈 문자열이다', () => {
    const product = whiskyToProduct({
      ...SERVER_ITEM,
      imageUrl: undefined,
    } as WhiskyListItem);

    expect(product.imageUrl).toBe('');
  });
});
