import { apiClient } from '@/lib/api/client';
import type { ApiSuccessResponse } from '@/types/common';
import type { User } from '@/types/user';

/** 닉네임 최대 길이 (가입/수정 공통). */
export const NICKNAME_MAX_LENGTH = 12;

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<ApiSuccessResponse<User>>('/users/me');
  return data.data;
}

export async function updateMyProfile(nickname: string): Promise<User> {
  const { data } = await apiClient.put<ApiSuccessResponse<User>>(
    '/users/me/profile',
    { nickname: nickname.trim() }
  );
  return data.data;
}
