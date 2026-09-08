import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from '@/components/common/Modal';

function fireTransitionEnd(node: Element) {
  node.dispatchEvent(new Event('transitionend', { bubbles: true }));
}

describe('Modal', () => {
  it('isOpen이 false면 오버레이가 보이지 않는 상태로 렌더링된다', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        내용
      </Modal>
    );

    const panel = screen.getByText('내용');
    const overlay = panel.parentElement as HTMLElement;

    expect(overlay.className).toContain('opacity-0');
    expect(overlay.className).toContain('pointer-events-none');
  });

  it('isOpen이 true면 children을 렌더링한다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        내용
      </Modal>
    );

    expect(screen.getByText('내용')).toBeInTheDocument();
  });

  it('오버레이 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <button>버튼</button>
      </Modal>
    );

    act(() => {
      screen
        .getByText('버튼')
        .closest('[class*="fixed"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('패널 클릭은 onClose를 호출하지 않는다(전파 차단)', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <button>버튼</button>
      </Modal>
    );

    act(() => {
      screen.getByText('버튼').click();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('isOpen이 false가 된 직후에도 transitionend 전까지는 children이 남아있다', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        내용
      </Modal>
    );

    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        내용
      </Modal>
    );

    expect(screen.getByText('내용')).toBeInTheDocument();
  });

  it('패널의 transitionend 이후에도 children은 DOM에 남아있다(언마운트하지 않음)', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        내용
      </Modal>
    );

    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        내용
      </Modal>
    );

    const panel = screen.getByText('내용');

    act(() => {
      fireTransitionEnd(panel);
    });

    expect(screen.getByText('내용')).toBeInTheDocument();
  });

  it('overlayClassName/panelClassName을 병합한다', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        overlayClassName="custom-overlay"
        panelClassName="custom-panel"
      >
        내용
      </Modal>
    );

    const panel = screen.getByText('내용');
    const overlay = panel.parentElement as HTMLElement;

    expect(overlay.className).toContain('custom-overlay');
    expect(panel.className).toContain('custom-panel');
  });
});
