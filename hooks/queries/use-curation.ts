import { useQuery } from '@tanstack/react-query';

import { fetchCurations } from '@/lib/api/test-curation';

export const curationKeys = {
  all: ['curations'] as const,
  lists: () => [...curationKeys.all, 'list'] as const,
};

export function useCurationListQuery() {
  return useQuery({
    queryKey: curationKeys.lists(),
    queryFn: fetchCurations,
  });
}
