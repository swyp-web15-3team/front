import * as Sentry from '@sentry/nextjs';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

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
let refreshSubscribers: Array<(accessToken: string) => void> = [];

function subscribeTokenRefresh(callback: (accessToken: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(accessToken: string) {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
}

async function reissueAccessToken(): Promise<string> {
  const { data } = await axios.post<{ accessToken: string }>(
    '/api/auth/refresh'
  );
  return data.accessToken;
}

function redirectToLogin() {
  useAuthStore.getState().clear();

  if (typeof window !== 'undefined') {
    // 인터셉터는 React 렌더 트리 밖에서 실행되어 useRouter를 쓸 수 없다
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login';
  }
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

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newAccessToken = await reissueAccessToken();
          useAuthStore.getState().setAccessToken(newAccessToken);
          onTokenRefreshed(newAccessToken);
        } catch (refreshError) {
          redirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(apiClient(originalRequest));
        });
      });
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
