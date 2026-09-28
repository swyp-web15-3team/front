'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useWithdrawMutation } from '@/hooks/queries/use-auth';
import { cn } from '@/lib/utils';

const REASONS = [
  { value: 'DISSATISFIED', label: '서비스가 맘에 들지 않아요' },
  { value: 'NOT_HELPFUL', label: '원하는 정보를 찾기 어려워요' },
  { value: 'RARELY_USED', label: '자주 사용하지 않아요' },
  { value: 'ETC', label: '기타' },
] as const;

type ReasonValue = (typeof REASONS)[number]['value'];

const ETC_MAX_LENGTH = 200;

export default function WithdrawPage() {
  const router = useRouter();
  const [reason, setReason] = useState<ReasonValue | null>(null);
  const [etcDetail, setEtcDetail] = useState('');
  const { mutate: withdraw, isPending } = useWithdrawMutation();

  const isEtc = reason === 'ETC';
  // 기타를 고르면 사유를 적어야 넘어간다. 빈 값으로 보내면 남는 게 없다.
  const canSubmit =
    reason !== null && (!isEtc || etcDetail.trim().length > 0) && !isPending;

  const handleWithdraw = () => {
    if (!canSubmit) return;

    withdraw(
      { reason, detail: isEtc ? etcDetail.trim() : undefined },
      { onSuccess: () => router.replace('/') }
    );
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col px-4 pb-12">
      <h1 className="text-page-title mt-2">
        탈퇴하시는 이유를
        <br />
        알려주세요.
      </h1>
      <p className="text-body-sm text-fg-muted mt-3">
        남겨주신 의견은 서비스를 개선하는 데 사용됩니다.
      </p>

      <fieldset className="mt-10">
        <legend className="sr-only">탈퇴 사유</legend>
        <div className="border-border rounded-lg border p-4">
          <div className="flex flex-col gap-4">
            {REASONS.map(({ value, label }) => (
              <ReasonRadio
                key={value}
                value={value}
                label={label}
                checked={reason === value}
                onSelect={() => setReason(value)}
              />
            ))}
          </div>

          {isEtc && (
            <label className="mt-4 flex flex-col gap-2">
              <span className="sr-only">기타 사유</span>
              <textarea
                value={etcDetail}
                onChange={(event) => setEtcDetail(event.target.value)}
                maxLength={ETC_MAX_LENGTH}
                rows={4}
                autoFocus
                placeholder="어떤 점이 아쉬우셨는지 알려주세요"
                className="border-border-strong focus:border-primary-focus text-body placeholder:text-fg-subtle resize-none rounded-md border px-4 py-3 transition-colors"
              />
              <span className="text-caption text-fg-muted self-end">
                {etcDetail.length}/{ETC_MAX_LENGTH}
              </span>
            </label>
          )}
        </div>
      </fieldset>

      <div className="mt-8 flex items-center gap-2 pt-4">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          aria-label="탈퇴 이전 단계로"
          className="shrink-0 px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
        {/* 되돌릴 수 없는 동작이라 primary가 아니라 danger 색을 쓴다.
            Button에 danger variant가 없어 className으로만 덮는다. */}
        <Button
          fullWidth
          disabled={!canSubmit}
          onClick={handleWithdraw}
          className="bg-danger text-fg-on-dark hover:bg-danger flex-1 hover:brightness-95"
        >
          {isPending ? '탈퇴 중...' : '탈퇴하기'}
        </Button>
      </div>
    </div>
  );
}

interface ReasonRadioProps {
  value: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}

// 사유는 하나만 고르므로 radio를 쓴다. 모양은 약관 동의의 round 체크와 맞추되,
// Checkbox 컴포넌트는 type이 checkbox로 고정이라 여기서 직접 그린다.
function ReasonRadio({ value, label, checked, onSelect }: ReasonRadioProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="radio"
        name="withdraw-reason"
        value={value}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      {/* sr-only input이라 포커스 링을 박스가 대신 받는다 */}
      <span className="peer-focus-visible:outline-primary-focus flex peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
        <span
          aria-hidden
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
            checked
              ? 'bg-primary text-on-primary'
              : 'bg-surface-sunken text-fg-subtle'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      </span>
      <span className="text-body-sm">{label}</span>
    </label>
  );
}
