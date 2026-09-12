import axios from 'axios';

export async function logout(): Promise<void> {
  await axios.post('/api/auth/logout');
}

export type WithdrawReason = 'DISSATISFIED' | 'NOT_HELPFUL' | 'ETC';

export interface WithdrawRequest {
  reason: WithdrawReason;
}

export async function withdraw(payload: WithdrawRequest): Promise<void> {
  await axios.post('/api/auth/withdraw', payload);
}
