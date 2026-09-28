import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VerticalCard } from '@/components/ui/VerticalCard';
import { useAuthStore } from '@/store/use-auth-store';

const openSaveItemModal = vi.fn();
vi.mock('@/components/common/SaveItemModal', () => ({
  useSaveItemModal: () => ({ open: openSaveItemModal }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const PRODUCT = {
  id: 7,
  imageUrl: '',
  name: '발베니 12년',
  originalName: 'Balvenie 12',
  discountRate: 0,
  krPrice: 120000,
  jpPrice: 0,
};

describe('VerticalCard 저장 버튼', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setAccessToken('token');
  });

  // 콜렉션 페이지: 담긴 항목이라 이미 '저장됨'으로 보여야 한다.
  it('isSaved면 저장됨 상태로 그린다', () => {
    render(<VerticalCard product={PRODUCT} isSaved onUnsave={vi.fn()} />);

    const button = screen.getByRole('button', { name: '콜렉션에서 빼기' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  // 저장된 항목을 다시 누르면 모달이 아니라 제거가 실행돼야 한다.
  it('저장됨 상태에서 누르면 모달 대신 onUnsave를 부른다', async () => {
    const onUnsave = vi.fn();
    render(<VerticalCard product={PRODUCT} isSaved onUnsave={onUnsave} />);

    await userEvent.click(
      screen.getByRole('button', { name: '콜렉션에서 빼기' })
    );

    expect(onUnsave).toHaveBeenCalledTimes(1);
    expect(openSaveItemModal).not.toHaveBeenCalled();
  });

  // 기존 화면(목록/검색)의 동작은 그대로여야 한다.
  it('저장 안 된 상태에서 누르면 저장 모달을 연다', async () => {
    render(<VerticalCard product={PRODUCT} />);

    await userEvent.click(screen.getByRole('button', { name: '저장하기' }));

    expect(openSaveItemModal).toHaveBeenCalledWith({
      id: 7,
      name: '발베니 12년',
      originalName: 'Balvenie 12',
      imageUrl: '',
    });
  });

  it('제거 요청 중에는 버튼을 잠근다', () => {
    render(
      <VerticalCard product={PRODUCT} isSaved onUnsave={vi.fn()} isUnsaving />
    );

    expect(
      screen.getByRole('button', { name: '콜렉션에서 빼기' })
    ).toBeDisabled();
  });
});
