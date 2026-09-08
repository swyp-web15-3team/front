import { create } from 'zustand';

import type { ModalId } from '@/constants/modal';

interface ModalState {
  activeModal: ModalId | null;
  open: (modalId: ModalId) => void;
  close: (modalId: ModalId) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  open: (modalId) => set({ activeModal: modalId }),
  close: (modalId) =>
    set((state) =>
      state.activeModal === modalId ? { activeModal: null } : state
    ),
}));
