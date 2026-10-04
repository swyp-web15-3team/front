import type { Metadata } from 'next';

// page.tsx가 클라이언트 컴포넌트라 metadata를 여기서 지정한다
export const metadata: Metadata = {
  title: '회원 탈퇴',
};

export default function WithdrawLayout({
  children,
}: LayoutProps<'/mypage/withdraw'>) {
  return children;
}
