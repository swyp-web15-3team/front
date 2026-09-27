'use client';

import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import { useModal } from '@/hooks/use-modal';

interface CollectionMenuModalProps {
  /** 기본 관심 목록은 이름 변경/삭제를 막는다. */
  isDefault: boolean;
  onRename: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function useCollectionMenuModal() {
  return useModal(MODAL_ID.COLLECTION_MENU);
}

export function CollectionMenuModal({
  isDefault,
  onRename,
  onEdit,
  onDelete,
}: CollectionMenuModalProps) {
  const { isOpen, close } = useCollectionMenuModal();

  // 메뉴 항목을 누르면 메뉴는 닫고 해당 동작으로 넘어간다.
  // (단일 모달 정책이라 다음 모달을 여는 항목은 open()이 알아서 이 모달을 대체한다)
  const run = (action: () => void) => () => {
    close();
    action();
  };

  const items = [
    { label: '편집하기', onClick: run(onEdit), enabled: true },
    { label: '이름 변경하기', onClick: run(onRename), enabled: !isDefault },
    { label: '삭제하기', onClick: run(onDelete), enabled: !isDefault },
  ].filter((item) => item.enabled);

  return (
    <Modal isOpen={isOpen} onClose={close} panelClassName="max-w-[360px]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">더보기</h2>
        <button type="button" onClick={close} aria-label="닫기">
          ✕
        </button>
      </div>
      <ul className="mt-2">
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={item.onClick}
              className="w-full py-3 text-left text-sm text-gray-600"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
