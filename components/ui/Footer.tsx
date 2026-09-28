import { PROJECT_NAME, PROJECT_TEAM } from '@/constants/name';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface-footer text-body-sm text-fg-muted pb-bottom-nav-safe flex flex-col gap-4 px-5 pt-5 md:pb-5">
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
            <span className="text-fg-subtle">|</span>
            <span>{PROJECT_TEAM}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <Link href="/privacy" className="hover:text-fg">
            개인정보처리방침↗
          </Link>
          <Link href="/terms" className="hover:text-fg">
            이용약관↗
          </Link>
        </div>
      </div>

      <div className="text-caption">Copyright ⓒ {PROJECT_NAME}</div>
    </footer>
  );
}
