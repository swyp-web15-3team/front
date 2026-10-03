import * as Sentry from '@sentry/nextjs';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { rememberCurrentPath } from '@/lib/login-return';
import { useAuthStore } from '@/store/use-auth-store';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// refresh token은 rotation이라 같은 토큰으로 두 번 보내면 늦게 간 쪽이 실패해
// 쿠키가 지워진다. 진행 중인 재발급은 호출자 모두가 같은 Promise를 공유한다.
let refreshPromise: Promise<string> | null = null;

export function reissueAccessToken(): Promise<string> {
  refreshPromise ??= axios
    .post<{ accessToken: string }>('/api/auth/refresh')
    .then(({ data }) => data.accessToken)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

function redirectToLogin() {
  useAuthStore.getState().clear();

  if (typeof window === 'undefined') return;
  // 이미 /login이면 다시 이동시키지 않는다. 로그인 페이지에서 뜬 401이
  // 또 리다이렉트를 부르면 새로고침이 무한 반복된다.
  if (window.location.pathname === '/login') return;

  // 세션이 끊겨 튕겨나가는 경우에도 로그인 후 보던 페이지로 되돌린다.
  rememberCurrentPath();

  // 인터셉터는 React 렌더 트리 밖에서 실행되어 useRouter를 쓸 수 없다
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = '/login';
}

// TODO: 공통 토스트 유틸 도입 후 교체
function showErrorToast(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(message);
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response, config } = error;
    const originalRequest = config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!response) {
      return Promise.reject(error);
    }

    const { status } = response;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // 요청이 나간 뒤 다른 경로(마운트 시 재발급 등)가 이미 새 토큰을 store에
      // 넣었다면 재발급 없이 그 토큰으로 재시도한다.
      const { accessToken: current } = useAuthStore.getState();
      let token: string;

      if (
        current &&
        originalRequest.headers.Authorization !== `Bearer ${current}`
      ) {
        token = current;
      } else {
        try {
          token = await reissueAccessToken();
          useAuthStore.getState().setAccessToken(token);
        } catch (refreshError) {
          redirectToLogin();
          return Promise.reject(refreshError);
        }
      }

      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    }

    if (status === 403) {
      showErrorToast('권한이 없습니다');
      return Promise.reject(error);
    }

    if (status >= 500) {
      Sentry.captureException(error);
      showErrorToast('일시적인 오류가 발생했습니다');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
