'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { SaveItemWhisky } from '@/components/common/SaveItemModal';
import { rememberCurrentPath } from '@/lib/login-return';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth-store';

interface SaveButtonProps {
  whisky: SaveItemWhisky;
}

export function SaveButton({ whisky }: SaveButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // TODO: 컬렉션 저장 API 연동 후 서버 상태(TanStack Query)로 교체
  const [isSaved, setIsSaved] = useState(false);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => {
          // 로그인 후 이 페이지로 돌아와 저장 모달이 자동으로 열리게 한다.
          rememberCurrentPath(whisky);
          router.push('/login');
        }}
        className="flex items-center gap-1.5 rounded-md bg-black px-4 py-2 text-sm text-white"
      >
        <BookmarkIcon filled={false} />
        로그인이 필요해요
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsSaved((prev) => !prev)}
      className={cn(
        'flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm',
        isSaved
          ? 'border-brand bg-brand text-white'
          : 'border-black bg-black text-white'
      )}
    >
      <BookmarkIcon filled={isSaved} />
      {isSaved ? '저장됨' : '저장하기'}
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
