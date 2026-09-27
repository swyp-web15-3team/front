import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addPlannerItems,
  deletePlannerItem,
  deletePlannerItems,
  fetchPlanner,
  groupPlannerItems,
  movePlannerItems,
} from '@/lib/api/planner';
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
    mutationFn: movePlannerItems,
    onMutate: async (variables: {
      fromListType: PlannerListType;
      toListType: PlannerListType;
      saleProductId?: number;
    }) => {
      const { fromListType, toListType, saleProductId } = variables;
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
            )
              return item;
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

/**
 * 범위 삭제(카드 ✕, 후보 전체 삭제, 플래너 초기화).
 * 항목 하나씩 반복 호출하는 대신 한 번에 지운다.
 */
export function useDeletePlannerItemsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlannerItems,
    onMutate: async (params?: {
      listType: PlannerListType;
      saleProductId?: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: plannerKeys.all });

      const previous = queryClient.getQueryData<PlannerResponse['data']>(
        plannerKeys.all
      );

      if (previous) {
        queryClient.setQueryData<PlannerResponse['data']>(plannerKeys.all, {
          ...previous,
          items: previous.items.filter((item) => {
            if (!params) return false;
            if (item.listType !== params.listType) return true;
            return (
              params.saleProductId !== undefined &&
              item.saleProductId !== params.saleProductId
            );
          }),
        });
      }

      return { previous };
    },
    onError: (_err, _params, context) => {
      if (context?.previous) {
        queryClient.setQueryData(plannerKeys.all, context.previous);
      }
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: plannerKeys.all });
    },
  });
}
