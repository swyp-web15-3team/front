import { create } from 'zustand';

import type { BottomSheetId } from '@/constants/bottom-sheet';

interface BottomSheetState {
  activeBottomSheet: BottomSheetId | null;
  payload: unknown;
  open: (bottomSheetId: BottomSheetId, payload?: unknown) => void;
  close: (bottomSheetId: BottomSheetId) => void;
}

export const useBottomSheetStore = create<BottomSheetState>((set) => ({
  activeBottomSheet: null,
  payload: null,
  open: (bottomSheetId, payload) =>
    set({ activeBottomSheet: bottomSheetId, payload: payload ?? null }),
  close: (bottomSheetId) =>
    set((state) =>
      state.activeBottomSheet === bottomSheetId
        ? { activeBottomSheet: null, payload: null }
        : state
    ),
}));
