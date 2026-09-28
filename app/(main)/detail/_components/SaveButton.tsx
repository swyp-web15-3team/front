'use client';

import { useRouter } from 'next/navigation';

import {
  type SaveItemWhisky,
  useSaveItemModal,
} from '@/components/common/SaveItemModal';
import { rememberCurrentPath } from '@/lib/login-return';
import { useAuthStore } from '@/store/use-auth-store';

interface SaveButtonProps {
  whisky: SaveItemWhisky;
}

export function SaveButton({ whisky }: SaveButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { open: openSaveItemModal } = useSaveItemModal();

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => {
          // 로그인 후 이 페이지로 돌아와 저장 모달이 자동으로 열리게 한다.
          rememberCurrentPath(whisky);
          router.push('/login');
        }}
        className="bg-surface-inverse text-fg-on-dark text-button flex min-h-11 items-center gap-1.5 rounded-md px-4 py-2"
      >
        <BookmarkIcon filled={false} />
        로그인이 필요해요
      </button>
    );
  }

  // 어느 콜렉션에 담을지는 모달이 정한다(카드의 저장 버튼과 동일).
  return (
    <button
      type="button"
      onClick={() => openSaveItemModal(whisky)}
      className="bg-primary text-on-primary text-button flex min-h-11 items-center gap-1.5 rounded-md px-4 py-2"
    >
      <BookmarkIcon filled={false} />
      저장하기
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
