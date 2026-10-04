import type { Metadata } from 'next';

import { CollectionView } from '@/app/(main)/mypage/collection/_components/CollectionView';

export const metadata: Metadata = {
  title: '콜렉션',
};

export default function CollectionPage() {
  return (
    <>
      <h1 className="text-page-title">콜렉션</h1>
      <CollectionView />
    </>
  );
}
