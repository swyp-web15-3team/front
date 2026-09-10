import { act, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductGrid } from '@/app/(main)/search/_components/ProductGrid';
import { Product } from '@/types/product';

let latestObserverCallback: IntersectionObserverCallback | null = null;
const observeSpy = vi.fn();
const disconnectSpy = vi.fn();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    latestObserverCallback = callback;
  }

  observe = observeSpy;
  unobserve = () => {};
  disconnect = disconnectSpy;
  takeRecords = () => [];
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

beforeEach(() => {
  latestObserverCallback = null;
  observeSpy.mockClear();
  disconnectSpy.mockClear();
});

function makeItems(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    imageUrl: 'https://placehold.co/200x150.png',
    name: `상품 ${i + 1}`,
    originalName: 'Original',
    discountRate: -10,
    krPrice: 10000,
    jpPrice: 9000,
    jpPriceYen: 900,
  }));
}

function fireIntersection(isIntersecting: boolean) {
  act(() => {
    latestObserverCallback?.(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
  });
}

describe('ProductGrid', () => {
  // jsdom은 실제 레이아웃 엔진이 없어 getBoundingClientRect/clientHeight가 항상 0이라,
  // 실제로 몇 개 행이 가상화되는지는 검증할 수 없다. 대량 데이터에서도 에러 없이
  // 렌더링되는지만 스모크 테스트로 확인한다.
  it('아이템이 많아도 에러 없이 렌더링된다', () => {
    const items = makeItems(200);

    render(
      <ProductGrid
        items={items}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={() => {}}
      />
    );

    expect(screen.getAllByText(/^상품 \d+$/).length).toBeGreaterThan(0);
  });

  it('hasNextPage가 false면 마지막 상품 안내 문구를 보여준다', () => {
    const items = makeItems(5);

    render(
      <ProductGrid
        items={items}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={() => {}}
      />
    );

    expect(screen.getByText('마지막 상품입니다')).toBeInTheDocument();
  });

  it('isFetchingNextPage면 로딩 문구를 보여준다', () => {
    const items = makeItems(5);

    render(
      <ProductGrid
        items={items}
        hasNextPage={true}
        isFetchingNextPage={true}
        onLoadMore={() => {}}
      />
    );

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });

  it('sentinel이 교차하면 onLoadMore를 호출한다', () => {
    const onLoadMore = vi.fn();

    render(
      <ProductGrid
        items={makeItems(5)}
        hasNextPage={true}
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
      />
    );

    expect(observeSpy).toHaveBeenCalled();

    fireIntersection(true);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('sentinel이 교차 영역을 벗어나면 onLoadMore를 호출하지 않는다', () => {
    const onLoadMore = vi.fn();

    render(
      <ProductGrid
        items={makeItems(5)}
        hasNextPage={true}
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
      />
    );

    fireIntersection(false);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('hasNextPage가 false면 observer를 아예 생성하지 않는다', () => {
    render(
      <ProductGrid
        items={makeItems(5)}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={() => {}}
      />
    );

    expect(observeSpy).not.toHaveBeenCalled();
  });

  it('isFetchingNextPage인 동안엔 observer를 생성하지 않는다', () => {
    render(
      <ProductGrid
        items={makeItems(5)}
        hasNextPage={true}
        isFetchingNextPage={true}
        onLoadMore={() => {}}
      />
    );

    expect(observeSpy).not.toHaveBeenCalled();
  });
});
