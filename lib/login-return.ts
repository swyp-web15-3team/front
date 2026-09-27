// 카카오 로그인은 외부 사이트를 거쳐 돌아오므로, 복귀 지점을 메모리에 둘 수 없다.
// 가입 미완료 토큰(store/use-auth-store.ts)과 같은 이유로 sessionStorage를 쓴다.
const RETURN_KEY = 'loginReturn';

export interface LoginReturn {
  /** 로그인 전 있던 경로 (pathname + search) */
  path: string;
  /** 복귀 후 자동으로 다시 열 저장 모달의 payload. 없으면 그냥 복귀만 한다. */
  saveItem?: {
    id: number;
    name: string;
    originalName?: string;
    imageUrl?: string;
  };
}

export function saveLoginReturn(value: LoginReturn) {
  try {
    window.sessionStorage.setItem(RETURN_KEY, JSON.stringify(value));
  } catch {
    // 시크릿 모드 등에서 막혀도 로그인 자체는 계속 동작한다(메인으로 복귀).
  }
}

/** 지우지 않고 읽는다. 복귀 경로를 정하는 쪽(콜백/가입 완료)이 쓴다. */
export function peekLoginReturn(): LoginReturn | null {
  try {
    return parseLoginReturn(window.sessionStorage.getItem(RETURN_KEY));
  } catch {
    return null;
  }
}

/** 한 번만 쓰고 지운다. 다음 로그인에 이전 복귀 지점이 재사용되면 안 된다. */
export function takeLoginReturn(): LoginReturn | null {
  try {
    const raw = window.sessionStorage.getItem(RETURN_KEY);
    window.sessionStorage.removeItem(RETURN_KEY);
    return parseLoginReturn(raw);
  } catch {
    return null;
  }
}

function parseLoginReturn(raw: string | null): LoginReturn | null {
  try {
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    // 외부에서 심을 수 있는 값이라 자체 출처 경로인지 확인한다(오픈 리다이렉트 방지).
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as LoginReturn).path !== 'string' ||
      !(parsed as LoginReturn).path.startsWith('/') ||
      (parsed as LoginReturn).path.startsWith('//')
    ) {
      return null;
    }

    return parsed as LoginReturn;
  } catch {
    return null;
  }
}

/** 현재 위치를 복귀 지점으로 저장한다. 로그인 페이지 자신은 제외. */
export function rememberCurrentPath(saveItem?: LoginReturn['saveItem']) {
  const path = `${window.location.pathname}${window.location.search}`;
  if (path.startsWith('/login') || path.startsWith('/signup')) return;
  saveLoginReturn({ path, saveItem });
}
