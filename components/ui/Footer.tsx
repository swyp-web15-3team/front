import { PROJECT_NAME, PROJECT_TEAM } from '@/constants/name';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="flex flex-col gap-4 bg-[#EBEBEB] px-5 pt-5 pb-20 md:pb-5">
      <div className="flex w-full justify-between">
        <div className="flex flex-col gap-2">
          {/* Logo */}
          <Image
            src="https://placehold.co/120x31.png"
            alt="Logo"
            width={120}
            height={31}
          />
          <div className="flex gap-1.5">
            <span>{PROJECT_NAME}</span>
            <span className="text-[#D9D9D9]">|</span>
            <span>{PROJECT_TEAM}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-right text-sm">
          <Link href="/privacy">개인정보처리방침↗</Link>
          <Link href="/terms">이용약관↗</Link>
        </div>
      </div>

      <div>Copyright ⓒ {PROJECT_NAME}</div>
    </footer>
  );
}
