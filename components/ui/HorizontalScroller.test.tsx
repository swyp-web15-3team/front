import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { HorizontalScroller } from '@/components/ui/HorizontalScroller';

// jsdom은 Pointer Capture API를 구현하지 않아 실제 드래그 조작(pointerdown 등) 시
// "not a function" 에러가 나므로, 테스트에서만 no-op으로 채워준다.
beforeAll(() => {
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

function makeCards(count: number) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="w-40 shrink-0 snap-start">
      {`상품 ${i + 1}`}
    </div>
  ));
}

describe('HorizontalScroller', () => {
  it('전달받은 아이템 수만큼 카드를 렌더링한다', () => {
    render(<HorizontalScroller>{makeCards(3)}</HorizontalScroller>);

    expect(screen.getAllByText(/^상품 \d+$/)).toHaveLength(3);
  });

  it('이전/다음 화살표 버튼을 렌더링한다', () => {
    render(<HorizontalScroller>{makeCards(3)}</HorizontalScroller>);

    expect(screen.getByLabelText('이전')).toBeInTheDocument();
    expect(screen.getByLabelText('다음')).toBeInTheDocument();
  });

  it('다음 화살표를 클릭하면 오른쪽으로 스크롤한다', () => {
    render(<HorizontalScroller>{makeCards(5)}</HorizontalScroller>);

    const track = screen
      .getAllByText(/^상품 \d+$/)[0]
      .closest('.overflow-x-auto') as HTMLDivElement;
    const scrollBySpy = vi.fn();
    track.scrollBy = scrollBySpy;

    fireEvent.click(screen.getByLabelText('다음'));

    expect(scrollBySpy).toHaveBeenCalledWith(
      expect.objectContaining({ left: expect.any(Number) })
    );
    expect(scrollBySpy.mock.calls[0][0].left).toBeGreaterThan(0);
  });

  it('이전 화살표를 클릭하면 왼쪽으로 스크롤한다', () => {
    render(<HorizontalScroller>{makeCards(5)}</HorizontalScroller>);

    const track = screen
      .getAllByText(/^상품 \d+$/)[0]
      .closest('.overflow-x-auto') as HTMLDivElement;
    const scrollBySpy = vi.fn();
    track.scrollBy = scrollBySpy;

    fireEvent.click(screen.getByLabelText('이전'));

    expect(scrollBySpy.mock.calls[0][0].left).toBeLessThan(0);
  });

  it('마우스 드래그로 스크롤 위치가 이동한다', () => {
    render(<HorizontalScroller>{makeCards(5)}</HorizontalScroller>);

    const track = screen
      .getAllByText(/^상품 \d+$/)[0]
      .closest('.overflow-x-auto') as HTMLDivElement;
    Object.defineProperty(track, 'scrollLeft', {
      value: 0,
      writable: true,
    });

    fireEvent.pointerDown(track, { clientX: 200, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 100, pointerId: 1 });

    // 왼쪽으로 100px 드래그하면 스크롤 위치는 오른쪽(양수)으로 이동한다
    expect(track.scrollLeft).toBe(100);

    fireEvent.pointerUp(track, { pointerId: 1 });
  });

  it('드래그 이후에 이어지는 클릭은 무시해 카드 링크 이동을 막는다', () => {
    render(<HorizontalScroller>{makeCards(5)}</HorizontalScroller>);

    const track = screen
      .getAllByText(/^상품 \d+$/)[0]
      .closest('.overflow-x-auto') as HTMLDivElement;
    Object.defineProperty(track, 'scrollLeft', {
      value: 0,
      writable: true,
    });

    fireEvent.pointerDown(track, { clientX: 200, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 100, pointerId: 1 });
    fireEvent.pointerUp(track, { pointerId: 1 });

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    const wasNotPrevented = track.dispatchEvent(clickEvent);

    expect(wasNotPrevented).toBe(false);
  });

  it('dragScroll=false면 포인터 드래그로 스크롤하지 않는다', () => {
    render(
      <HorizontalScroller dragScroll={false}>{makeCards(5)}</HorizontalScroller>
    );

    const track = screen
      .getAllByText(/^상품 \d+$/)[0]
      .closest('.overflow-x-auto') as HTMLDivElement;
    Object.defineProperty(track, 'scrollLeft', { value: 0, writable: true });

    fireEvent.pointerDown(track, { clientX: 200, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 100, pointerId: 1 });

    // 카드의 HTML5 drag를 가로채지 않도록 트랙은 움직이지 않는다
    expect(track.scrollLeft).toBe(0);
  });

  it('showArrows=false면 화살표를 숨긴다', () => {
    render(
      <HorizontalScroller showArrows={false}>{makeCards(3)}</HorizontalScroller>
    );

    expect(screen.queryByLabelText('이전')).not.toBeInTheDocument();
  });
});
