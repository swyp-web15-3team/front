import Link from 'next/link';

import { ProfileImage } from '@/app/(main)/mypage/_components/ProfileImage';

export default function MyPage() {
  return (
    <>
      <div className="flex gap-4">
        <div className="overflow-hidden rounded-full">
          <ProfileImage src="" />
        </div>
        <div>
          <p className="text-card-title">닉네임 들어갈 곳</p>
          <p className="text-body-sm text-fg-muted">이메일 들어갈 곳</p>
        </div>
      </div>
      <div className="text-body">좋아요</div>
      <Link
        href="/mypage/collection"
        className="text-body hover:text-primary-strong"
      >
        관심 목록
      </Link>
      <div className="text-body">댓글</div>
      <div className="text-body">로그인정보</div>
      <Link
        href="/mypage/withdraw"
        className="text-body-sm text-fg-muted hover:text-fg"
      >
        회원탈퇴
      </Link>
    </>
  );
}
