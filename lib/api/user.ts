import { apiClient } from '@/lib/api/client';

export interface AgreeTermsRequest {
  termsAgreed: string[];
}

export async function agreeTerms(payload: AgreeTermsRequest): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    // ponytail: 백엔드 /users/terms 미연동 상태에서 회원가입 완료 플로우를 확인하기 위한 mock 우회.
    // 백엔드 연동되면 이 분기는 삭제한다.
    return;
  }

  await apiClient.post('/users/terms', payload);
}
