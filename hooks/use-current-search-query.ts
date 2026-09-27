import { usePathname, useSearchParams } from 'next/navigation';

// 검색 결과 페이지(/search)의 현재 검색어. 그 외 페이지에서는 빈 문자열
// useSearchParams를 쓰므로 호출하는 컴포넌트는 Suspense 경계 안에 있어야 한다
export function useCurrentSearchQuery() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname !== '/search') return '';
  return searchParams.get('q')?.trim() ?? '';
}
