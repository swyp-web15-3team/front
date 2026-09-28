'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { isAlreadySignedUp, useSignUpMutation } from '@/hooks/queries/use-auth';
import { peekLoginReturn } from '@/lib/login-return';
import type { SignUpRequest } from '@/types/auth';

import { ChevronRightIcon } from '@heroicons/react/24/solid';

type AgreementKey = Exclude<keyof SignUpRequest, 'nickname'>;

interface Term {
  id: AgreementKey;
  label: string;
  required: boolean;
  /** 상세 보기에 노출할 약관 본문. 링크 대신 인앱으로 보여준다. */
  detail: string;
}

interface TermGroup {
  title: string;
  terms: Term[];
}

const TERM_GROUPS: TermGroup[] = [
  {
    title: '회원가입 동의',
    terms: [
      {
        id: 'ageOver14Agreed',
        label: '(필수) 만 14세 이상입니다',
        required: true,
        detail:
          '만 14세 미만 아동은 법정대리인의 동의 없이 서비스를 이용할 수 없습니다. 가입자 본인이 만 14세 이상임을 확인합니다.',
      },
      {
        id: 'termsOfServiceAgreed',
        label: '(필수) 서비스 이용약관 동의',
        required: true,
        detail:
          '서비스 이용 조건, 회원의 권리와 의무, 게시물 관리 정책 등 서비스 이용 전반에 관한 약관입니다. 회원은 약관에 동의함으로써 서비스를 이용할 수 있습니다.',
      },
      {
        id: 'privacyPolicyAgreed',
        label: '(필수) 개인정보 수집 및 이용 동의',
        required: true,
        detail:
          '수집 항목: 카카오 계정 식별자, 닉네임. 수집 목적: 회원 식별 및 서비스 제공. 보유 기간: 회원 탈퇴 시까지. 동의를 거부할 수 있으나, 거부 시 회원가입이 제한됩니다.',
      },
    ],
  },
  {
    title: '마케팅 수신 동의',
    terms: [
      {
        id: 'marketingAgreed',
        label: '(선택) 마케팅 정보 수신 동의',
        required: false,
        detail:
          '신규 위스키 입고, 할인 정보 등 마케팅 정보를 수신합니다. 동의하지 않아도 서비스 이용에 제한은 없으며, 가입 후 언제든 변경할 수 있습니다.',
      },
    ],
  },
];

const ALL_TERMS = TERM_GROUPS.flatMap((group) => group.terms);

const NICKNAME_MAX_LENGTH = 12;

