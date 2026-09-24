'use client';

import { useState } from 'react';

import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import type { useRenameCollectionMutation } from '@/hooks/queries/use-collection';
import { useModal } from '@/hooks/use-modal';
import {
  COLLECTION_NAME_MAX_LENGTH,
  getCollectionErrorMessage,
} from '@/lib/api/collection';

interface RenameCollectionModalProps {
  collectionId: number | null;
  initialName: string;
  renameCollectionMutation: ReturnType<typeof useRenameCollectionMutation>;
}

export function useRenameCollectionModal() {
  return useModal(MODAL_ID.RENAME_COLLECTION);
}

export function RenameCollectionModal({
  collectionId,
  initialName,
  renameCollectionMutation,
}: RenameCollectionModalProps) {
  const { isOpen, close } = useRenameCollectionModal();
  const [name, setName] = useState(initialName);
  const { mutate, isPending, isError, error, reset } = renameCollectionMutation;

  const handleClose = () => {
    reset();
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || collectionId === null) return;

    mutate({ collectionId, name: name.trim() }, { onSuccess: handleClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold">관심 그룹 이름 변경</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="관심 그룹 이름을 입력하세요"
          maxLength={COLLECTION_NAME_MAX_LENGTH}
          autoFocus
          className="mt-4 w-full rounded-md border px-3 py-2 text-sm"
        />
        {isError && (
          <p className="mt-1 text-xs text-red-500">
            {getCollectionErrorMessage(error)}
          </p>
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
            disabled={!name.trim() || isPending}
            className="w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black disabled:opacity-50"
          >
            완료
          </button>
        </div>
      </form>
    </Modal>
  );
}
