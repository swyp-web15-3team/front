import axios from 'axios';

import { readPendingAccessToken, useAuthStore } from '@/store/use-auth-store';
import type { SignUpRequest } from '@/types/auth';

export async function logout(): Promise<void> {
  await axios.post('/api/auth/logout');
}

/**
 * 가입 후 쓸 accessToken을 돌려준다.
 * 서버가 가입 응답으로 새 토큰을 주면 그걸 쓰고, 아직 안 주면(204)
 * 카카오 로그인 때 받아둔 pending 토큰을 그대로 승격시킨다.
 */
export async function signUp(payload: SignUpRequest): Promise<string> {
  // 새로고침으로 store가 비어도 sessionStorage에 남은 토큰으로 가입을 이어간다.
  const pendingAccessToken =
    useAuthStore.getState().accessToken ?? readPendingAccessToken();

  // 토큰 없이 가입을 보내면 백엔드가 누구인지 알 수 없다. 보내기 전에 끊는다.
  if (!pendingAccessToken) {
    throw new Error(
      '가입에 사용할 accessToken이 없습니다. 다시 로그인해 주세요.'
    );
  }

  const { data } = await axios.post<{ accessToken?: string } | null>(
    '/api/auth/sign-up',
    payload,
    { headers: { Authorization: `Bearer ${pendingAccessToken}` } }
  );

  return data?.accessToken ?? pendingAccessToken;
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
