import { create } from 'zustand';

// 회원가입 미완료 신규 유저 표식.
// store는 in-memory라 약관 페이지에서 새로고침하면 날아간다. accessToken은 refreshToken
// 쿠키로 복구되지만 "가입 미완료"라는 사실은 복구할 길이 없어, 가입 완료까지만 sessionStorage에 둔다.
const PENDING_SIGNUP_KEY = 'pendingSignUp';

export function readPendingSignUp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(PENDING_SIGNUP_KEY) === 'true';
  } catch {
    return false;
  }
}

function writePendingSignUp(pending: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (pending) {
      window.sessionStorage.setItem(PENDING_SIGNUP_KEY, 'true');
    } else {
      window.sessionStorage.removeItem(PENDING_SIGNUP_KEY);
    }
  } catch {
    // 시크릿 모드 등에서 sessionStorage 접근이 막혀도 in-memory 경로는 계속 동작한다.
  }
}

interface AuthState {
  accessToken: string | null;
  /** 회원가입(약관 동의) 미완료 상태. 토큰이 있어도 로그인으로 치지 않는다. */
  isPendingSignUp: boolean;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string | null) => void;
  /** 신규 유저: 토큰은 인증 헤더에 실어야 하지만 로그인 상태로 취급하지 않는다. */
  setPendingAccessToken: (accessToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isPendingSignUp: false,
  isAuthenticated: false,
  setAccessToken: (accessToken) => {
    // 가입이 끝나 정식 로그인 상태가 되면 미완료 표식은 남겨두지 않는다.
    writePendingSignUp(false);
    set({
      accessToken,
      isPendingSignUp: false,
      isAuthenticated: Boolean(accessToken),
    });
  },
  setPendingAccessToken: (accessToken) => {
    writePendingSignUp(true);
    set({ accessToken, isPendingSignUp: true, isAuthenticated: false });
  },
  clear: () => {
    writePendingSignUp(false);
    set({ accessToken: null, isPendingSignUp: false, isAuthenticated: false });
  },
}));
