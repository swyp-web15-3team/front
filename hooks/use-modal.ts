import type { ModalId } from '@/constants/modal';
import { useModalStore } from '@/store/use-modal-store';

/**
 * 모달 open/close 상태만 관리하는 훅. 렌더링 타이밍, exit 애니메이션 등은
 * components/common/Modal이 전담하므로 이 훅은 activeModal 여부만 다룬다.
 * 한 번에 하나의 모달만 열린다(단일 모달 정책).
 *
 * 사용법
 * 1. constants/modal.ts의 MODAL_ID에 새 모달 id를 추가한다.
 * 2. 모달 컴포넌트에서 useModal(MODAL_ID.XXX)로 isOpen/open/close를 받는다.
 * 3. isOpen/close를 components/common/Modal에 그대로 넘기고, children으로 내용을 채운다.
 * 4. 모달을 열어야 하는 곳(버튼 등)에서도 동일하게 useModal(MODAL_ID.XXX)을 호출해 open()을 사용한다.
 *
 * @example
 * // components/common/SampleModal.tsx
 * export function useSampleModal() {
 *   return useModal(MODAL_ID.SAMPLE);
 * }
 * export function SampleModal() {
 *   const { isOpen, close } = useSampleModal();
 *   return (
 *     <Modal isOpen={isOpen} onClose={close}>
 *       ...
 *     </Modal>
 *   );
 * }
 *
 * // 여는 쪽 (다른 컴포넌트)
 * const { open } = useSampleModal();
 * <button onClick={open}>열기</button>
 *
 * 주의
 * - 단일 모달 정책이므로 다른 modalId로 open()을 호출하면 이전 모달은 자동으로 닫힌다.
 * - close()는 activeModal이 자신의 modalId일 때만 null로 바꾼다.
 */
export function useModal(modalId: ModalId) {
  const activeModal = useModalStore((state) => state.activeModal);
  const open = useModalStore((state) => state.open);
  const close = useModalStore((state) => state.close);

  return {
    isOpen: activeModal === modalId,
    open: () => open(modalId),
    close: () => close(modalId),
  };
}
