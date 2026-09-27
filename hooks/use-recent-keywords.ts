import { useSyncExternalStore } from 'react';

import {
  addRecentKeyword,
  getRecentKeywords,
  getServerRecentKeywords,
  removeRecentKeyword,
  subscribeRecentKeywords,
} from '@/lib/recent-keywords';

// 최근 검색어 목록과 추가/삭제 함수.
// 서버 렌더 시에는 빈 목록을 쓰고, 하이드레이션 후 localStorage 값으로 채워진다.
// TODO: 최근 검색어 API가 생기면 useAuthStore의 isAuthenticated로 분기해
// 로그인 상태에서는 TanStack Query 훅(useRecentKeywordListQuery 등)으로 교체한다.
// 최대 10개 제한은 localStorage 전용이다. API 연동 시 개수/정렬/중복 처리는 백엔드에 맡기고 프론트에서 자르지 않는다.
export function useRecentKeywords() {
  const keywords = useSyncExternalStore(
    subscribeRecentKeywords,
    getRecentKeywords,
    getServerRecentKeywords
  );

  return {
    keywords,
    add: addRecentKeyword,
    remove: removeRecentKeyword,
  };
}
