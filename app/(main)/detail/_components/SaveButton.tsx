'use client';

import { useRouter } from 'next/navigation';

import {
  type SaveItemWhisky,
  useSaveItemModal,
} from '@/components/common/SaveItemModal';
import { Button } from '@/components/ui/Button';
import { useSavedWhiskyIds } from '@/hooks/queries/use-collection';
import { rememberCurrentPath } from '@/lib/login-return';
import { useAuthStore } from '@/store/use-auth-store';

interface SaveButtonProps {
  whisky: SaveItemWhisky;
}

export function SaveButton({ whisky }: SaveButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { open: openSaveItemModal } = useSaveItemModal();
  // TODO: 저장됨 상태 디자인이 나오면 스타일도 구분한다. 지금은 문구와 아이콘만 바꾼다.
  const isSaved = useSavedWhiskyIds().has(whisky.id);

  const handleClick = () => {
    if (isAuthenticated) {
      // 어느 콜렉션에 담을지는 모달이 정한다(카드의 저장 버튼과 동일).
      openSaveItemModal(whisky);
      return;
    }
    // 로그인 후 이 페이지로 돌아와 저장 모달이 자동으로 열리게 한다.
    rememberCurrentPath(whisky);
    router.push('/login');
  };

  return (
    <Button onClick={handleClick} fullWidth className="gap-1.5">
      {isSaved ? '컬렉션에 저장됨' : '컬렉션에 추가하기'}
      <BookmarkIcon filled={isSaved} />
    </Button>
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
      className="size-5"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
