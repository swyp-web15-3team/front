import { create } from 'zustand';

import type { ModalId } from '@/constants/modal';

interface ModalState {
  activeModal: ModalId | null;
  open: (modalId: ModalId) => void;
  close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  open: (modalId) => set({ activeModal: modalId }),
  close: () => set({ activeModal: null }),
}));
