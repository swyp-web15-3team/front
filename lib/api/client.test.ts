import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/use-auth-store';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

const originalAdapter = apiClient.defaults.adapter;

function stubLocation(pathname: string) {
  const location = { pathname, href: `http://localhost:3000${pathname}` };
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: location,
  });
  return location;
}

describe('401 처리', () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
    // 항상 401을 주는 어댑터. 재발급(/api/auth/refresh)은 apiClient가 아닌
    // axios 기본 인스턴스로 나가므로 jsdom에서 실패하고 redirectToLogin으로 떨어진다.
    apiClient.defaults.adapter = () =>
      Promise.reject(
        Object.assign(new Error('Unauthorized'), {
          isAxiosError: true,
          config: {},
          response: { status: 401, data: {}, headers: {}, config: {} },
        })
      );
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  // 재발급까지 실패한 401이 /login에서 또 리다이렉트를 부르면 새로고침이 무한 반복된다.
  it('이미 /login이면 재발급 실패해도 다시 이동시키지 않는다', async () => {
    const location = stubLocation('/login');

    await expect(apiClient.get('/collections')).rejects.toBeDefined();

    expect(location.href).toBe('http://localhost:3000/login');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('다른 페이지에서는 재발급 실패 시 /login으로 이동한다', async () => {
    const location = stubLocation('/search');

    await expect(apiClient.get('/collections')).rejects.toBeDefined();

    expect(location.href).toBe('/login');
  });
});
