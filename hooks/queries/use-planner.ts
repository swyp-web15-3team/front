import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchPlanner, groupPlannerItems } from '@/lib/api/planner';
import {
  addPlannerItem,
  deletePlannerItem,
  updatePlannerItemListType,
} from '@/lib/api/test-planner';
import { PlannerListType, PlannerResponse } from '@/types/planner';

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
    mutationFn: (items: { saleProductId: number; quantity: number }[]) =>
      Promise.all(
        items.map(({ saleProductId, quantity }) =>
          addPlannerItem(saleProductId, quantity)
        )
      ),
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
