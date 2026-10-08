import { PROJECT_NAME } from '@/constants/name';

// sitemap·robots·OG 태그의 절대 주소 기준. 배포 시 deploy.yml에서 주입한다
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const SITE_DESCRIPTION =
  '한국·일본 위스키 가격을 한눈에 비교하고, 마음에 드는 위스키는 컬렉션에 담아 플래너로 구매 계획을 세워보세요.';

// openGraph는 세그먼트 간 얕게 병합돼 하위에서 정의하면 통째로 덮인다.
// 하위 페이지의 openGraph에도 펼쳐 넣어 공통 필드를 유지한다
export const SHARED_OPEN_GRAPH = {
  type: 'website',
  locale: 'ko_KR',
  siteName: PROJECT_NAME,
} as const;
