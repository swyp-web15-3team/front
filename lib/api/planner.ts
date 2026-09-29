import axios from 'axios';

import { apiClient } from '@/lib/api/client';
import { ApiErrorResponse } from '@/types/common';
import {
  AddPlannerItemRequest,
  AddPlannerItemResponse,
  PlannerItem,
  PlannerItemGroup,
  PlannerListType,
  PlannerResponse,
} from '@/types/planner';
import { SaleProduct } from '@/types/whisky';

export async function fetchPlanner(): Promise<PlannerResponse['data']> {
  const { data } = await apiClient.get<PlannerResponse>('/planners');
  return data.data;
}

/**
 * 서버는 한 행 = 1병으로 내려주고 수량 필드가 없다.
 * 같은 saleProductId + listType 행들을 한 카드로 묶고, 행 수를 quantity로 쓴다.
 */
export function groupPlannerItems(items: PlannerItem[]): PlannerItemGroup[] {
  const groups = new Map<string, PlannerItemGroup>();

  for (const item of items) {
    const key = `${item.listType}:${item.saleProductId}`;
    const group = groups.get(key);

    if (group) {
      group.quantity += 1;
      group.plannerItemIds.push(item.plannerItemId);
    } else {
      groups.set(key, {
        ...item,
        quantity: 1,
        plannerItemIds: [item.plannerItemId],
      });
    }
  }

  return [...groups.values()];
}

/** 한 요청에 넣을 수 있는 상품 종류 수 */
export const ADD_PLANNER_ITEM_MAX_TYPES = 20;
/** 상품 한 종류당 병 수 */
export const ADD_PLANNER_ITEM_MAX_QUANTITY = 20;

/**
 * 한 요청에 여러 상품을 넣는다. 같은 saleProductId는 중복으로 못 넣으니
 * quantity로 합쳐서 보낸다. 멱등이 아니라서 실패 시 무조건 재시도하면 안 된다.
 */
export async function addPlannerItems(
  items: AddPlannerItemRequest['items']
): Promise<PlannerItem[]> {
  const { data } = await apiClient.post<AddPlannerItemResponse>(
    '/planners/items',
    { items } satisfies AddPlannerItemRequest
  );
  return data.data.items;
}

/** 서버가 ProblemDetail로 내려준 detail을 그대로 안내 문구로 쓴다 */
export function getPlannerErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail;
    if (detail) return detail;
  }
  return fallback;
}

/** 항목 하나 삭제. 개수 − 버튼. 그룹의 plannerItemId 아무거나 하나면 된다. */
export async function deletePlannerItem(plannerItemId: number): Promise<void> {
  await apiClient.delete(`/planners/items/${plannerItemId}`);
}

/**
 * 범위 삭제. 인자 없으면 플래너 전체 초기화, listType만 주면 그 리스트 전체,
 * saleProductId까지 주면 그 리스트의 해당 상품 전부(카드 ✕).
 */
export async function deletePlannerItems(params?: {
  listType: PlannerListType;
  saleProductId?: number;
}): Promise<void> {
  await apiClient.delete('/planners/items', { params });
}

/**
 * listType만 바꾼다. saleProductId가 있으면 그 카드의 모든 병,
 * 없으면 fromListType 전체(구매 리스트 초기화)를 옮긴다.
 */
export async function movePlannerItems(body: {
  fromListType: PlannerListType;
  toListType: PlannerListType;
  saleProductId?: number;
}): Promise<void> {
  await apiClient.patch('/planners/move', body);
}

/**
 * 목록 API는 saleProductId를 안 내려주는데 플래너 추가엔 그게 필요하다.
 * 모달은 위스키만 고르게 하고, 판매처는 여기서 자동으로 정한다(추가 후 행에서 변경 가능).
 * 품절이거나 가격 없는 판매처는 서버가 400으로 거절하므로 제외한다.
 */
export function pickCheapestSaleProduct(saleProducts: SaleProduct[]) {
  return saleProducts
    .filter((sp) => !sp.isSoldOut && sp.price !== null)
    .reduce<SaleProduct | null>((cheapest, sp) => {
      if (!cheapest) return sp;
      const a = sp.price?.amountKrw ?? sp.price?.amount ?? Infinity;
      const b = cheapest.price?.amountKrw ?? cheapest.price?.amount ?? Infinity;
      return a < b ? sp : cheapest;
    }, null);
}

/**
 * 판매처 변경. 서버에 판매처만 바꾸는 엔드포인트가 없어서
 * 기존 행을 지우고 새 saleProductId로 같은 수량/리스트에 다시 넣는다.
 * ponytail: 삭제 후 추가라 중간에 실패하면 행이 사라진다. 서버가 PATCH를 열어주면 교체한다.
 */
export async function changePlannerItemSaleProduct(params: {
  listType: PlannerListType;
  fromSaleProductId: number;
  toSaleProductId: number;
  quantity: number;
}): Promise<void> {
  const { listType, fromSaleProductId, toSaleProductId, quantity } = params;
  await deletePlannerItems({ listType, saleProductId: fromSaleProductId });
  await addPlannerItems([
    { saleProductId: toSaleProductId, quantity, listType },
  ]);
}

/**
 * 여러 상품을 한 번에 옮긴다. 서버 move는 saleProductId 하나씩만 받아서
 * 순서대로 보낸다. 중간에 실패하면 앞의 것들은 이미 옮겨진 상태로 남는다.
 * ponytail: 직렬 호출. 서버가 배열을 받아주면 한 방에 바꾼다.
 */
export async function movePlannerItemsBulk(params: {
  fromListType: PlannerListType;
  toListType: PlannerListType;
  saleProductIds: number[];
}): Promise<void> {
  const { fromListType, toListType, saleProductIds } = params;
  for (const saleProductId of saleProductIds) {
    await movePlannerItems({ fromListType, toListType, saleProductId });
  }
}
