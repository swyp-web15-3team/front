'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useSaveItemModal } from '@/components/common/SaveItemModal';
import { takeLoginReturn } from '@/lib/login-return';
import { useAuthStore } from '@/store/use-auth-store';

/**
 * 로그인 전에 하려던 동작을 복귀 후 이어서 실행한다.
 * 지금은 "저장 모달 다시 열기" 하나뿐이다. 복귀 경로 이동 자체는
 * /login/callback(과 가입 완료)이 이미 처리했고, 여기선 그 뒤를 잇는다.
 */
export function LoginReturnHandler() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { open: openSaveItemModal } = useSaveItemModal();

  useEffect(() => {
    // 로그인 전이거나 아직 /login 안이면 아직 복귀한 게 아니다.
    if (!isAuthenticated) return;
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) return;

    const loginReturn = takeLoginReturn();
    if (loginReturn?.saveItem) openSaveItemModal(loginReturn.saveItem);
  }, [isAuthenticated, pathname, openSaveItemModal]);

  return null;
}
