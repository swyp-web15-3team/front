import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PlannerList } from '@/app/(main)/planner/_components/PlannerList';
import { PlannerItemGroup } from '@/types/planner';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

const BASE_PROPS = {
  title: '구매 예정 목록',
  listType: 'PURCHASE' as const,
  items: [],
  emptyMessage: '비었어요',
  draggingId: null,
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onDrop: vi.fn(),
  onDelete: vi.fn(),
  onAdd: vi.fn(),
  onIncrement: vi.fn(),
  onDecrement: vi.fn(),
  onChangeSaleProduct: vi.fn(),
};

describe('PlannerList 추가하기 버튼', () => {
  // 구매 예정은 후보에서 가져오므로 후보가 비면 열 게 없다.
  it('isAddDisabled면 비활성화된다', () => {
    render(<PlannerList {...BASE_PROPS} isAddDisabled />, { wrapper });

    expect(screen.getByRole('button', { name: '추가하기' })).toBeDisabled();
  });

  it('기본값은 활성화다', () => {
    render(<PlannerList {...BASE_PROPS} />, { wrapper });

    expect(screen.getByRole('button', { name: '추가하기' })).toBeEnabled();
  });
});

function makeItem(saleProductId: number, whiskyName: string): PlannerItemGroup {
  return {
    plannerItemId: saleProductId * 10,
    listType: 'PURCHASE',
    saleProductId,
    whiskyId: saleProductId,
    whiskyName,
    category: { id: 9, name: '블렌디드' },
    volumeMl: 700,
    abv: 43,
    retailerId: 1,
    retailerName: '판매처',
    countryCode: 'JP',
    isDutyFree: false,
    productUrl: null,
    isSoldOut: false,
    price: {
      amount: 10000,
      currency: 'JPY',
      amountKrw: 100000,
      collectedAt: '',
      stale: false,
    },
    exchange: null,
    computable: true,
    quantity: 1,
    plannerItemIds: [saleProductId * 10],
  };
}

describe('PlannerList 편집 모드', () => {
  it('목록이 비면 편집하기를 막는다', () => {
    render(<PlannerList {...BASE_PROPS} items={[]} />, { wrapper });

    expect(screen.getByRole('button', { name: '편집하기' })).toBeDisabled();
  });

  it('항목이 있으면 편집하기를 누를 수 있다', () => {
    render(
      <PlannerList {...BASE_PROPS} items={[makeItem(501, '라가불린')]} />,
      {
        wrapper,
      }
    );

    expect(screen.getByRole('button', { name: '편집하기' })).toBeEnabled();
  });

  // 편집 모드에선 편집하기가 삭제하기로, 추가하기가 완료로 바뀐다.
  it('편집하면 삭제하기와 완료 버튼이 나온다', async () => {
    render(
      <PlannerList {...BASE_PROPS} items={[makeItem(501, '라가불린')]} />,
      {
        wrapper,
      }
    );

    await userEvent.click(screen.getByRole('button', { name: '편집하기' }));

    expect(screen.queryByRole('button', { name: '추가하기' })).toBeNull();
    expect(screen.getByRole('button', { name: '삭제하기' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument();
  });

  it('고른 상품의 saleProductId를 넘겨 삭제를 요청한다', async () => {
    const onDelete = vi.fn();
    render(
      <PlannerList
        {...BASE_PROPS}
        items={[makeItem(501, '라가불린'), makeItem(502, '맥캘란')]}
        onDelete={onDelete}
      />,
      { wrapper }
    );

    await userEvent.click(screen.getByRole('button', { name: '편집하기' }));
    await userEvent.click(screen.getByRole('checkbox', { name: '라가불린' }));
    await userEvent.click(screen.getByRole('button', { name: '삭제하기' }));

    expect(onDelete).toHaveBeenCalledWith([501]);
    // 삭제 요청 후엔 편집 모드에서 빠져나온다
    expect(
      screen.getByRole('button', { name: '추가하기' })
    ).toBeInTheDocument();
  });

  it('전체 선택으로 모든 상품을 골랐다가 다시 풀 수 있다', async () => {
    const onDelete = vi.fn();
    render(
      <PlannerList
        {...BASE_PROPS}
        items={[makeItem(501, '라가불린'), makeItem(502, '맥캘란')]}
        onDelete={onDelete}
      />,
      { wrapper }
    );

    await userEvent.click(screen.getByRole('button', { name: '편집하기' }));
    const selectAll = screen.getByRole('checkbox', { name: '전체 선택' });

    await userEvent.click(selectAll);
    expect(screen.getByRole('checkbox', { name: '맥캘란' })).toBeChecked();

    await userEvent.click(selectAll);
    expect(
      screen.getByRole('checkbox', { name: '라가불린' })
    ).not.toBeChecked();

    await userEvent.click(selectAll);
    await userEvent.click(screen.getByRole('button', { name: '삭제하기' }));
    expect(onDelete).toHaveBeenCalledWith([501, 502]);
  });

  it('완료하면 선택이 풀린다', async () => {
    render(
      <PlannerList {...BASE_PROPS} items={[makeItem(501, '라가불린')]} />,
      {
        wrapper,
      }
    );

    await userEvent.click(screen.getByRole('button', { name: '편집하기' }));
    await userEvent.click(screen.getByRole('checkbox', { name: '라가불린' }));
    await userEvent.click(screen.getByRole('button', { name: '완료' }));
    await userEvent.click(screen.getByRole('button', { name: '편집하기' }));

    expect(
      screen.getByRole('checkbox', { name: '라가불린' })
    ).not.toBeChecked();
  });

  // 서버 삭제가 반영돼 목록이 비면 편집 모드도 자동으로 풀린다.
  it('마지막 항목이 사라지면 편집 모드에서 빠져나온다', async () => {
    const { rerender } = render(
      <PlannerList {...BASE_PROPS} items={[makeItem(501, '라가불린')]} />,
      { wrapper }
    );

    await userEvent.click(screen.getByRole('button', { name: '편집하기' }));
    expect(
      screen.getByRole('button', { name: '삭제하기' })
    ).toBeInTheDocument();

    rerender(<PlannerList {...BASE_PROPS} items={[]} />);

    expect(screen.queryByRole('button', { name: '삭제하기' })).toBeNull();
    expect(screen.getByRole('button', { name: '편집하기' })).toBeDisabled();
  });
});
