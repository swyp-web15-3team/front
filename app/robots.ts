import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/constants/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 로그인 사용자 전용이거나 검색 결과로 노출할 필요가 없는 경로
      disallow: ['/api/', '/login', '/signup', '/mypage', '/planner'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
