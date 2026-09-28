import BookmarkIcon from '@heroicons/react/24/outline/BookmarkIcon';
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon';
import Link from 'next/link';

import { ProfileSummary } from '@/app/(main)/mypage/_components/ProfileSummary';
import { KakaoIcon } from '@/components/ui/KakaoIcon';

/** 프로필 아래 아이콘 바로가기. 기능이 늘면 여기에 추가한다. */
const SHORTCUTS = [
  { href: '/mypage/collection', label: '콜렉션', Icon: BookmarkIcon },
  { href: '/planner', label: '플래너', Icon: CalendarDaysIcon },
] as const;

export default function MyPage() {
  return (
    <div className="flex flex-col gap-6">
      <ProfileSummary />

      {/* 모바일은 가로 한 줄, sm 이상에서는 세로 목록으로 쌓는다. */}
      <nav className="border-border flex border-y py-2 sm:flex-col">
        {SHORTCUTS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="text-fg hover:text-primary-strong flex flex-1 items-center justify-center gap-3 py-3 sm:flex-none sm:justify-start"
          >
            <Icon className="size-6" />
            <span className="text-body">{label}</span>
          </Link>
        ))}
      </nav>

      <section>
        <h2 className="text-section-title">로그인 정보</h2>
        <div className="mt-4 flex items-center gap-2">
          {/* 카카오 로그인만 지원한다. 계정이 늘면 provider별로 분기한다. */}
          <span className="bg-kakao text-fg flex size-7 items-center justify-center rounded-full">
            <KakaoIcon size={16} />
          </span>
          <span className="text-body">카카오 로그인</span>
        </div>
      </section>

      <Link
        href="/mypage/withdraw"
        className="text-body-sm text-fg-muted hover:text-fg self-start underline"
      >
        회원탈퇴
      </Link>
    </div>
  );
}
