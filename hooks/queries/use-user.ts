'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchMe, updateMyProfile } from '@/lib/api/user';
import { useAuthStore } from '@/store/use-auth-store';

export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

/** 로그인 상태에서만 조회한다. 로그아웃/재발급 실패로 토큰이 사라지면 QueryProvider가 캐시를 비운다. */
export function useMeQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: fetchMe,
    enabled: isAuthenticated,
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    // 응답이 갱신된 유저를 주므로 재조회 없이 캐시에 바로 반영한다.
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.me(), user);
    },
  });
}
