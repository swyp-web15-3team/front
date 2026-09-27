'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import { useModal } from '@/hooks/use-modal';

export function useSampleModal1() {
  return useModal(MODAL_ID.SAMPLE1);
}

export function SampleModal1() {
  const { isOpen, close } = useSampleModal1();

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <h2 className="text-section-title">샘플 모달1</h2>
      <p className="text-body-sm text-fg-muted mt-2">
        useModal 훅으로 열고 닫히는 샘플 모달입니다.
      </p>
      <Button variant="secondary" onClick={close} className="mt-4">
        닫기
      </Button>
    </Modal>
  );
}
