import ProfileImage from '@/app/(main)/mypage/_components/ProfileImage';

export default function MyPage() {
  return (
    <>
      <div className="flex gap-4">
        <div className="overflow-hidden rounded-full">
          <ProfileImage src="" />
        </div>
        <div>
          <p>닉네임 들어갈 곳</p>
          <p>이메일 들어갈 곳</p>
        </div>
      </div>
      <div>좋아요</div>
      <div>컬렉션</div>
      <div>댓글</div>
      <div>로그인정보</div>
      <div>회원탈퇴</div>
    </>
  );
}
