import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/lib/api/client';
import {
  changePlannerItemSaleProduct,
  deletePlannerItem,
  deletePlannerItems,
  getPlannerErrorMessage,
  groupPlannerItems,
  movePlannerItems,
  pickCheapestSaleProduct,
} from '@/lib/api/planner';
import { PlannerItem, PlannerListType } from '@/types/planner';

function makeItem(
  plannerItemId: number,
  saleProductId: number,
  listType: PlannerListType
): PlannerItem {
  return {
    plannerItemId,
    listType,
    saleProductId,
    whiskyId: 101,
    whiskyName: 'Lagavulin 16',
    volumeMl: 700,
    abv: 43,
    retailerId: 3,
    retailerName: '나리타 면세',
    countryCode: 'JP',
    isDutyFree: true,
    productUrl: null,
    isSoldOut: false,
    price: null,
    exchange: null,
    computable: false,
  };
}

describe('groupPlannerItems', () => {
  it('같은 saleProductId + listType 행을 한 카드로 묶고 행 수를 quantity로 센다', () => {
    const groups = groupPlannerItems([
      makeItem(10, 501, 'PURCHASE'),
      makeItem(11, 501, 'PURCHASE'),
      makeItem(12, 501, 'PURCHASE'),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].quantity).toBe(3);
    expect(groups[0].plannerItemIds).toEqual([10, 11, 12]);
  });

  it('saleProductId가 같아도 listType이 다르면 나눈다', () => {
    const groups = groupPlannerItems([
      makeItem(10, 501, 'PURCHASE'),
      makeItem(11, 501, 'CANDIDATE'),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.listType)).toEqual(['PURCHASE', 'CANDIDATE']);
    expect(groups.every((g) => g.quantity === 1)).toBe(true);
  });

  it('빈 배열이면 빈 배열을 반환한다', () => {
    expect(groupPlannerItems([])).toEqual([]);
  });
});

describe('getPlannerErrorMessage', () => {
  function makeAxiosError(detail?: string) {
    const error = new AxiosError('failed');
    error.response = {
      data: detail ? { detail } : {},
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    return error;
  }

  it('ProblemDetail의 detail을 그대로 쓴다', () => {
    expect(
      getPlannerErrorMessage(
        makeAxiosError('품절 상품은 추가할 수 없습니다.'),
        '기본'
      )
    ).toBe('품절 상품은 추가할 수 없습니다.');
  });

  it('detail이 없으면 기본 문구를 쓴다', () => {
    expect(getPlannerErrorMessage(makeAxiosError(), '기본')).toBe('기본');
  });

  it('axios 에러가 아니면 기본 문구를 쓴다', () => {
    expect(getPlannerErrorMessage(new Error('boom'), '기본')).toBe('기본');
  });
});

describe('플래너 항목 삭제', () => {
  const del = vi.spyOn(apiClient, 'delete').mockResolvedValue({ status: 204 });

  beforeEach(() => del.mockClear());

  it('항목 하나는 plannerItemId 경로로 지운다', async () => {
    await deletePlannerItem(10);
    expect(del).toHaveBeenCalledWith('/planners/items/10');
  });

  it('카드 ✕는 listType + saleProductId 범위 삭제다', async () => {
    await deletePlannerItems({ listType: 'CANDIDATE', saleProductId: 502 });
    expect(del).toHaveBeenCalledWith('/planners/items', {
      params: { listType: 'CANDIDATE', saleProductId: 502 },
    });
  });

  it('플래너 초기화는 쿼리 없이 호출한다', async () => {
    await deletePlannerItems();
    expect(del).toHaveBeenCalledWith('/planners/items', { params: undefined });
  });
});

describe('플래너 항목 이동', () => {
  const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({ status: 204 });

  beforeEach(() => patch.mockClear());

  it('카드 하나는 saleProductId까지 담아 보낸다', async () => {
    await movePlannerItems({
      fromListType: 'CANDIDATE',
      toListType: 'PURCHASE',
      saleProductId: 501,
    });
    expect(patch).toHaveBeenCalledWith('/planners/move', {
      fromListType: 'CANDIDATE',
      toListType: 'PURCHASE',
      saleProductId: 501,
    });
  });

  it('구매 리스트 초기화는 saleProductId 없이 PURCHASE → CANDIDATE다', async () => {
    await movePlannerItems({
      fromListType: 'PURCHASE',
      toListType: 'CANDIDATE',
    });
    expect(patch).toHaveBeenCalledWith('/planners/move', {
      fromListType: 'PURCHASE',
      toListType: 'CANDIDATE',
    });
  });
});

function makeSaleProduct(
  id: number,
  amountKrw: number | null,
  isSoldOut = false
) {
  return {
    id,
    retailerName: `판매처 ${id}`,
    countryCode: 'JP' as const,
    isDutyFree: false,
    productUrl: '',
    isSoldOut,
    price:
      amountKrw === null
        ? null
        : {
            amount: amountKrw / 10,
            currency: 'JPY' as const,
            amountKrw,
            collectedAt: '',
            stale: false,
          },
  };
}

describe('pickCheapestSaleProduct', () => {
  it('원화 기준 최저가를 고른다', () => {
    const picked = pickCheapestSaleProduct([
      makeSaleProduct(1, 20000),
      makeSaleProduct(2, 10000),
      makeSaleProduct(3, 30000),
    ]);
    expect(picked?.id).toBe(2);
  });

  // 서버가 400으로 거절하는 것들은 애초에 후보에서 뺀다
  it('품절이거나 가격 없는 판매처는 제외한다', () => {
    const picked = pickCheapestSaleProduct([
      makeSaleProduct(1, 100, true),
      makeSaleProduct(2, null),
      makeSaleProduct(3, 50000),
    ]);
    expect(picked?.id).toBe(3);
  });

  it('살 수 있는 판매처가 없으면 null이다', () => {
    expect(pickCheapestSaleProduct([makeSaleProduct(1, 100, true)])).toBeNull();
  });
});

describe('changePlannerItemSaleProduct', () => {
  // 판매처만 바꾸는 엔드포인트가 없어서 지우고 같은 수량으로 다시 넣는다
  it('기존 행을 지우고 새 판매처로 같은 수량을 다시 넣는다', async () => {
    const del = vi.spyOn(apiClient, 'delete').mockResolvedValue({ data: {} });
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { data: { items: [] } } });

    await changePlannerItemSaleProduct({
      listType: 'PURCHASE',
      fromSaleProductId: 501,
      toSaleProductId: 502,
      quantity: 3,
    });

    expect(del).toHaveBeenCalledWith('/planners/items', {
      params: { listType: 'PURCHASE', saleProductId: 501 },
    });
    expect(post).toHaveBeenCalledWith('/planners/items', {
      items: [{ saleProductId: 502, quantity: 3, listType: 'PURCHASE' }],
    });
  });
});
