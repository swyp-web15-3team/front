export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-10 px-6">
      <h1 className="text-2xl font-bold">로그인</h1>
      <a
        href="/api/auth/kakao"
        className="flex w-full max-w-sm items-center justify-center gap-2 rounded-md bg-[#FEE500] py-3 font-medium text-black/85"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M10 2C5.03 2 1 5.14 1 9c0 2.48 1.67 4.65 4.19 5.89-.18.66-.66 2.42-.76 2.8-.12.47.17.46.36.34.15-.1 2.4-1.63 3.38-2.3.6.09 1.21.13 1.83.13 4.97 0 9-3.14 9-7s-4.03-6.86-9-6.86Z"
            fill="black"
          />
        </svg>
        카카오로 로그인
      </a>
    </div>
  );
}
