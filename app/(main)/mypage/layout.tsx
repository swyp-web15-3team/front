import { LoginRedirect } from '@/app/(main)/mypage/_components/LoginRedirect';

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoginRedirect />
      {children}
    </>
  );
}
