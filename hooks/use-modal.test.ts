import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MODAL_ID } from '@/constants/modal';
import { useModal } from '@/hooks/use-modal';
import { useModalStore } from '@/store/use-modal-store';

const EXIT_ANIMATION_DURATION_MS = 200;
const OTHER_MODAL_ID = 'other-modal' as typeof MODAL_ID.SAMPLE;

describe('useModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useModalStore.setState({ activeModal: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 isOpen과 shouldRender가 모두 false다', () => {
    const { result } = renderHook(() => useModal(MODAL_ID.SAMPLE));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.shouldRender).toBe(false);
  });

  it('open()을 호출하면 isOpen과 shouldRender가 즉시 true가 된다', () => {
    const { result } = renderHook(() => useModal(MODAL_ID.SAMPLE));

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.shouldRender).toBe(true);
  });

  it('close() 직후에는 isOpen만 false가 되고 shouldRender는 true로 유지된다', () => {
    const { result } = renderHook(() => useModal(MODAL_ID.SAMPLE));

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.shouldRender).toBe(true);
  });

  it('EXIT_ANIMATION_DURATION_MS가 지나면 shouldRender가 false가 된다', () => {
    const { result } = renderHook(() => useModal(MODAL_ID.SAMPLE));

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.close();
    });
    act(() => {
      vi.advanceTimersByTime(EXIT_ANIMATION_DURATION_MS);
    });

    expect(result.current.shouldRender).toBe(false);
  });

  it('단일 모달 정책: 다른 modalId를 열면 이전 모달의 isOpen은 false가 된다', () => {
    const { result: sampleModal } = renderHook(() => useModal(MODAL_ID.SAMPLE));
    const { result: otherModal } = renderHook(() => useModal(OTHER_MODAL_ID));

    act(() => {
      sampleModal.current.open();
    });
    expect(sampleModal.current.isOpen).toBe(true);

    act(() => {
      otherModal.current.open();
    });

    expect(otherModal.current.isOpen).toBe(true);
    expect(sampleModal.current.isOpen).toBe(false);
  });

  it('shouldRender가 false로 떨어지기 전에 다시 열면 exit 타이머가 취소되고 즉시 열린 상태로 복귀한다', () => {
    const { result } = renderHook(() => useModal(MODAL_ID.SAMPLE));

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.close();
    });
    act(() => {
      vi.advanceTimersByTime(EXIT_ANIMATION_DURATION_MS - 1);
    });
    act(() => {
      result.current.open();
    });
    act(() => {
      vi.advanceTimersByTime(EXIT_ANIMATION_DURATION_MS);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.shouldRender).toBe(true);
  });
});
