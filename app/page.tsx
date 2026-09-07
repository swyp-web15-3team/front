'use client';
import * as Sentry from '@sentry/nextjs';

export default function Home() {
  const errorTestHandler = () => {
    Sentry.captureException(new Error('GlitchTip 브라우저 테스트 에러'));
  };
  const serverErrorTestHandler = () => {
    fetch('/api/error-test/server');
  };
  const edgeErrorTestHandler = () => {
    fetch('/api/error-test/edge');
  };
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between gap-4 bg-white px-16 py-32 sm:items-start dark:bg-black">
        <div>
          {' '}
          <button
            onClick={errorTestHandler}
            className="border-2 bg-amber-50 text-black"
          >
            client 에러 전송 버튼
          </button>
          <button
            onClick={serverErrorTestHandler}
            className="border-2 bg-amber-50 text-black"
          >
            server 에러 전송 버튼
          </button>
          <button
            onClick={edgeErrorTestHandler}
            className="border-2 bg-amber-50 text-black"
          >
            edge 에러 전송 버튼
          </button>
        </div>
      </main>
    </div>
  );
}
