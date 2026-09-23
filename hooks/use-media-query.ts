import { useSyncExternalStore } from 'react';

/**
 * matchMedia 기반 미디어 쿼리 훅. SSR에서는 항상 false를 반환하고
 * 마운트 후 실제 뷰포트 값으로 하이드레이션된다.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
