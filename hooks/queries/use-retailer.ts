import { useQuery } from '@tanstack/react-query';

import { fetchRetailers } from '@/lib/api/test-retailer';
import { RetailerListRequest } from '@/types/retailer';

export const retailerKeys = {
  all: ['retailers'] as const,
  lists: () => [...retailerKeys.all, 'list'] as const,
  list: (filters: RetailerListRequest) =>
    [...retailerKeys.lists(), filters] as const,
};

export function useRetailerListQuery(filters: RetailerListRequest = {}) {
  return useQuery({
    queryKey: retailerKeys.list(filters),
    queryFn: () => fetchRetailers(filters),
  });
}
