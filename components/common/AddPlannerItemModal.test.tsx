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

  // 콜렉션 모드는 검색만 쓴다. 콜렉션 탭이 보이면 안 된다.
  it('콜렉션 탭을 보여주지 않는다', async () => {
    render(
      <AddPlannerItemModal collection={{ id: 5, name: '위스키 콜렉션' }} />,
      { wrapper }
    );

    await screen.findByText('라가불린 16년');
    expect(screen.queryByRole('button', { name: '콜렉션' })).toBeNull();
    expect(screen.queryByRole('button', { name: '검색' })).toBeNull();
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

  it('판매처 버튼 대신 담기 버튼을 그린다', async () => {
    render(
      <AddPlannerItemModal collection={{ id: 5, name: '위스키 콜렉션' }} />,
      { wrapper }
    );

    await screen.findByText('라가불린 16년');
    expect(screen.queryByRole('button', { name: '판매처' })).toBeNull();
  });
});

describe('AddPlannerItemModal 플래너 모드', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useModalStore.setState({ activeModal: MODAL_ID.ADD_PLANNER_ITEM });
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { data: { collections: [] } },
    });
  });

  // 기존 동작이 그대로여야 한다.
  it('collection prop이 없으면 콜렉션/검색 탭을 보여준다', () => {
    render(<AddPlannerItemModal />, { wrapper });

    expect(screen.getByRole('button', { name: '콜렉션' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
  });
});
