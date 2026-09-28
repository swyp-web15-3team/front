import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useMeQuery,
  useUpdateMyProfileMutation,
  userKeys,
} from '@/hooks/queries/use-user';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/use-auth-store';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useMeQuery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clear();
  });

  it('로그인 상태면 응답의 data를 벗겨서 돌려준다', async () => {
    const user = { id: 1, nickname: '위스키', profileImageUrl: 'https://i/1' };
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { data: user } });
    useAuthStore.getState().setAccessToken('token');

    const { result } = renderHook(() => useMeQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(user));
  });

  // 비로그인 상태에서 요청이 나가면 401만 쌓이고 인터셉터가 /login으로 튕긴다.
  it('비로그인 상태면 요청하지 않는다', () => {
    const get = vi.spyOn(apiClient, 'get');

    renderHook(() => useMeQuery(), { wrapper });

    expect(get).not.toHaveBeenCalled();
  });
});

describe('useUpdateMyProfileMutation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clear();
  });

  // 재조회 없이 캐시를 갱신하므로, 응답이 me 캐시에 들어가야 화면이 바뀐다.
  it('수정 응답을 me 캐시에 반영한다', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const updated = {
      id: 1,
      nickname: '새이름',
      profileImageUrl: 'https://i/1',
    };
    const put = vi
      .spyOn(apiClient, 'put')
      .mockResolvedValue({ data: { data: updated } });

    const { result } = renderHook(() => useUpdateMyProfileMutation(), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    });
    result.current.mutate('  새이름  ');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // 앞뒤 공백은 떼고 보낸다.
    expect(put).toHaveBeenCalledWith('/users/me/profile', {
      nickname: '새이름',
    });
    expect(queryClient.getQueryData(userKeys.me())).toEqual(updated);
  });
});
