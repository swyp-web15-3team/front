// 로그인 전 페이지 기억용. 카카오 OAuth는 외부 도메인을 경유해 돌아오므로
// 라우터 히스토리가 끊긴다. 로그인 진입 시점에 직접 남겨둬야 한다.
const RETURN_TO_KEY = 'returnTo';

/**
 * 로그인 후 돌아갈 경로. 오픈 리다이렉트를 막기 위해 같은 출처의 경로만 허용한다.
 * `//evil.com`, `https://evil.com`, `/\evil.com` 등은 전부 걸러진다.
 */
function sanitize(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith('/')) return null;
  if (path.startsWith('//') || path.startsWith('/\\')) return null;
  // 로그인/가입 페이지로 되돌아가면 무한 왕복이 된다.
  if (path.startsWith('/login') || path.startsWith('/signup')) return null;
  return path;
}

/** 현재 페이지를 로그인 후 복귀 지점으로 기록한다. */
export function rememberReturnTo(path: string) {
  const safe = sanitize(path);
  if (typeof window === 'undefined' || !safe) return;
  try {
    window.sessionStorage.setItem(RETURN_TO_KEY, safe);
  } catch {
    // 시크릿 모드 등에서 막혀도 메인으로 보내면 되므로 무시한다.
  }
}

/** 기록된 복귀 지점을 꺼내고 지운다. 없으면 메인으로. */
export function takeReturnTo(): string {
  if (typeof window === 'undefined') return '/';
  try {
    const stored = window.sessionStorage.getItem(RETURN_TO_KEY);
    window.sessionStorage.removeItem(RETURN_TO_KEY);
    return sanitize(stored) ?? '/';
  } catch {
    return '/';
  }
}
