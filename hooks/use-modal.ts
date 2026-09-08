import { useEffect, useState } from 'react';

import type { ModalId } from '@/constants/modal';
import { useModalStore } from '@/store/use-modal-store';

/**
 * 모달 open/close 상태와 exit 애니메이션용 렌더 상태를 관리하는 훅.
 * 한 번에 하나의 모달만 열리며, 모달 UI(디자인)는 각 모달 컴포넌트가 직접 그린다.
 *
 * 사용법
 * 1. constants/modal.ts의 MODAL_ID에 새 모달 id를 추가한다.
 * 2. 모달 컴포넌트에서 useModal(MODAL_ID.XXX)로 isOpen/shouldRender/open/close를 받는다.
 * 3. shouldRender가 false면 null을 반환해 언마운트하고,
 *    isOpen 값으로 열림/닫힘 애니메이션 클래스를 토글한다.
 * 4. 모달을 열어야 하는 곳(버튼 등)에서도 동일하게 useModal(MODAL_ID.XXX)을 호출해 open()을 사용한다.
 *
 * @example
 * // components/common/SampleModal.tsx
 * const MODAL_ID_SAMPLE = MODAL_ID.SAMPLE;
 * export function useSampleModal() {
 *   return useModal(MODAL_ID_SAMPLE);
 * }
 * export function SampleModal() {
 *   const { isOpen, shouldRender, close } = useSampleModal();
 *   if (!shouldRender) return null;
 *   return (
 *     <div className={cn('transition-opacity', isOpen ? 'opacity-100' : 'opacity-0')}>
 *       ...
 *     </div>
 *   );
 * }
 *
 * // 여는 쪽 (다른 컴포넌트)
 * const { open } = useSampleModal();
 * <button onClick={open}>열기</button>
 *
 * 주의
 * - close()는 activeModal을 즉시 null로 바꾸지 않고 isOpen만 false로 만든다.
 *   실제 언마운트는 EXIT_ANIMATION_DURATION_MS 이후 일어나므로,
 *   그 시간은 모달 컴포넌트의 exit transition duration과 맞춰야 한다.
 * - 단일 모달 정책이므로 다른 modalId로 open()을 호출하면 이전 모달은 자동으로 닫힌다.
 */
const EXIT_ANIMATION_DURATION_MS = 200;

export function useModal(modalId: ModalId) {
  const activeModal = useModalStore((state) => state.activeModal);
  const open = useModalStore((state) => state.open);
  const close = useModalStore((state) => state.close);

  const isOpen = activeModal === modalId;
  const [shouldRender, setShouldRender] = useState(isOpen);

  if (isOpen && !shouldRender) {
    setShouldRender(true);
  }

  useEffect(() => {
    if (isOpen || !shouldRender) return;

    const timer = setTimeout(
      () => setShouldRender(false),
      EXIT_ANIMATION_DURATION_MS
    );
    return () => clearTimeout(timer);
  }, [isOpen, shouldRender]);

  return {
    isOpen,
    shouldRender,
    open: () => open(modalId),
    close,
  };
}
