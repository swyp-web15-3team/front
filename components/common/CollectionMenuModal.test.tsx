import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CollectionMenuModal } from '@/components/common/CollectionMenuModal';
import { MODAL_ID } from '@/constants/modal';
import { useModalStore } from '@/store/use-modal-store';

function renderMenu(isDefault: boolean) {
  const handlers = {
    onEdit: vi.fn(),
    onRename: vi.fn(),
    onDelete: vi.fn(),
  };
  render(<CollectionMenuModal isDefault={isDefault} {...handlers} />);
  return handlers;
}

describe('CollectionMenuModal', () => {
  beforeEach(() => {
    useModalStore.setState({ activeModal: MODAL_ID.COLLECTION_MENU });
  });

  // 기본 관심 목록은 이름 변경/삭제를 막아야 한다.
  it('기본 목록이면 편집하기만 보여준다', () => {
    renderMenu(true);

    expect(screen.getByText('편집하기')).toBeInTheDocument();
    expect(screen.queryByText('이름 변경하기')).not.toBeInTheDocument();
    expect(screen.queryByText('삭제하기')).not.toBeInTheDocument();
  });

  it('일반 목록이면 세 항목을 모두 보여준다', () => {
    renderMenu(false);

    expect(screen.getByText('편집하기')).toBeInTheDocument();
    expect(screen.getByText('이름 변경하기')).toBeInTheDocument();
    expect(screen.getByText('삭제하기')).toBeInTheDocument();
  });

  // 항목을 누르면 메뉴는 닫히고 동작이 실행돼야 한다.
  it('항목을 누르면 메뉴를 닫고 콜백을 부른다', async () => {
    const { onEdit } = renderMenu(false);

    await userEvent.click(screen.getByText('편집하기'));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(useModalStore.getState().activeModal).toBeNull();
  });

  // 이름 변경은 close() 직후 다른 모달을 연다. 단일 모달 정책이라
  // close가 뒤늦게 덮어써서 아무것도 안 열리는 일이 없어야 한다.
  it('이름 변경하기를 누르면 다음 모달이 열린 채로 남는다', async () => {
    const { onRename } = renderMenu(false);
    onRename.mockImplementation(() =>
      useModalStore.getState().open(MODAL_ID.RENAME_COLLECTION)
    );

    await userEvent.click(screen.getByText('이름 변경하기'));

    expect(useModalStore.getState().activeModal).toBe(
      MODAL_ID.RENAME_COLLECTION
    );
  });
});
