import Link from 'next/link';

export function NotFoundContent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-t8 text-primary font-bold">404</p>
      <h1 className="text-section-title text-fg">페이지를 찾을 수 없어요</h1>
      <p className="text-body text-fg-muted">
        주소가 잘못되었거나 삭제된 페이지예요.
      </p>
      <Link
        href="/"
        className="bg-primary text-on-primary text-button hover:bg-primary-focus mt-4 inline-flex min-h-11 items-center rounded-md px-5 py-2.5"
      >
        홈으로 가기
      </Link>
    </div>
  );
}
