import axios from 'axios';
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

describe('401 -> 재발급 성공', () => {
  let unauthorizedPaths: Set<string>;
  let requestLog: string[];

  beforeEach(() => {
    useAuthStore.getState().clear();
    stubLocation('/mypage/collection');
    requestLog = [];
    // 토큰이 붙기 전 요청만 401. 재발급 후 재시도는 통과시킨다.
    unauthorizedPaths = new Set(['/collections']);

    apiClient.defaults.adapter = (config) => {
      const url = config.url ?? '';
      const hasToken = Boolean(config.headers?.Authorization);
      requestLog.push(`${url}:${hasToken ? 'token' : 'anon'}`);

      if (!hasToken && unauthorizedPaths.has(url)) {
        return Promise.reject(
          Object.assign(new Error('Unauthorized'), {
            isAxiosError: true,
            config,
            response: { status: 401, data: {}, headers: {}, config },
          })
        );
      }

      return Promise.resolve({
        data: { data: { collections: [] } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    };

    // /api/auth/refresh는 apiClient가 아니라 axios 기본 인스턴스로 나간다.
    vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'fresh-token' },
    });
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  // 재발급을 주도한 요청이 자기 콜백을 못 받아 타임아웃까지 멈추던 버그.
  it('재발급을 주도한 요청이 새 토큰으로 재시도되어 응답을 받는다', async () => {
    const response = await apiClient.get('/collections');

    expect(response.status).toBe(200);
    expect(requestLog).toEqual(['/collections:anon', '/collections:token']);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  // 동시에 401을 맞은 요청들은 재발급 한 번을 같이 기다려야 한다.
  it('동시 401은 재발급을 한 번만 하고 모두 재시도된다', async () => {
    unauthorizedPaths = new Set(['/collections', '/planners']);

    const [a, b] = await Promise.all([
      apiClient.get('/collections'),
      apiClient.get('/planners'),
    ]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  // 재발급이 실패하면 대기 중인 요청도 풀려나야 한다(타임아웃까지 매달리지 않게).
  it('재발급 실패 시 대기 중이던 요청도 즉시 reject된다', async () => {
    unauthorizedPaths = new Set(['/collections', '/planners']);
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh failed'));

    const results = await Promise.allSettled([
      apiClient.get('/collections'),
      apiClient.get('/planners'),
    ]);

    expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected']);
  });
});
