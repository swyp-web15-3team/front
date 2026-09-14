'use client';

import { useState } from 'react';

import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import type { useCreateCollectionMutation } from '@/hooks/queries/use-collection';
import { useModal } from '@/hooks/use-modal';

interface CreateCollectionModalProps {
  createCollectionMutation: ReturnType<typeof useCreateCollectionMutation>;
  onCreated?: (collectionId: number) => void;
}

export function useCreateCollectionModal() {
  return useModal(MODAL_ID.CREATE_COLLECTION);
}

export function CreateCollectionModal({
  createCollectionMutation,
  onCreated,
}: CreateCollectionModalProps) {
  const { isOpen, close } = useCreateCollectionModal();
  const [name, setName] = useState('');
  const { mutate } = createCollectionMutation;

  const handleClose = () => {
    setName('');
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // 응답을 기다리지 않고 모달은 즉시 닫는다.
    // 성공/실패에 따른 낙관적 UI 반영은 SaveItemBottomSheet가 mutation 상태로 그린다.
    mutate(name.trim(), {
      onSuccess: (collection) => {
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
          autoFocus
          className="mt-4 w-full rounded-md border px-3 py-2 text-sm"
        />
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
