import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CollectionView } from '@/app/(main)/mypage/collection/_components/CollectionView';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/use-auth-store';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const COLLECTION = { id: 1, name: '위스키 콜렉션', isDefault: false };
const WHISKY = {
  id: 4,
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

describe('CollectionView 편집 모드', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().setAccessToken('token');
    const page = { page: 0, size: 20, totalElements: 1, totalPages: 1 };
    vi.spyOn(apiClient, 'get').mockImplementation(((url: string) => {
      if (url === '/collections') {
        return Promise.resolve({
          data: { data: { collections: [COLLECTION] } },
        });
      }
      // 위스키 목록(GET /whiskies)은 content, 콜렉션 아이템은 items로 내려온다.
      if (url.startsWith('/whiskies')) {
        return Promise.resolve({ data: { data: { content: [], ...page } } });
      }
      return Promise.resolve({ data: { data: { items: [WHISKY], ...page } } });
    }) as typeof apiClient.get);
  });

  async function enterEditMode() {
    render(<CollectionView />, { wrapper });
    await userEvent.click(
      await screen.findByRole('button', { name: '위스키 콜렉션 더보기' })
    );
    await userEvent.click(screen.getByText('편집하기'));
  }

  // 카드 안에 저장 버튼이 있어서 바깥을 button으로 감싸면 DOM 중첩 위반이다.
  it('선택 토글을 카드 저장 버튼 바깥에 중첩하지 않는다', async () => {
    await enterEditMode();

    const nested = document.querySelectorAll('button button');
    expect(nested).toHaveLength(0);
  });

  it('카드를 누르면 선택 상태가 토글된다', async () => {
    await enterEditMode();

    const toggle = screen.getByRole('button', { name: '라가불린 16년 선택' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1개 선택')).toBeInTheDocument();
  });
});
