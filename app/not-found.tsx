import type { Metadata } from 'next';

import { NotFoundContent } from '@/components/common/NotFoundContent';
import { BottomNav } from '@/components/ui/BottomNav';
import Footer from '@/components/ui/Footer';
import Header from '@/components/ui/Header';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없어요',
};

// 어떤 라우트에도 맞지 않는 주소는 (main) 레이아웃 없이 여기로 오므로
// 헤더·푸터·바텀 내비를 직접 붙인다. (main) 안의 notFound()는 app/(main)/not-found.tsx
export default function NotFound() {
  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col px-2 sm:px-6">
          <NotFoundContent />
        </main>
        <Footer />
      </div>
      <BottomNav />
    </>
  );
}
