import { describe, expect, it } from 'vitest';

import { groupPlannerItems } from '@/lib/api/planner';
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
