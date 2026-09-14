import { create } from 'zustand';

import type { BottomSheetId } from '@/constants/bottom-sheet';

interface BottomSheetState {
  activeBottomSheet: BottomSheetId | null;
  open: (bottomSheetId: BottomSheetId) => void;
  close: (bottomSheetId: BottomSheetId) => void;
}

export const useBottomSheetStore = create<BottomSheetState>((set) => ({
  activeBottomSheet: null,
  open: (bottomSheetId) => set({ activeBottomSheet: bottomSheetId }),
  close: (bottomSheetId) =>
    set((state) =>
      state.activeBottomSheet === bottomSheetId
        ? { activeBottomSheet: null }
        : state
    ),
}));
