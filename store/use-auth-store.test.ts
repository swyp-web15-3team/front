import { beforeEach, describe, expect, it } from 'vitest';

import { readPendingSignUp, useAuthStore } from './use-auth-store';

describe('useAuthStore 가입 미완료 상태', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    useAuthStore.getState().clear();
  });

  it('신규 유저 표식은 sessionStorage에 남아 새로고침을 견딘다', () => {
    useAuthStore.getState().setPendingAccessToken('token-1');

    expect(readPendingSignUp()).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe('token-1');
    // 토큰이 있어도 로그인 상태로는 취급하지 않는다
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isPendingSignUp).toBe(true);
  });

  it('가입 완료 후에는 미완료 표식을 지우고 로그인 상태가 된다', () => {
    useAuthStore.getState().setPendingAccessToken('token-1');
    useAuthStore.getState().setAccessToken('token-2');

    expect(readPendingSignUp()).toBe(false);
    expect(useAuthStore.getState().isPendingSignUp).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('clear는 미완료 표식까지 정리한다', () => {
    useAuthStore.getState().setPendingAccessToken('token-1');
    useAuthStore.getState().clear();

    expect(readPendingSignUp()).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isPendingSignUp).toBe(false);
  });
});
