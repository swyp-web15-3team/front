'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useMounted } from '@/hooks/use-mounted';
import { pushEscapeLayer } from '@/lib/escape-stack';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** 배경 오버레이(backdrop)에 추가할 클래스 */
  overlayClassName?: string;
  /** 모달 패널(내용을 감싸는 박스)에 추가할 클래스 */
  panelClassName?: string;
}

const DEFAULT_OVERLAY_CLASSNAME =
  'fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-[var(--glass-tint-scrim)] backdrop-blur-md transition-opacity duration-[280ms] ease-[var(--ease-out-macos)]';
const DEFAULT_PANEL_CLASSNAME =
  'bg-canvas text-fg shadow-overlay w-full max-w-[800px] rounded-xl p-6 transition-[transform,opacity] duration-[280ms] ';

/**
 * 모든 모달이 공유하는 오버레이/패널 레이아웃과 esc 닫힘을 담당하는 공용 컴포넌트.
 * 각 모달은 isOpen/onClose만 useModal에서 받아 넘기고, children으로 내용만 채우면 된다.
 */
export function Modal({
  isOpen,
  onClose,
  children,
  overlayClassName,
  panelClassName,
}: ModalProps) {
  // body로 포탈해서 부모의 stacking context를 벗어난다.
  // (예: Header가 sticky라 그 안의 오버레이는 z를 올려도 BottomNav 위로 못 간다)
  // SSR에는 document가 없으니 마운트 후에만 포탈한다.
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
      aria-label="모달 오버레이"
      className={cn(
        DEFAULT_OVERLAY_CLASSNAME,
        // 닫힌 모달도 DOM에 남아 exit 애니메이션을 그리므로, 클릭을 가로채지 않도록
        // 오버레이와 패널 모두에서 포인터 이벤트를 끈다. (패널에서 빠뜨리면 닫힌 모달의
        // 패널이 나중 형제로 쌓여 열린 모달의 백드롭 클릭을 삼킨다)
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        overlayClassName
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          DEFAULT_PANEL_CLASSNAME,
          isOpen
            ? 'scale-100 opacity-100 ease-[var(--ease-spring)]'
            : 'pointer-events-none scale-95 opacity-0 ease-[var(--ease-out-macos)]',
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
