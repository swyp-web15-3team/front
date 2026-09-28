'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import type { useRenameCollectionMutation } from '@/hooks/queries/use-collection';
import { useModal } from '@/hooks/use-modal';
import { COLLECTION_NAME_MAX_LENGTH } from '@/lib/api/collection';

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
        <h2 className="text-section-title">관심 그룹 이름 변경</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="관심 그룹 이름을 입력하세요"
          maxLength={COLLECTION_NAME_MAX_LENGTH}
          autoFocus
          className="border-border-strong text-body bg-canvas text-fg mt-4 w-full rounded-md border px-3 py-2.5"
        />
        {isError && (
          <p className="text-caption text-danger mt-1">{error.message}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" fullWidth onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" fullWidth disabled={!name.trim() || isPending}>
            완료
          </Button>
        </div>
      </form>
    </Modal>
  );
}
