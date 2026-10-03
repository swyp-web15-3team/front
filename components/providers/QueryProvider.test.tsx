import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subscribeAuthInvalidation } from '@/components/providers/QueryProvider';
import { useAuthStore } from '@/store/use-auth-store';

describe('subscribeAuthInvalidation', () => {
  let queryClient: QueryClient;
  let invalidate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    useAuthStore.getState().clear();
    queryClient = new QueryClient();
    invalidate = vi
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined);
  });

  // 핵심: 재발급으로 토큰이 생기면 토큰 없이 나갔던 쿼리를 다시 조회해야 한다.
  it('로그인 상태가 되면 쿼리를 다시 조회한다', () => {
    const unsubscribe = subscribeAuthInvalidation(queryClient);

    useAuthStore.getState().setAccessToken('new-token');

    expect(invalidate).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  // 다시 조회하면 화면에 남은 로그인 전용 쿼리가 토큰 없이 나가 401 → /login으로 튕긴다.
  it('로그아웃되면 다시 조회하지 않고 이전 사용자 데이터를 지운다', () => {
    useAuthStore.getState().setAccessToken('token');
    const remove = vi.spyOn(queryClient, 'removeQueries');
    const unsubscribe = subscribeAuthInvalidation(queryClient);

    useAuthStore.getState().clear();

    expect(remove).toHaveBeenCalledTimes(1);
    expect(invalidate).not.toHaveBeenCalled();
    unsubscribe();
  });

  // 같은 사용자의 토큰만 갱신된 경우까지 리페치하면 화면이 불필요하게 깜빡인다.
  it('이미 로그인 상태에서 토큰만 갱신되면 다시 조회하지 않는다', () => {
    useAuthStore.getState().setAccessToken('old-token');
    const unsubscribe = subscribeAuthInvalidation(queryClient);

    useAuthStore.getState().setAccessToken('refreshed-token');

    expect(invalidate).not.toHaveBeenCalled();
    unsubscribe();
  });

  // 가입 미완료 토큰은 로그인 상태가 아니다.
  it('pending 토큰은 다시 조회를 유발하지 않는다', () => {
    const unsubscribe = subscribeAuthInvalidation(queryClient);

    useAuthStore.getState().setPendingAccessToken('pending-token');

    expect(invalidate).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('구독을 해제하면 더 이상 반응하지 않는다', () => {
    const unsubscribe = subscribeAuthInvalidation(queryClient);
    unsubscribe();

    useAuthStore.getState().setAccessToken('token');

    expect(invalidate).not.toHaveBeenCalled();
  });
});
