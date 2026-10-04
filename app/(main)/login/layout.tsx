import type { Metadata } from 'next';

// 로그인 페이지와 콜백(클라이언트 컴포넌트) 페이지가 함께 쓴다
export const metadata: Metadata = {
  title: '로그인',
};

export default function LoginLayout({ children }: LayoutProps<'/login'>) {
  return children;
}
