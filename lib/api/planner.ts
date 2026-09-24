import { apiClient } from '@/lib/api/client';
import {
  PlannerItem,
  PlannerItemGroup,
  PlannerResponse,
} from '@/types/planner';

export async function fetchPlanner(): Promise<PlannerResponse['data']> {
  const { data } = await apiClient.get<PlannerResponse>('/api/v1/planners');
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
