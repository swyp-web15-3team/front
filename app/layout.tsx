import type { Metadata } from 'next';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { PROJECT_NAME } from '@/constants/name';
import {
  SHARED_OPEN_GRAPH,
  SITE_DESCRIPTION,
  SITE_URL,
} from '@/constants/site';
import './globals.css';

export const metadata: Metadata = {
  // og:image 등 상대 경로를 절대 주소로 바꾸는 기준
  metadataBase: new URL(SITE_URL),
  // 하위 페이지는 metadata.title에 페이지명만 적는다 → "술케줄 | 플래너"
  title: {
    template: `${PROJECT_NAME} | %s`,
    default: PROJECT_NAME,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    title: PROJECT_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/site.webmanifest',
};

// Pretendard(dynamic subset)를 CDN에서 받는다. globals.css의 @import로는 넣을 수
// 없다 — `@import 'tailwindcss'`가 인라인으로 펼쳐져서 @import가 일반 규칙
//뒤로 밀리고, CSS 파싱이 실패한다.
const PRETENDARD_CDN =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="stylesheet" href={PRETENDARD_CDN} />
      </head>
      <body className="flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
