import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addPlannerItem,
  deletePlannerItem,
  fetchPlanner,
  movePlannerItems,
} from '@/lib/api/test-planner';
import {
  MovePlannerItemsRequest,
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
  });
}

export function useAddPlannerItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      items: {
        saleProductId: number;
        listType: PlannerListType;
        quantity: number;
      }[]
    ) =>
      Promise.all(
        items.map(({ saleProductId, listType, quantity }) =>
          addPlannerItem(saleProductId, listType, quantity)
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
    mutationFn: (body: MovePlannerItemsRequest) => movePlannerItems(body),
    onMutate: async ({ fromListType, toListType, saleProductId }) => {
      await queryClient.cancelQueries({ queryKey: plannerKeys.all });

      const previous = queryClient.getQueryData<PlannerResponse['data']>(
        plannerKeys.all
      );

      if (previous) {
        queryClient.setQueryData<PlannerResponse['data']>(plannerKeys.all, {
          ...previous,
          items: previous.items.map((item) => {
            if (item.listType !== fromListType) return item;
            if (
              saleProductId !== undefined &&
              item.saleProductId !== saleProductId
            ) {
              return item;
            }
            return { ...item, listType: toListType };
          }),
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
