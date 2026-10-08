import * as Sentry from '@sentry/nextjs';
import type { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';

import { SITE_URL } from '@/constants/site';
import { fetchWhiskies } from '@/lib/api/whisky';

// 빌드 시 백엔드를 호출하면 백엔드 상태에 따라 배포가 실패하므로, 요청 시점에 만든다.
// 위스키 목록은 아래 unstable_cache로 하루 동안 재사용한다
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50; // 목록 API의 최대 size
const CONCURRENCY = 5;

const getAllWhiskyIds = unstable_cache(
  async (): Promise<number[]> => {
    const first = await fetchWhiskies({ page: 0, size: PAGE_SIZE });
    const ids = first.content.map((whisky) => whisky.id);

    const restPages = Array.from(
      { length: first.totalPages - 1 },
      (_, i) => i + 1
    );
    for (let i = 0; i < restPages.length; i += CONCURRENCY) {
      const results = await Promise.all(
        restPages
          .slice(i, i + CONCURRENCY)
          .map((page) => fetchWhiskies({ page, size: PAGE_SIZE }))
      );
      for (const { content } of results) {
        ids.push(...content.map((whisky) => whisky.id));
      }
    }
    return ids;
  },
  ['sitemap-whisky-ids'],
  { revalidate: 86400 }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
  ];

  // 실패는 캐시하지 않도록 캐시 함수 밖에서 잡는다. 상세 목록 없이도 사이트맵은 응답한다
  try {
    const ids = await getAllWhiskyIds();
    return [
      ...staticEntries,
      ...ids.map((id) => ({
        url: `${SITE_URL}/detail/${id}`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    Sentry.captureException(error);
    return staticEntries;
  }
}
