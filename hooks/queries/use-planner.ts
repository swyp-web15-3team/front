import { useQuery } from '@tanstack/react-query';

import { fetchPlanner } from '@/lib/api/test-planner';

export const plannerKeys = {
  all: ['planners'] as const,
};

export function usePlannerQuery() {
  return useQuery({
    queryKey: plannerKeys.all,
    queryFn: fetchPlanner,
  });
}
