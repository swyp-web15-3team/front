import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddPlannerItemModal } from '@/components/common/AddPlannerItemModal';
import { MODAL_ID } from '@/constants/modal';
import { apiClient } from '@/lib/api/client';
import { useModalStore } from '@/store/use-modal-store';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

const WHISKY = {
  id: 101,
  name: '라가불린 16년',
  volumeMl: 700,
  abv: 43,
  category: { id: 1, name: '싱글몰트' },
  kr: null,
  jp: null,
  comparison: null,
  origin: null,
  region: null,
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('AddPlannerItemModal 콜렉션 모드', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useModalStore.setState({ activeModal: MODAL_ID.ADD_PLANNER_ITEM });
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        data: {
          content: [WHISKY],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
        },
      },
    });
  });

  // 콜렉션 모드는 검색만 쓴다. 왼쪽 출처 목록이 보이면 안 된다.
  it('출처 목록을 보여주지 않는다', async () => {
    render(
      <AddPlannerItemModal collection={{ id: 5, name: '위스키 콜렉션' }} />,
      { wrapper }
    );

    await screen.findByText('라가불린 16년');
    expect(screen.queryByRole('button', { name: /전체 검색/ })).toBeNull();
  });

  // 판매처/수량이 아니라 위스키 단위로 한 개씩 담는다.
  it('담기를 누르면 그 위스키 하나만 바로 추가한다', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { data: {} } });

    render(
      <AddPlannerItemModal collection={{ id: 5, name: '위스키 콜렉션' }} />,
      { wrapper }
    );

    await userEvent.click(await screen.findByRole('button', { name: '담기' }));

    expect(post).toHaveBeenCalledWith('/collections/5/whiskies', {
      whiskyId: 101,
    });
    // 같은 항목을 다시 담지 못하게 잠긴다.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '담김' })).toBeDisabled()
    );
  });

  it('체크박스 대신 담기 버튼을 그린다', async () => {
    render(
      <AddPlannerItemModal collection={{ id: 5, name: '위스키 콜렉션' }} />,
      { wrapper }
    );

    await screen.findByText('라가불린 16년');
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});

describe('AddPlannerItemModal 플래너 모드', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useModalStore.setState({ activeModal: MODAL_ID.ADD_PLANNER_ITEM });
    // /collections 는 콜렉션 목록, /whiskies 는 검색 결과를 내려준다.
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url.startsWith('/collections')) {
        return { data: { data: { collections: [] } } };
      }
      if (url === `/whiskies/${WHISKY.id}`) {
        return {
          data: {
            data: {
              ...WHISKY,
              saleProducts: [
                {
                  id: 901,
                  retailerName: '비싼 곳',
                  countryCode: 'JP',
                  isDutyFree: false,
                  productUrl: '',
                  isSoldOut: false,
                  price: { amount: 2000, currency: 'JPY', amountKrw: 20000 },
                },
                {
                  id: 902,
                  retailerName: '싼 곳',
                  countryCode: 'JP',
                  isDutyFree: false,
                  productUrl: '',
                  isSoldOut: false,
                  price: { amount: 1000, currency: 'JPY', amountKrw: 10000 },
                },
                {
                  id: 903,
                  retailerName: '품절',
                  countryCode: 'JP',
                  isDutyFree: false,
                  productUrl: '',
                  isSoldOut: true,
                  price: { amount: 10, currency: 'JPY', amountKrw: 100 },
                },
              ],
            },
          },
        };
      }
      return {
        data: {
          data: {
            content: [WHISKY],
            page: 0,
            size: 20,
            totalElements: 1,
            totalPages: 1,
          },
        },
      };
    });
  });

  it('collection prop이 없으면 전체 검색 출처를 보여준다', async () => {
    render(<AddPlannerItemModal />, { wrapper });

    expect(
      await screen.findByRole('button', { name: /전체 검색/ })
    ).toBeInTheDocument();
  });

  // 모달은 위스키만 고르고, 판매처는 최저가로 자동 선택된다(품절 제외).
  it('체크한 위스키를 최저가 판매처로 추가한다', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { data: { items: [] } } });

    render(<AddPlannerItemModal />, { wrapper });

    await userEvent.click(await screen.findByRole('checkbox'));
    await userEvent.click(
      screen.getByRole('button', { name: '1개 상품 추가하기' })
    );

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/planners/items', {
        items: [{ saleProductId: 902 }],
      })
    );
  });
});
