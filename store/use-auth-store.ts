import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  setAccessToken: (accessToken) =>
    set({ accessToken, isAuthenticated: Boolean(accessToken) }),
  clear: () => set({ accessToken: null, isAuthenticated: false }),
}));
