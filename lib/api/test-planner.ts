import { PlannerItem, PlannerListType } from '@/types/planner';

const MOCK_NETWORK_DELAY_MS = 400;

// 조회(GET)와 추가(POST)는 lib/api/planner.ts에서 실제 API로 연동됐다.
// 아래는 아직 스펙이 나오지 않은 이동/삭제용 목업이다.
const MOCK_PLANNER_ITEMS: PlannerItem[] = [];

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

// TODO: 스펙 확정 후 apiClient.delete(`/planners/items/${plannerItemId}`)로 교체한다.
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
