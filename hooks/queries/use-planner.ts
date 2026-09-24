import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addPlannerItems,
  fetchPlanner,
  groupPlannerItems,
} from '@/lib/api/planner';
import {
  deletePlannerItem,
  updatePlannerItemListType,
} from '@/lib/api/test-planner';
import {
  AddPlannerItemRequest,
  PlannerListType,
  PlannerResponse,
} from '@/types/planner';

export const plannerKeys = {
  all: ['planners'] as const,
};

export function usePlannerQuery() {
  return useQuery({
    queryKey: plannerKeys.all,
    queryFn: fetchPlanner,
    // 서버가 수량을 내려주지 않으므로 화면에서 쓰는 카드 단위로 묶어준다
    select: (data) => groupPlannerItems(data.items),
  });
}

export function useAddPlannerItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    // 한 요청에 전부 담는다. 한 종류라도 실패하면 서버가 한 행도 만들지 않는다.
    mutationFn: (items: AddPlannerItemRequest['items']) =>
      addPlannerItems(items),
    // 멱등이 아니라서 자동 재시도하면 병이 늘어난다
    retry: false,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: plannerKeys.all });
    },
  });
}

export function useMovePlannerItemsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      plannerItemIds,
      listType,
    }: {
      plannerItemIds: number[];
      listType: PlannerListType;
    }) => updatePlannerItemListType(plannerItemIds, listType),
    onMutate: async ({ plannerItemIds, listType }) => {
      await queryClient.cancelQueries({ queryKey: plannerKeys.all });

      const previous = queryClient.getQueryData<PlannerResponse['data']>(
        plannerKeys.all
      );

      if (previous) {
        queryClient.setQueryData<PlannerResponse['data']>(plannerKeys.all, {
          ...previous,
          items: previous.items.map((item) =>
            plannerItemIds.includes(item.plannerItemId)
              ? { ...item, listType }
              : item
          ),
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(plannerKeys.all, context.previous);
      }
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: plannerKeys.all });
    },
  });
}

export function useDeletePlannerItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlannerItem,
    onMutate: async (plannerItemId: number) => {
      await queryClient.cancelQueries({ queryKey: plannerKeys.all });

      const previous = queryClient.getQueryData<PlannerResponse['data']>(
        plannerKeys.all
      );

      if (previous) {
        queryClient.setQueryData<PlannerResponse['data']>(plannerKeys.all, {
          ...previous,
          items: previous.items.filter(
            (item) => item.plannerItemId !== plannerItemId
          ),
        });
      }

      return { previous };
    },
    onError: (_err, _plannerItemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(plannerKeys.all, context.previous);
      }
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: plannerKeys.all });
    },
  });
}