const EMPTY_AGREEMENTS: Record<AgreementKey, boolean> = {
  ageOver14Agreed: false,
  termsOfServiceAgreed: false,
  privacyPolicyAgreed: false,
  marketingAgreed: false,
};

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<'terms' | 'nickname'>('terms');
  const [agreements, setAgreements] = useState(EMPTY_AGREEMENTS);
  const [openedTerm, setOpenedTerm] = useState<Term | null>(null);
  const [nickname, setNickname] = useState('');
  const { mutate: signUp, isPending } = useSignUpMutation();

  const allChecked = ALL_TERMS.every((term) => agreements[term.id]);
  const requiredChecked = ALL_TERMS.filter((term) => term.required).every(
    (term) => agreements[term.id]
  );
  const nicknameValid =
    nickname.trim().length > 0 && nickname.trim().length <= NICKNAME_MAX_LENGTH;

  const toggleAll = () => {
    const next = !allChecked;
    setAgreements({
      ageOver14Agreed: next,
      termsOfServiceAgreed: next,
      privacyPolicyAgreed: next,
      marketingAgreed: next,
    });
  };

  const toggle = (id: AgreementKey) =>
    setAgreements((prev) => ({ ...prev, [id]: !prev[id] }));

  // 약관 상세는 별도 라우트 없이 같은 화면을 덮는다.
  if (openedTerm) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col px-4 pb-12">
        <h2 className="text-section-title mt-2">{openedTerm.label}</h2>
        <p className="text-body-sm text-fg-muted mt-4 whitespace-pre-line">
          {openedTerm.detail}
        </p>
        <StepFooter
          title="약관 상세"
          onBack={() => setOpenedTerm(null)}
          step={1}
          label="동의하기"
          onConfirm={() => {
            setAgreements((prev) => ({ ...prev, [openedTerm.id]: true }));
            setOpenedTerm(null);
          }}
        />
      </div>
    );
  }

  if (step === 'nickname') {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col px-4 pb-12">
        <h1 className="text-page-title mt-2">
          사용하실 닉네임을
          <br />
          입력해 주세요.
        </h1>

        <label className="mt-10 flex flex-col gap-2">
          <span className="text-body-sm-strong">닉네임</span>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={NICKNAME_MAX_LENGTH}
            placeholder="닉네임을 입력해 주세요"
            autoFocus
            className="border-border-strong focus:border-primary-focus text-body placeholder:text-fg-subtle rounded-md border px-4 py-3 transition-colors"
          />
          <span className="text-caption text-fg-muted self-end">
            {nickname.length}/{NICKNAME_MAX_LENGTH}
          </span>
        </label>

        <StepFooter
          title="회원가입"
          onBack={() => setStep('terms')}
          step={2}
          label={isPending ? '가입 중...' : '확인'}
          disabled={!nicknameValid || isPending}
          onConfirm={() =>
            signUp(
              { ...agreements, nickname: nickname.trim() },
              {
                onSuccess: () => router.push(peekLoginReturn()?.path ?? '/'),
                // 이미 가입된 사용자(409)는 훅이 로그인 처리하므로 그대로 복귀시킨다.
                onError: (error) => {
                  if (isAlreadySignedUp(error)) {
                    router.push(peekLoginReturn()?.path ?? '/');
                  }
                },
              }
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col px-4 pb-12">
      <h1 className="text-page-title mt-2">
        회원가입 약관에
        <br />
        동의해 주세요.
      </h1>

      <div className="mt-10 flex flex-col gap-3">
        <Card>
          <Checkbox
            shape="round"
            checked={allChecked}
            onChange={toggleAll}
            label="전체동의"
            labelClassName="text-section-title"
          />
        </Card>

        {TERM_GROUPS.map((group) => (
          <Card key={group.title}>
            <h2 className="text-section-title">{group.title}</h2>
            <div className="border-border mt-4 flex flex-col gap-4 border-t pt-4">
              {group.terms.map((term) => (
                <div key={term.id} className="flex items-center gap-2">
                  <Checkbox
                    shape="round"
                    checked={agreements[term.id]}
                    onChange={() => toggle(term.id)}
                    label={term.label}
                  />
                  <button
                    type="button"
                    aria-label={`${term.label} 상세 보기`}
                    onClick={() => setOpenedTerm(term)}
                    className="text-fg-muted hover:text-fg ml-auto shrink-0 p-1"
                  >
                    <ChevronRightIcon className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <StepFooter
        title="회원가입"
        onBack={() => router.back()}
        step={1}
        label="확인"
        disabled={!requiredChecked}
        onConfirm={() => setStep('nickname')}
      />
    </div>
  );
}

interface StepFooterProps {
  title: string;
  onBack: () => void;
  step: number;
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}

// 뒤로 가기와 확인을 한 줄에 둬서 같은 층계로 읽히게 한다 (웹 퍼스트라 상단 고정 헤더 없음).
// 단계 표시는 확인 버튼 안 오른쪽에 붙인다.
function StepFooter({
  title,
  onBack,
  step,
  label,
  onConfirm,
  disabled,
}: StepFooterProps) {
  return (
    <div className="mt-8 flex items-center gap-2 pt-4">
      <Button
        variant="secondary"
        onClick={onBack}
        aria-label={`${title} 이전 단계로`}
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
      <Button
        fullWidth
        disabled={disabled}
        onClick={onConfirm}
        className="relative flex-1"
      >
        {label}
        {/* 라벨은 버튼 가운데를 유지하고 단계 표시만 오른쪽에 띄운다 */}
        <span className="text-body-sm absolute right-4 opacity-80">
          {step}
          <span className="mx-0.5">|</span>2
        </span>
      </Button>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="border-border rounded-lg border p-4">{children}</div>;
}
