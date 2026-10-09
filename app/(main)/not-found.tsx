import type { Metadata } from 'next';

import { NotFoundContent } from '@/components/common/NotFoundContent';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없어요',
};

// (main) 안에서 notFound()를 호출하면 여기로 온다. 헤더·푸터는 (main) 레이아웃이 그린다
export default function MainNotFound() {
  return <NotFoundContent />;
}
