import { create } from 'zustand';

// 회원가입 미완료 신규 유저의 accessToken 보관소.
// store는 in-memory라 약관 페이지에서 새로고침하면 날아가므로, 가입 완료까지만 sessionStorage에 둔다.
const PENDING_TOKEN_KEY = 'pendingAccessToken';

export function readPendingAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(PENDING_TOKEN_KEY);
  } catch {
    return null;
  }
}

function writePendingAccessToken(accessToken: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (accessToken === null) {
      window.sessionStorage.removeItem(PENDING_TOKEN_KEY);
    } else {
      window.sessionStorage.setItem(PENDING_TOKEN_KEY, accessToken);
    }
  } catch {
    // 시크릿 모드 등에서 sessionStorage 접근이 막혀도 in-memory 경로는 계속 동작한다.
  }
}

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setPendingAccessToken: (accessToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  setAccessToken: (accessToken) => {
    // 가입이 끝나 정식 로그인 상태가 되면 임시 토큰은 남겨두지 않는다.
    writePendingAccessToken(null);
    set({ accessToken, isAuthenticated: Boolean(accessToken) });
  },
  // 회원가입 미완료 신규 유저: 요청 인증 헤더에는 실어야 하지만 로그인 상태로 취급하지 않는다.
  setPendingAccessToken: (accessToken) => {
    writePendingAccessToken(accessToken);
    set({ accessToken });
  },
  clear: () => {
    writePendingAccessToken(null);
    set({ accessToken: null, isAuthenticated: false });
  },
}));
