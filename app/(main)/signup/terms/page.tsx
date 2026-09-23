'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useSignUpMutation } from '@/hooks/queries/use-auth';
import { takeReturnTo } from '@/lib/return-to';
import type { SignUpRequest } from '@/types/auth';

const TERMS: Array<{
  id: keyof SignUpRequest;
  label: string;
  required: boolean;
}> = [
  { id: 'ageOver14Agreed', label: '(필수) 만 14세 이상입니다', required: true },
  {
    id: 'termsOfServiceAgreed',
    label: '(필수) 서비스 이용약관 동의',
    required: true,
  },
  {
    id: 'privacyPolicyAgreed',
    label: '(필수) 개인정보 수집 및 이용 동의',
    required: true,
  },
  {
    id: 'marketingAgreed',
    label: '(선택) 마케팅 정보 수신 동의',
    required: false,
  },
];

export default function TermsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<keyof SignUpRequest, boolean>>({
    ageOver14Agreed: false,
    termsOfServiceAgreed: false,
    privacyPolicyAgreed: false,
    marketingAgreed: false,
  });
  const { mutate: signUp, isPending } = useSignUpMutation();

  const allChecked = TERMS.every((term) => checked[term.id]);
  const requiredChecked = TERMS.filter((term) => term.required).every(
    (term) => checked[term.id]
  );

  const toggleAll = () => {
    const next = !allChecked;
    setChecked({
      ageOver14Agreed: next,
      termsOfServiceAgreed: next,
      privacyPolicyAgreed: next,
      marketingAgreed: next,
    });
  };

  const toggle = (id: keyof SignUpRequest) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-1 flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold">약관 동의</h1>

      <label className="flex items-center gap-2 border-b pb-4 font-medium">
        <input type="checkbox" checked={allChecked} onChange={toggleAll} />
        전체 동의
      </label>

      <div className="flex flex-col gap-3">
        {TERMS.map((term) => (
          <label key={term.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!checked[term.id]}
              onChange={() => toggle(term.id)}
            />
            {term.label}
          </label>
        ))}
      </div>

      <button
        type="button"
        disabled={!requiredChecked || isPending}
        onClick={() =>
          signUp(checked, {
            // 로그인 전 보던 페이지로 복귀한다. 외부 유입이었다면 메인으로.
            onSuccess: () => router.replace(takeReturnTo()),
          })
        }
        className="rounded-md bg-black py-3 font-medium text-white disabled:bg-black/30"
      >
        동의하고 계속하기
      </button>
    </div>
  );
}
