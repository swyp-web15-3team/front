import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { MODAL_ID } from '@/constants/modal';
import { useModal } from '@/hooks/use-modal';
import { useModalStore } from '@/store/use-modal-store';

const OTHER_MODAL_ID = MODAL_ID.SAMPLE2;


describe('useModal', () => {
  beforeEach(() => {
    useModalStore.setState({ activeModal: null });
  });

  it('초기 상태에서는 isOpen이 false다', () => {
    const { result } = renderHook(() => useModal(MODAL_ID.SAMPLE1));

    expect(result.current.isOpen).toBe(false);
  });

  it('open()을 호출하면 isOpen이 true가 된다', () => {
    const { result } = renderHook(() => useModal(MODAL_ID.SAMPLE1));


    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('close()를 호출하면 isOpen이 false가 된다', () => {
    const { result } = renderHook(() => useModal(MODAL_ID.SAMPLE1));

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('단일 모달 정책: 다른 modalId를 열면 이전 모달의 isOpen은 false가 된다', () => {
    const { result: sampleModal } = renderHook(() =>
      useModal(MODAL_ID.SAMPLE1)
    );
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

  it('활성 모달이 아닌 다른 모달의 close()를 호출해도 활성 모달에 영향을 주지 않는다', () => {
    const { result: sampleModal } = renderHook(() =>
      useModal(MODAL_ID.SAMPLE1)
    );
    const { result: otherModal } = renderHook(() => useModal(OTHER_MODAL_ID));

    act(() => {
      sampleModal.current.open();
    });
    expect(sampleModal.current.isOpen).toBe(true);

    act(() => {
      otherModal.current.close();
    });

    expect(sampleModal.current.isOpen).toBe(true);
  });
});
