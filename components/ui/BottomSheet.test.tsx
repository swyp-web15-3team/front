import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Modal } from '@/components/ui/Modal';

describe('BottomSheet', () => {
  it('isOpen이 false면 오버레이가 보이지 않는 상태로 렌더링된다', () => {
    render(
      <BottomSheet isOpen={false} onClose={vi.fn()}>
        내용
      </BottomSheet>
    );

    const overlay = screen.getByLabelText('바텀시트 오버레이');

    expect(overlay.className).toContain('opacity-0');
    expect(overlay.className).toContain('pointer-events-none');
  });

  it('isOpen이 true면 children을 렌더링하고 오버레이가 보이는 상태가 된다', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        내용
      </BottomSheet>
    );

    expect(screen.getByText('내용')).toBeInTheDocument();
    expect(screen.getByLabelText('바텀시트 오버레이').className).toContain(
      'opacity-100'
    );
  });

  it('오버레이 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <button>버튼</button>
      </BottomSheet>
    );

    act(() => {
      screen.getByLabelText('바텀시트 오버레이').click();
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('패널 클릭은 onClose를 호출하지 않는다(전파 차단)', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <button>버튼</button>
      </BottomSheet>
    );

    act(() => {
      screen.getByText('버튼').click();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('Escape 키를 누르면 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        내용
      </BottomSheet>
    );

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('언마운트 이후에는 Escape를 눌러도 onClose가 호출되지 않는다', () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <BottomSheet isOpen={true} onClose={onClose}>
        내용
      </BottomSheet>
    );

    unmount();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('바텀시트 위에 모달이 열려있으면 Escape는 모달만 닫는다', () => {
    const onCloseSheet = vi.fn();
    const onCloseModal = vi.fn();
    render(
      <>
        <BottomSheet isOpen={true} onClose={onCloseSheet}>
          시트 내용
        </BottomSheet>
        <Modal isOpen={true} onClose={onCloseModal}>
          모달 내용
        </Modal>
      </>
    );

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onCloseModal).toHaveBeenCalled();
    expect(onCloseSheet).not.toHaveBeenCalled();
  });

  it('overlayClassName/panelClassName을 병합한다', () => {
    render(
      <BottomSheet
        isOpen={true}
        onClose={vi.fn()}
        overlayClassName="custom-overlay"
        panelClassName="custom-panel"
      >
        내용
      </BottomSheet>
    );

    const panel = screen.getByText('내용');
    const overlay = screen.getByLabelText('바텀시트 오버레이');

    expect(overlay.className).toContain('custom-overlay');
    expect(panel.className).toContain('custom-panel');
  });
});
