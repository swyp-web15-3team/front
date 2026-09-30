import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovePlannerItemModal } from '@/app/(main)/planner/_components/MovePlannerItemModal';
import { MODAL_ID } from '@/constants/modal';
import { apiClient } from '@/lib/api/client';
import { useModalStore } from '@/store/use-modal-store';
import { PlannerItemGroup } from '@/types/planner';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

function makeCandidate(
  saleProductId: number,
  whiskyName: string
): PlannerItemGroup {
  return {
    plannerItemId: saleProductId * 10,
    listType: 'CANDIDATE',
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

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('MovePlannerItemModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useModalStore.setState({ activeModal: MODAL_ID.MOVE_PLANNER_ITEM });
  });

  // 검색이 아니라 이미 담아둔 후보 중에서 고른다.
  it('구매 후보 목록만 보여준다', () => {
    render(
      <MovePlannerItemModal
        candidates={[makeCandidate(501, '라가불린 16년')]}
      />,
      { wrapper }
    );

    expect(screen.getByText('라가불린 16년')).toBeInTheDocument();
    // 위스키를 새로 찾는 검색창은 없다
    expect(screen.queryByRole('searchbox')).toBeNull();
  });

  it('후보가 없으면 안내를 보여준다', () => {
    render(<MovePlannerItemModal candidates={[]} />, { wrapper });

    expect(
      screen.getByText('구매 후보 목록이 비어 있어요.')
    ).toBeInTheDocument();
  });

  // 서버 move는 saleProductId 하나씩만 받아서 고른 개수만큼 호출된다.
  it('선택한 항목을 구매 예정으로 옮긴다', async () => {
    const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: {} });

    render(
      <MovePlannerItemModal
        candidates={[
          makeCandidate(501, '라가불린 16년'),
          makeCandidate(502, '맥캘란 12년'),
        ]}
      />,
      { wrapper }
    );

    await userEvent.click(
      screen.getByRole('checkbox', { name: '라가불린 16년' })
    );
    await userEvent.click(
      screen.getByRole('checkbox', { name: '맥캘란 12년' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: '2개 상품 추가하기' })
    );

    await waitFor(() => expect(patch).toHaveBeenCalledTimes(2));
    expect(patch).toHaveBeenCalledWith('/planners/move', {
      fromListType: 'CANDIDATE',
      toListType: 'PURCHASE',
      saleProductId: 501,
    });
    expect(patch).toHaveBeenCalledWith('/planners/move', {
      fromListType: 'CANDIDATE',
      toListType: 'PURCHASE',
      saleProductId: 502,
    });
  });

  it('아무것도 고르지 않으면 추가할 수 없다', () => {
    render(
      <MovePlannerItemModal
        candidates={[makeCandidate(501, '라가불린 16년')]}
      />,
      { wrapper }
    );

    expect(
      screen.getByRole('button', { name: '0개 상품 추가하기' })
    ).toBeDisabled();
  });
});
