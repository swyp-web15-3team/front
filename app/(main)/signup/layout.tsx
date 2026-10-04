import type { Metadata } from 'next';

// 하위 page.tsx가 클라이언트 컴포넌트라 metadata를 여기서 지정한다
export const metadata: Metadata = {
  title: '회원가입',
};

export default function SignupLayout({ children }: LayoutProps<'/signup'>) {
  return children;
}
