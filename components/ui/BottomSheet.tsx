'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useMounted } from '@/hooks/use-mounted';
import { pushEscapeLayer } from '@/lib/escape-stack';
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
  'fixed inset-0 z-[var(--z-overlay)] flex items-end justify-center bg-[var(--glass-tint-scrim)] backdrop-blur-md transition-opacity duration-[280ms] ease-[var(--ease-out-macos)]';
const DEFAULT_PANEL_CLASSNAME =
  'bg-canvas text-fg shadow-overlay w-full max-w-[800px] rounded-t-[var(--radius-xxl)] p-6 transition-transform duration-[420ms] ';

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
  // Modal과 동일: body로 포탈해 부모 stacking context를 벗어난다.
  const isMounted = useMounted();

  useEffect(() => {
    if (!isOpen) return;

    const layer = pushEscapeLayer();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && layer.isTopLayer()) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      layer.pop();
    };
  }, [isOpen, onClose]);

  const overlay = (
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
          isOpen
            ? 'translate-y-0 ease-[var(--ease-spring)]'
            : 'translate-y-full ease-[var(--ease-out-macos)]',
          panelClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  if (!isMounted) return null;
  return createPortal(overlay, document.body);
}
