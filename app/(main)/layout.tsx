'use client';

import { BottomNav } from '@/components/ui/BottomNav';
import Footer from '@/components/ui/Footer';
import Header from '@/components/ui/Header';

export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-300 flex-1 px-2 py-3">
          {children}
        </div>
        <Footer />
      </div>
      <BottomNav />
    </>
  );
}
