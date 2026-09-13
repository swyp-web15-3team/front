import { CurationSection } from '@/app/(main)/_components/CurationSection';
import { HeroBannerCarousel } from '@/app/(main)/_components/HeroBannerCarousel';
import { DUMMY_BANNERS } from '@/constants/banner';
import { fetchCurations } from '@/lib/api/test-curation';

export default async function Home() {
  const { curations } = await fetchCurations();

  return (
    <>
      {/* <HeroBannerCarousel banners={DUMMY_BANNERS} /> */}
      {curations.map((curation) => (
        <CurationSection key={curation.id} curation={curation} />
      ))}
    </>
  );
}
