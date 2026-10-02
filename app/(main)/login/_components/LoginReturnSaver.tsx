'use client';

import { useEffect } from 'react';

import { saveLoginReturn } from '@/lib/login-return';

interface LoginReturnSaverProps {
  next?: string;
}

/**
 * proxy가 서버에서 /login?next=...로 보낸 경우, 클라이언트 리다이렉트
 * (redirectToLogin)와 같은 복귀 지점 저장소에 경로를 심는다.
 * 값 검증(자체 출처 경로인지)은 읽는 쪽 parseLoginReturn이 한다.
 */
export function LoginReturnSaver({ next }: LoginReturnSaverProps) {
  useEffect(() => {
    if (next) saveLoginReturn({ path: next });
  }, [next]);

  return null;
}
