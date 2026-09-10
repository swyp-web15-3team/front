import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { useProductListQuery } from '@/hooks/queries/use-product';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useProductListQuery', () => {
  it('첫 페이지를 불러온다', async () => {
    const { result } = renderHook(() => useProductListQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.data?.pages[0].items.length).toBeGreaterThan(0);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('fetchNextPage를 호출하면 다음 페이지가 누적된다', async () => {
    const { result } = renderHook(() => useProductListQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const firstPageItemCount = result.current.data!.pages[0].items.length;

    result.current.fetchNextPage();

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    const allItems = result.current.data!.pages.flatMap((page) => page.items);
    expect(allItems.length).toBeGreaterThan(firstPageItemCount);
  });

  it('마지막 페이지까지 불러오면 hasNextPage가 false가 된다', async () => {
    const { result } = renderHook(
      () => useProductListQuery({ pageSize: 300 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(false);
  });
});
