'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  type SaveItemWhisky,
  useSaveItemModal,
} from '@/components/common/SaveItemModal';
import { Button } from '@/components/ui/Button';
import { useSavedWhiskyIds } from '@/hooks/queries/use-collection';
import { rememberCurrentPath } from '@/lib/login-return';
import { cn } from '@/lib/utils';
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
  const [prevIsSaved, setPrevIsSaved] = useState(isSaved);
  // 저장 여부는 콜렉션 목록이 늦게 도착하면 false → true로 바뀐다. 진입 시 이런 변화에는
  // 아이콘을 튕기지 않도록, 이 버튼으로 저장 모달을 연 뒤 저장됐을 때만 재생한다
  const [hasRequestedSave, setHasRequestedSave] = useState(false);
  const [isPopping, setIsPopping] = useState(false);

  // 렌더 중 state 조정 패턴
  if (isSaved !== prevIsSaved) {
    setPrevIsSaved(isSaved);
    if (isSaved && hasRequestedSave) {
      setIsPopping(true);
      setHasRequestedSave(false);
    }
  }

  const handleClick = () => {
    if (isAuthenticated) {
      setHasRequestedSave(true);
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
      <BookmarkIcon
        filled={isSaved}
        className={cn(isPopping && 'animate-pop')}
        onAnimationEnd={() => setIsPopping(false)}
      />
    </Button>
  );
}

interface BookmarkIconProps {
  filled: boolean;
  className?: string;
  onAnimationEnd?: () => void;
}

function BookmarkIcon({
  filled,
  className,
  onAnimationEnd,
}: BookmarkIconProps) {
  return (
    <svg
      onAnimationEnd={onAnimationEnd}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5', className)}
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
