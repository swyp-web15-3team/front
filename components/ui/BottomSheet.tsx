'use client';

import { useEffect } from 'react';

import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** 배경 오버레이(backdrop)에 추가할 클래스 */
  overlayClassName?: string;
  /** 시트 패널(내용을 감싸는 박스)에 추가할 클래스 */
  panelClassName?: string;
}

const DEFAULT_OVERLAY_CLASSNAME =
  'fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm duration-300';
const DEFAULT_PANEL_CLASSNAME =
  'w-full max-w-[800px] rounded-t-xl bg-white p-6 shadow-lg duration-300 ';

/**
 * 모든 바텀시트가 공유하는 오버레이/패널 레이아웃과 esc 닫힘을 담당하는 공용 컴포넌트.
 * Modal과 동일한 인터페이스이지만 별도 스토어(useBottomSheet)로 열림 상태를 관리해
 * 모달과 바텀시트가 동시에 열릴 수 있다.
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  overlayClassName,
  panelClassName,
}: BottomSheetProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      aria-label="바텀시트 오버레이"
      className={cn(
        DEFAULT_OVERLAY_CLASSNAME,
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        overlayClassName
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          DEFAULT_PANEL_CLASSNAME,
          isOpen ? 'translate-y-0' : 'translate-y-full',
          panelClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
