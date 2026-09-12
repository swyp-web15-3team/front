import { HeroBannerCarousel } from '@/app/(main)/_components/HeroBannerCarousel';
import { DUMMY_BANNERS } from '@/constants/banner';

export default function Home() {
  return (
    <>
      <HeroBannerCarousel banners={DUMMY_BANNERS} />
    </>
  );
}
