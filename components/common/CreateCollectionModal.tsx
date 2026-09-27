'use client';

import { useState } from 'react';

import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import {
  useCollectionItemQuery,
  useCopyCollectionItemsMutation,
  type useCreateCollectionMutation,
} from '@/hooks/queries/use-collection';
import { useModal } from '@/hooks/use-modal';
import { COLLECTION_NAME_MAX_LENGTH } from '@/lib/api/collection';
import { Collection } from '@/types/collection';

interface CreateCollectionModalProps {
  createCollectionMutation: ReturnType<typeof useCreateCollectionMutation>;
  onCreated?: (collectionId: number) => void;
  /**
   * 넘기면 "기존 목록에서 가져오기" UI가 붙는다. 생성 직후 고른 목록의
   * 위스키를 새 목록으로 복사한다. 저장 모달처럼 복사가 어색한 곳에서는 생략한다.
   */
  copySources?: Collection[];
}

export function useCreateCollectionModal() {
  return useModal(MODAL_ID.CREATE_COLLECTION);
}

export function CreateCollectionModal({
  createCollectionMutation,
  onCreated,
  copySources,
}: CreateCollectionModalProps) {
  const { isOpen, close } = useCreateCollectionModal();
  const [name, setName] = useState('');
  // null이면 "가져오지 않음".
  const [copyFromId, setCopyFromId] = useState<number | null>(null);
  const { mutate } = createCollectionMutation;
  const copyItemsMutation = useCopyCollectionItemsMutation();

  // 고른 목록에 뭐가 들었는지 알아야 복사할 whiskyIds를 만들 수 있다.
  const { data: sourceItems } = useCollectionItemQuery(copyFromId);

  const handleClose = () => {
    setName('');
    setCopyFromId(null);
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // 복사할 항목은 모달을 닫기 전에 확정해 둔다(닫으면 상태가 초기화된다).
    const sourceId = copyFromId;
    const whiskyIds = (sourceItems?.items ?? []).map((item) => item.id);

    // 응답을 기다리지 않고 모달은 즉시 닫는다.
    // 성공/실패에 따른 낙관적 UI 반영은 SaveItemModal이 mutation 상태로 그린다.
    mutate(name.trim(), {
      onSuccess: (collection) => {
        // 복사는 새 목록이 생긴 뒤에야 대상 id를 알 수 있다.
        if (sourceId !== null && whiskyIds.length > 0) {
          copyItemsMutation.mutate({
            collectionId: sourceId,
            targetCollectionId: collection.id,
            whiskyIds,
          });
        }
        onCreated?.(collection.id);
      },
    });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold">새 컬렉션 만들기</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="컬렉션 이름을 입력하세요"
          maxLength={COLLECTION_NAME_MAX_LENGTH}
          autoFocus
          className="mt-4 w-full rounded-md border px-3 py-2 text-sm"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {name.length}/{COLLECTION_NAME_MAX_LENGTH}
        </p>

        {copySources && copySources.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium">기존 목록에서 가져오기</p>
            <p className="mt-0.5 text-xs text-gray-400">
              고른 목록의 위스키가 새 목록에도 담깁니다. 원래 목록은 그대로
              유지됩니다.
            </p>
            <select
              value={copyFromId ?? ''}
              onChange={(e) =>
                setCopyFromId(e.target.value ? Number(e.target.value) : null)
              }
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">가져오지 않음</option>
              {copySources.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
            {copyFromId !== null && (
              <p className="mt-1 text-xs text-gray-500">
                {sourceItems
                  ? `위스키 ${sourceItems.items.length}개를 가져옵니다`
                  : '불러오는 중...'}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black disabled:opacity-50"
          >
            완료
          </button>
        </div>
      </form>
    </Modal>
  );
}
