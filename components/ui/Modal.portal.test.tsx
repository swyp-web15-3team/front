import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Modal } from '@/components/ui/Modal';

describe('Modal 포탈', () => {
  it('오버레이가 부모가 아니라 document.body 직계로 붙는다', () => {
    const { container } = render(
      <div id="stacking-parent" style={{ position: 'sticky', zIndex: 50 }}>
        <Modal isOpen onClose={() => {}}>
          <p>내용</p>
        </Modal>
      </div>
    );
    const overlay = screen.getByLabelText('모달 오버레이');
    // 부모(sticky 컨테이너) 안에 없어야 한다
    expect(container.querySelector('[aria-label="모달 오버레이"]')).toBeNull();
    // body 직계 자식이어야 한다
    expect(overlay.parentElement).toBe(document.body);
    expect(screen.getByText('내용')).toBeInTheDocument();
  });

  it('닫혀도 DOM에 남아 exit 애니메이션이 가능하다', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>내용</p>
      </Modal>
    );
    const overlay = screen.getByLabelText('모달 오버레이');
    expect(overlay).toBeInTheDocument();
    expect(overlay.className).toContain('pointer-events-none');
  });
});
