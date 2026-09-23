'use client';

import { useState } from 'react';

import { LoginLink } from '@/components/ui/LoginLink';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth-store';

export function SaveButton() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // TODO: 컬렉션 저장 API 연동 후 서버 상태(TanStack Query)로 교체
  const [isSaved, setIsSaved] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginLink className="flex items-center gap-1.5 rounded-md bg-black px-4 py-2 text-sm text-white">
        <BookmarkIcon filled={false} />
        로그인이 필요해요
      </LoginLink>
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
