import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCopyCollectionItemsMutation } from '@/hooks/queries/use-collection';
import { apiClient } from '@/lib/api/client';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCopyCollectionItemsMutation', () => {
  beforeEach(() => vi.restoreAllMocks());

  // 서버가 한 번에 20개까지만 받는다. 그보다 많으면 나눠 보내야 한다.
  it('20개를 넘으면 20개씩 끊어서 요청한다', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: '' });
    const whiskyIds = Array.from({ length: 45 }, (_, i) => i + 1);

    const { result } = renderHook(() => useCopyCollectionItemsMutation(), {
      wrapper,
    });
    result.current.mutate({
      collectionId: 3,
      targetCollectionId: 7,
      whiskyIds,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(post).toHaveBeenCalledTimes(3);
    // 마지막 조각은 5개만 남는다. 전체가 빠짐없이 나가야 한다.
    const bodies = post.mock.calls.map(
      (call) => call[1] as { whiskyIds: number[] }
    );
    expect(bodies.flatMap((body) => body.whiskyIds)).toEqual(whiskyIds);
    expect(bodies.map((body) => body.whiskyIds.length)).toEqual([20, 20, 5]);
  });

  it('20개 이하면 한 번만 요청한다', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: '' });

    const { result } = renderHook(() => useCopyCollectionItemsMutation(), {
      wrapper,
    });
    result.current.mutate({
      collectionId: 3,
      targetCollectionId: 7,
      whiskyIds: [1, 2, 3],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(post).toHaveBeenCalledTimes(1);
  });
});
