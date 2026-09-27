'use client';

import { LoginReturnHandler } from '@/components/common/LoginReturnHandler';
import { SaveItemModal } from '@/components/common/SaveItemModal';
import { BottomNav } from '@/components/ui/BottomNav';
import Footer from '@/components/ui/Footer';
import Header from '@/components/ui/Header';

export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col">
        {/* 페이지 거터: 모바일 8px → sm 24px (docs/DESIGN.md Layout) */}
        <div className="mx-auto w-full max-w-300 flex-1 px-2 py-3 sm:px-6">
          {children}
        </div>
        <Footer />
      </div>
      <BottomNav />
      <SaveItemModal />
      <LoginReturnHandler />
    </>
  );
}
