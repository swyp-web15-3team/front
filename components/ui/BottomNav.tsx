'use client';

import Image from 'next/image';
import Link from 'next/link';

export function BottomNav() {
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 sm:hidden">
        <nav className="border-tertiary flex justify-around border-2 border-t bg-white py-2">
          <Link href="/" className="flex flex-col items-center">
            <Image
              src="https://placehold.co/24x24.png"
              alt="홈"
              width={24}
              height={24}
            />
            <p className="text-xs">홈</p>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center">
            <Image
              src="https://placehold.co/24x24.png"
              alt="관심 목록"
              width={24}
              height={24}
            />
            <p className="text-xs">관심 목록</p>
          </Link>
          <Link href="/planner" className="flex flex-col items-center">
            <Image
              src="https://placehold.co/24x24.png"
              alt="플래너"
              width={24}
              height={24}
            />
            <p className="text-xs">플래너</p>
          </Link>
          <Link href="/mypage" className="flex flex-col items-center">
            <Image
              src="https://placehold.co/24x24.png"
              alt="마이"
              width={24}
              height={24}
            />
            <p className="text-xs">마이</p>
          </Link>
        </nav>
      </div>
    </>
  );
}
