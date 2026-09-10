import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchProducts, ProductListParams } from '@/lib/api/test-product';

type ProductListFilters = Omit<ProductListParams, 'cursor'>;

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductListFilters) =>
    [...productKeys.lists(), filters] as const,
};

export function useProductListQuery(filters: ProductListFilters = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ pageParam }) =>
      fetchProducts({ ...filters, cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
