import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { usePlannerBoardStore } from '@/store/use-planner-board-store';

describe('usePlannerBoardStore', () => {
  beforeEach(() => {
    usePlannerBoardStore.setState({ purchaseIds: new Set() });
  });

  it('초기 상태에서는 purchaseIds가 비어있다', () => {
    const { result } = renderHook(() => usePlannerBoardStore());

    expect(result.current.purchaseIds.size).toBe(0);
  });

  it('moveToPurchase를 호출하면 해당 id가 purchaseIds에 추가된다', () => {
    const { result } = renderHook(() => usePlannerBoardStore());

    act(() => {
      result.current.moveToPurchase(1);
    });

    expect(result.current.purchaseIds.has(1)).toBe(true);
  });

  it('moveToCandidate를 호출하면 해당 id가 purchaseIds에서 제거된다', () => {
    const { result } = renderHook(() => usePlannerBoardStore());

    act(() => {
      result.current.moveToPurchase(1);
    });
    act(() => {
      result.current.moveToCandidate(1);
    });

    expect(result.current.purchaseIds.has(1)).toBe(false);
  });

  it('이미 purchaseIds에 있는 id를 다시 moveToPurchase해도 다른 id에 영향을 주지 않는다', () => {
    const { result } = renderHook(() => usePlannerBoardStore());

    act(() => {
      result.current.moveToPurchase(1);
      result.current.moveToPurchase(2);
      result.current.moveToPurchase(1);
    });

    expect(result.current.purchaseIds.has(1)).toBe(true);
    expect(result.current.purchaseIds.has(2)).toBe(true);
    expect(result.current.purchaseIds.size).toBe(2);
  });

  it('purchaseIds에 없는 id를 moveToCandidate해도 에러 없이 기존 상태를 유지한다', () => {
    const { result } = renderHook(() => usePlannerBoardStore());

    act(() => {
      result.current.moveToPurchase(1);
      result.current.moveToCandidate(999);
    });

    expect(result.current.purchaseIds.has(1)).toBe(true);
    expect(result.current.purchaseIds.size).toBe(1);
  });
});
