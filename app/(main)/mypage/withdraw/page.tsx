'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useWithdrawMutation } from '@/hooks/queries/use-auth';

const REASONS = [
  { value: 'DISSATISFIED', label: '맘에 안듬' },
  { value: 'NOT_HELPFUL', label: '도움 안됨' },
  { value: 'ETC', label: '기타' },
];

export default function WithdrawPage() {
  const router = useRouter();
  const [reason, setReason] = useState<string | null>(null);
  const { mutate: withdraw, isPending } = useWithdrawMutation();

  const handleWithdraw = () => {
    if (!reason) return;

    withdraw(
      { reason },
      {
        onSuccess: () => {
          router.replace('/login');
        },
      }
    );
  };

  return (
    <div>
      <h1 className="text-page-title">탈퇴하는 이유를 알려주세요</h1>

      <div role="radiogroup" className="mt-6 flex flex-col gap-3">
        {REASONS.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-3">
            <input
              type="radio"
              name="withdraw-reason"
              value={value}
              checked={reason === value}
              onChange={() => setReason(value)}
            />
            <span className="text-body text-fg">{label}</span>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleWithdraw}
        disabled={!reason || isPending}
        className="bg-danger text-fg-on-dark text-button mt-12 min-h-11 w-full rounded-md py-4 disabled:opacity-50"
      >
        탈퇴하기
      </button>
    </div>
  );
}
