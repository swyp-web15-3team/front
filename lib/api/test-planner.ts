import { findCandidateBySaleProductId } from '@/lib/api/test-collection';
import { PlannerItem, PlannerListType } from '@/types/planner';

const MOCK_NETWORK_DELAY_MS = 400;
let nextPlannerItemId = 100;

// GET /api/v1/planners는 lib/api/planner.ts에서 실제 API로 연동됐다.
// 아래는 아직 스펙이 나오지 않은 추가/이동/삭제용 목업이다.
// 서버는 수량 필드를 내려주지 않는다. 한 행 = 1병이고, 수량은 같은
// saleProductId + listType 행의 개수다.
const MOCK_PLANNER_ITEMS: PlannerItem[] = [];

// TODO: 스펙 확정 후 apiClient.post('/api/v1/planners/items', { saleProductId, quantity })로 교체한다.
// 수량만큼 행을 만든다.
export async function addPlannerItem(
  saleProductId: number,
  quantity: number
): Promise<PlannerItem[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  const candidate = findCandidateBySaleProductId(saleProductId);
  if (!candidate) {
    throw new Error('판매 상품을 찾을 수 없습니다.');
  }

  const added = Array.from({ length: quantity }, () => ({
    plannerItemId: nextPlannerItemId++,
    listType: 'CANDIDATE' as PlannerListType,
    saleProductId: candidate.saleProductId,
    whiskyId: candidate.whiskyId,
    whiskyName: candidate.whiskyName,
    volumeMl: candidate.volumeMl,
    abv: null,
    retailerId: 0,
    retailerName: '',
    countryCode: 'JP' as const,
    isDutyFree: false,
    productUrl: null,
    isSoldOut: false,
    price: candidate.price,
    exchange: null,
    computable: candidate.price !== null,
  }));

  MOCK_PLANNER_ITEMS.push(...added);
  return added;
}

// TODO: 스펙 확정 후 구매/후보 이동 API로 교체한다.
export async function updatePlannerItemListType(
  plannerItemIds: number[],
  listType: PlannerListType
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  for (const item of MOCK_PLANNER_ITEMS) {
    if (plannerItemIds.includes(item.plannerItemId)) {
      item.listType = listType;
    }
  }
}

// TODO: 스펙 확정 후 apiClient.delete(`/api/v1/planners/items/${plannerItemId}`)로 교체한다.
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
