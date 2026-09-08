import Footer from '@/components/ui/Footer';
import Header from '@/components/ui/Header';

export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Header />
      <div className="px-2 py-3">{children}</div>
      <Footer />
    </>
  );
}
