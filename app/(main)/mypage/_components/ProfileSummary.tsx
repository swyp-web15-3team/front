'use client';

import PencilSquareIcon from '@heroicons/react/24/outline/PencilSquareIcon';
import { useState } from 'react';

import { ProfileImage } from '@/app/(main)/mypage/_components/ProfileImage';
import { Button } from '@/components/ui/Button';
import {
  useMeQuery,
  useUpdateMyProfileMutation,
} from '@/hooks/queries/use-user';
import { NICKNAME_MAX_LENGTH } from '@/lib/api/user';

export function ProfileSummary() {
  const { data: user } = useMeQuery();
  const { mutate: updateProfile, isPending } = useUpdateMyProfileMutation();
  const [draft, setDraft] = useState<string | null>(null);

  const isEditing = draft !== null;
  const trimmed = draft?.trim() ?? '';
  const isValid = trimmed.length > 0 && trimmed.length <= NICKNAME_MAX_LENGTH;

  const submit = () => {
    // 안 바뀌었으면 요청 없이 닫는다.
    if (!isValid || trimmed === user?.nickname) {
      setDraft(null);
      return;
    }
    updateProfile(trimmed, { onSuccess: () => setDraft(null) });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="overflow-hidden rounded-full">
        <ProfileImage src={user?.profileImageUrl ?? ''} size={56} />
      </div>

      {isEditing ? (
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              // 모달/바텀시트가 아니라 입력 하나라 공유 esc 스택 대신 여기서 끝낸다.
              if (event.key === 'Escape') {
                event.stopPropagation();
                setDraft(null);
              }
            }}
            maxLength={NICKNAME_MAX_LENGTH}
            aria-label="닉네임"
            className="border-border-strong text-body focus-visible:outline-primary-focus min-w-0 flex-1 rounded-md border px-3 py-2 focus-visible:outline-2"
          />
          <Button type="submit" disabled={!isValid || isPending}>
            {isPending ? '저장 중' : '저장'}
          </Button>
        </form>
      ) : (
        <>
          {/* 닉네임이 도착하기 전에는 이름 줄을 비워둔다. 자리는 유지돼 안 흔들린다. */}
          <p className="text-page-title">{user ? `${user.nickname}님` : ''}</p>
          {user && (
            <button
              type="button"
              onClick={() => setDraft(user.nickname)}
              aria-label="닉네임 수정"
              className="text-fg-muted hover:text-fg"
            >
              <PencilSquareIcon className="size-5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
