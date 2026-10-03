import { KakaoIcon } from '@/components/ui/KakaoIcon';

import { LoginReturnSaver } from './_components/LoginReturnSaver';

interface LoginPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-10 px-6">
      <LoginReturnSaver next={typeof next === 'string' ? next : undefined} />
      <h1 className="text-page-title">로그인</h1>
      <a
        href="/api/auth/kakao"
        className="bg-kakao text-fg text-button flex min-h-11 w-full max-w-sm items-center justify-center gap-2 rounded-md py-3"
      >
        <KakaoIcon />
        카카오로 로그인
      </a>
    </div>
  );
}
