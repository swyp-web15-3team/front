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

let isRefreshing = false;
// null이면 재발급 실패. 대기 중인 요청을 풀어주는 신호로 쓴다.
let refreshSubscribers: Array<(accessToken: string | null) => void> = [];

function subscribeTokenRefresh(callback: (accessToken: string | null) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(accessToken: string | null) {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
}

export async function reissueAccessToken(): Promise<string> {
  const { data } = await axios.post<{ accessToken: string }>(
    '/api/auth/refresh'
  );
  return data.accessToken;
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

      // 재발급이 이미 돌고 있으면 그게 끝나기를 기다렸다가 새 토큰으로 재시도한다.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newAccessToken) => {
            if (newAccessToken === null) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      // 재발급을 주도하는 요청. 대기자들에게 알린 뒤 자기 요청도 직접 재시도한다.
      // (onTokenRefreshed 시점엔 자신은 아직 구독 전이라, 구독으로 기다리면
      //  자기 콜백을 영영 못 받고 타임아웃까지 멈춘다.)
      isRefreshing = true;

      let newAccessToken: string;
      try {
        newAccessToken = await reissueAccessToken();
        useAuthStore.getState().setAccessToken(newAccessToken);
      } catch (refreshError) {
        // 대기 중인 요청들도 같이 풀어줘야 타임아웃까지 매달리지 않는다.
        onTokenRefreshed(null);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }

      onTokenRefreshed(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
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
