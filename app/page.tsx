"use client";
import * as Sentry from "@sentry/nextjs";

export default function Home() {
  const errorTestHandler = () => {
    Sentry.captureException(new Error("GlitchTip 브라우저 테스트 에러"));
  };
  const serverErrorTestHandler = () => {
    fetch("/api/error-test/server");
  };
  const edgeErrorTestHandler = () => {
    fetch("/api/error-test/edge");
  };
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between gap-4 py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div>
          {" "}
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
