import axios from 'axios';

import { reissueAccessToken } from '@/lib/api/client';
import { useAuthStore } from '@/store/use-auth-store';
import type { SignUpRequest } from '@/types/auth';

export async function logout(): Promise<void> {
  await axios.post('/api/auth/logout');
}

export async function signUp(
  payload: SignUpRequest
): Promise<{ accessToken: string }> {
  // 새로고침으로 store가 비어도 refreshToken 쿠키로 토큰을 되살려 가입을 이어간다.
  const accessToken =
    useAuthStore.getState().accessToken ?? (await reissueAccessToken());
  const { data } = await axios.post<{ accessToken: string }>(
    '/api/auth/sign-up',
    payload,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
}

export interface WithdrawRequest {
  reason: string;
}

export async function withdraw(payload: WithdrawRequest): Promise<void> {
  const { accessToken } = useAuthStore.getState();
  await axios.post(
    '/api/auth/withdraw',
    payload,
    accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined
  );
}
