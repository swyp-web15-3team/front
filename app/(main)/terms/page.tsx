import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관',
};

// TODO: 이용약관 본문이 확정되면 채운다
export default function TermsPage() {
  return (
    <>
      <h1 className="text-page-title">이용약관</h1>
      <p className="text-body text-fg-muted py-20 text-center">준비 중입니다</p>
    </>
  );
}
