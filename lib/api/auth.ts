import axios from 'axios';

import { readPendingAccessToken, useAuthStore } from '@/store/use-auth-store';
import type { SignUpRequest } from '@/types/auth';

export async function logout(): Promise<void> {
  await axios.post('/api/auth/logout');
}

export async function signUp(
  payload: SignUpRequest
): Promise<{ accessToken: string }> {
  // 새로고침으로 store가 비어도 sessionStorage에 남은 토큰으로 가입을 이어간다.
  const pendingAccessToken =
    useAuthStore.getState().accessToken ?? readPendingAccessToken();
  const { data } = await axios.post<{ accessToken: string }>(
    '/api/auth/sign-up',
    payload,
    pendingAccessToken
      ? { headers: { Authorization: `Bearer ${pendingAccessToken}` } }
      : undefined
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
