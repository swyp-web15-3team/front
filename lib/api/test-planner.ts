import { findCandidateBySaleProductId } from '@/lib/api/test-collection';
import {
  DeletePlannerItemsRequest,
  MovePlannerItemsRequest,
  PlannerItem,
  PlannerListType,
  PlannerResponse,
} from '@/types/planner';

const MOCK_NETWORK_DELAY_MS = 400;
let nextPlannerItemId = 100;

// 서버는 행 단위로만 내려준다(수량 필드 없음). 같은 saleProductId + listType의
// 행 개수가 프론트에서의 "수량"이다.
const MOCK_PLANNER_ITEMS: PlannerItem[] = [
  {
    plannerItemId: 10,
    listType: 'PURCHASE',
    saleProductId: 501,
    whiskyId: 101,
    whiskyName: 'Lagavulin 16',
    volumeMl: 700,
    abv: 43.0,
    retailerId: 3,
    retailerName: '나리타 면세',
    countryCode: 'JP',
    isDutyFree: true,
    productUrl: 'https://example.com/product/501',
    isSoldOut: false,
    price: {
      amount: 9800,
      currency: 'JPY',
      amountKrw: 94000,
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    exchange: {
      source: 'KOREA_EXIM',
      krwPerJpy: 9.59,
      validFrom: '2026-09-08',
      validTo: '2026-09-08',
    },
    computable: true,
  },
  {
    plannerItemId: 11,
    listType: 'CANDIDATE',
    saleProductId: 502,
    whiskyId: 102,
    whiskyName: '야마자키 12년',
    volumeMl: 700,
    abv: 43.0,
    retailerId: 4,
    retailerName: '돈키호테',
    countryCode: 'JP',
    isDutyFree: false,
    productUrl: 'https://example.com/product/502',
    isSoldOut: true,
    price: null,
    exchange: null,
    computable: false,
  },
];

// TODO: 플래너 API 연동 후 이 파일을 planner.ts로 옮기고 아래 목업 대신
// apiClient.get<PlannerResponse>('/api/v1/planners')로 교체한다.
// 반환 형태(PlannerResponse['data'])만 유지하면 훅 수정 없이 교체 가능하다.
export async function fetchPlanner(): Promise<PlannerResponse['data']> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  return { items: MOCK_PLANNER_ITEMS };
}

// TODO: 플래너 API 연동 후 apiClient.post<AddPlannerItemResponse['data']>('/api/v1/planners/items', { saleProductId, listType, quantity })로 교체한다.
// quantity만큼 같은 saleProductId + listType 행을 추가한다(서버는 행 단위로 관리).
export async function addPlannerItem(
  saleProductId: number,
  listType: PlannerListType,
  quantity: number
): Promise<PlannerItem[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  const candidate = findCandidateBySaleProductId(saleProductId);
  if (!candidate) {
    throw new Error('판매 상품을 찾을 수 없습니다.');
  }

  const newItems: PlannerItem[] = Array.from({ length: quantity }, () => ({
    plannerItemId: nextPlannerItemId++,
    listType,
    saleProductId: candidate.saleProductId,
    whiskyId: candidate.whiskyId,
    whiskyName: candidate.whiskyName,
    volumeMl: candidate.volumeMl,
    abv: null,
    retailerId: 0,
    retailerName: '',
    countryCode: 'JP',
    isDutyFree: false,
    productUrl: null,
    isSoldOut: false,
    price: candidate.price,
    exchange: null,
    computable: candidate.price !== null,
  }));
  MOCK_PLANNER_ITEMS.push(...newItems);
  return newItems;
}

// TODO: 플래너 API 연동 후 apiClient.patch('/api/v1/planners/move', body)로 교체한다.
// saleProductId가 있으면 그 상품의 모든 병만, 없으면 fromListType 전체를 옮긴다.
// 대상이 없어도 성공(204)이며, fromListType === toListType이면 400이다.
export async function movePlannerItems({
  fromListType,
  toListType,
  saleProductId,
}: MovePlannerItemsRequest): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  if (fromListType === toListType) {
    throw new Error('같은 리스트로는 이동할 수 없습니다.');
  }

  MOCK_PLANNER_ITEMS.forEach((item) => {
    if (item.listType !== fromListType) return;
    if (saleProductId !== undefined && item.saleProductId !== saleProductId) {
      return;
    }
    item.listType = toListType;
  });
}

// TODO: 플래너 API 연동 후 apiClient.delete(`/api/v1/planners/items/${plannerItemId}`)로 교체한다.
// 개수 '-' 버튼에 사용한다. 카드 그룹의 plannerItemId 아무거나 하나면 된다.
export async function deletePlannerItem(plannerItemId: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  const index = MOCK_PLANNER_ITEMS.findIndex(
    (item) => item.plannerItemId === plannerItemId
  );
  if (index === -1) {
    throw new Error('플래너 항목을 찾을 수 없습니다.');
  }
  MOCK_PLANNER_ITEMS.splice(index, 1);
}

// TODO: 플래너 API 연동 후 apiClient.delete('/api/v1/planners/items', { params })로 교체한다.
// listType 없으면 전체 초기화, listType만 있으면 그 리스트 전체, saleProductId까지
// 있으면 카드 ✕(그 리스트의 해당 상품 전부) 삭제. 대상이 없어도 성공(204)이다.
export async function deletePlannerItems({
  listType,
  saleProductId,
}: DeletePlannerItemsRequest = {}): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  for (let i = MOCK_PLANNER_ITEMS.length - 1; i >= 0; i -= 1) {
    const item = MOCK_PLANNER_ITEMS[i];
    if (listType !== undefined && item.listType !== listType) continue;
    if (saleProductId !== undefined && item.saleProductId !== saleProductId) {
      continue;
    }
    MOCK_PLANNER_ITEMS.splice(i, 1);
  }
}
