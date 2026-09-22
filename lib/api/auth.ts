import axios from 'axios';

import { apiClient } from '@/lib/api/client';
import type { SignUpRequest } from '@/types/auth';

export async function logout(): Promise<void> {
  await axios.post('/api/auth/logout');
}

export async function signUp(
  payload: SignUpRequest
): Promise<{ accessToken: string }> {
  const { data } = await axios.post<{ accessToken: string }>(
    '/api/auth/sign-up',
    payload
  );
  return data;
}

export interface WithdrawRequest {
  reason: string;
}

export async function withdraw(payload: WithdrawRequest): Promise<void> {
  await apiClient.post('/api/auth/withdraw', payload, {
    baseURL: '',
  });
}
