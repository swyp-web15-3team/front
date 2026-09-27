// 비로그인 사용자의 최근 검색어를 localStorage에 보관한다.
// 여러 컴포넌트/탭에서 같은 값을 보도록 useSyncExternalStore용 subscribe/getSnapshot을 함께 제공한다.
const STORAGE_KEY = 'recentKeywords';

export const MAX_RECENT_KEYWORDS = 10;

const EMPTY: string[] = [];
const listeners = new Set<() => void>();

// getSnapshot은 매번 같은 참조를 돌려줘야 하므로, 원본 문자열이 바뀔 때만 다시 파싱한다
let cachedRaw: string | null = null;
let cachedKeywords: string[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(keywords: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
  } catch {
    // 시크릿 모드 등에서 저장이 막히면 조용히 무시한다 (최근 검색어는 부가 기능)
  }
  listeners.forEach((listener) => listener());
}

export function getRecentKeywords(): string[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedKeywords = parse(raw);
  }
  return cachedKeywords;
}

export function getServerRecentKeywords(): string[] {
  return EMPTY;
}

export function subscribeRecentKeywords(listener: () => void) {
  listeners.add(listener);
  // 다른 탭에서 바뀐 값도 반영한다
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) listener();
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

/** 가장 최근 검색어를 맨 앞에 두고, 중복은 제거하며, 최대 개수를 넘으면 오래된 것부터 버린다 */
export function addRecentKeyword(keyword: string) {
  const trimmed = keyword.trim();
  if (!trimmed) return;
  write(
    [trimmed, ...getRecentKeywords().filter((item) => item !== trimmed)].slice(
      0,
      MAX_RECENT_KEYWORDS
    )
  );
}

export function removeRecentKeyword(keyword: string) {
  write(getRecentKeywords().filter((item) => item !== keyword));
}
