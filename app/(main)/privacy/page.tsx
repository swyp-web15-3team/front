import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
};

// TODO: 개인정보처리방침 본문이 확정되면 채운다
export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-page-title">개인정보처리방침</h1>
      <p className="text-body text-fg-muted py-20 text-center">준비 중입니다</p>
    </>
  );
}
