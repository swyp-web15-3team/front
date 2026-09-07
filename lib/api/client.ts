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
  // TODO: 백엔드 API 확정 후 재발급 Route Handler(app/api/auth/reissue/route.ts) 연동
  throw new Error('Not implemented');
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

// ─────────────────────────────────────────────
// 사용 예시 (실제 코드 아님, 참고용 주석)
// ─────────────────────────────────────────────
//
// 1) 도메인별 API 함수 작성 — lib/api/user.ts
//
// import { apiClient } from '@/lib/api/client';
// import type { User, UserListFilters } from '@/types/user';
//
// export async function getUserList(filters: UserListFilters) {
//   const { data } = await apiClient.get<User[]>('/users', { params: filters });
//   return data;
// }
//
// export async function getUserDetail(id: string) {
//   const { data } = await apiClient.get<User>(`/users/${id}`);
//   return data;
// }
//
// 2) TanStack Query 훅 작성 — hooks/queries/use-user.ts
//
// import { useQuery } from '@tanstack/react-query';
// import { getUserDetail, getUserList } from '@/lib/api/user';
// import type { UserListFilters } from '@/types/user';
//
// export const userKeys = {
//   all: ['users'] as const,
//   lists: () => [...userKeys.all, 'list'] as const,
//   list: (filters: UserListFilters) => [...userKeys.lists(), filters] as const,
//   details: () => [...userKeys.all, 'detail'] as const,
//   detail: (id: string) => [...userKeys.details(), id] as const,
// };
//
// export function useUserListQuery(filters: UserListFilters) {
//   return useQuery({
//     queryKey: userKeys.list(filters),
//     queryFn: () => getUserList(filters),
//   });
// }
//
// export function useUserDetailQuery(id: string) {
//   return useQuery({
//     queryKey: userKeys.detail(id),
//     queryFn: () => getUserDetail(id),
//   });
// }
//
// 3) 컴포넌트에서 사용
//
// 'use client';
// function UserList() {
//   const { data, isPending, isError } = useUserListQuery({ page: 1 });
//   // ...
// }
//
// 4) 로그인/회원가입/토큰 재발급 등은 axios 직접 호출이 아니라
//    Route Handler(app/api/.../route.ts)를 경유해야 한다 (docs/CONVENTIONS.md 참고)
