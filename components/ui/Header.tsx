import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-yellow-50 px-6 py-2">
      <Link href="/">
        <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
      </Link>
      <nav className="flex gap-4">
        <Link href="/mypage">마이페이지</Link>
        <Link href="/login">로그인</Link>
      </nav>
    </header>
  );
}
