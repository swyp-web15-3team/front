import { apiClient } from '@/lib/api/client';

export interface AgreeTermsRequest {
  termsAgreed: string[];
}

export async function agreeTerms(payload: AgreeTermsRequest): Promise<void> {
  await apiClient.post('/users/terms', payload);
}
