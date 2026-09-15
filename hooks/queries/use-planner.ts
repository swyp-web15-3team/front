import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addPlannerItem, fetchPlanner } from '@/lib/api/test-planner';

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
    mutationFn: addPlannerItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plannerKeys.all });
    },
  });
}
