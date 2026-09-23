import { beforeEach, describe, expect, it } from 'vitest';

import { readPendingAccessToken, useAuthStore } from './use-auth-store';

describe('useAuthStore pending token', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    useAuthStore.getState().clear();
  });

  it('신규 유저 토큰은 sessionStorage에 남아 새로고침을 견딘다', () => {
    useAuthStore.getState().setPendingAccessToken('token-1');

    expect(readPendingAccessToken()).toBe('token-1');
    // 로그인 상태로는 취급하지 않는다
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('가입 완료 후에는 임시 토큰을 지운다', () => {
    useAuthStore.getState().setPendingAccessToken('token-1');
    useAuthStore.getState().setAccessToken('token-2');

    expect(readPendingAccessToken()).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('clear는 임시 토큰까지 정리한다', () => {
    useAuthStore.getState().setPendingAccessToken('token-1');
    useAuthStore.getState().clear();

    expect(readPendingAccessToken()).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
