'use client';

import { Modal } from '@/components/common/Modal';
import { MODAL_ID } from '@/constants/modal';
import { useModal } from '@/hooks/use-modal';

export function useSampleModal2() {
  return useModal(MODAL_ID.SAMPLE2);
}

export function SampleModal2() {
  const { isOpen, close } = useSampleModal2();

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <h2 className="text-lg font-bold">샘플 모달2</h2>
      <p className="mt-2 text-sm text-zinc-500">
        useModal 훅으로 열고 닫히는 샘플 모달입니다.
      </p>
      <button
        onClick={close}
        className="mt-4 rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black"
      >
        닫기
      </button>
    </Modal>
  );
}
