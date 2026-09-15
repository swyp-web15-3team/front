import { create } from 'zustand';

interface PlannerBoardState {
  // 구매 리스트에 올라간 plannerItemId 집합. 없는 항목은 후보 상품으로 취급.
  purchaseIds: Set<number>;
  moveToPurchase: (plannerItemId: number) => void;
  moveToCandidate: (plannerItemId: number) => void;
}

export const usePlannerBoardStore = create<PlannerBoardState>((set) => ({
  purchaseIds: new Set(),
  moveToPurchase: (plannerItemId) =>
    set((state) => ({
      purchaseIds: new Set(state.purchaseIds).add(plannerItemId),
    })),
  moveToCandidate: (plannerItemId) =>
    set((state) => {
      const next = new Set(state.purchaseIds);
      next.delete(plannerItemId);
      return { purchaseIds: next };
    }),
}));
