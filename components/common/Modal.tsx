'use client';

import { useEffect, useRef, useState } from 'react';

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
  'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm duration-300';
const DEFAULT_PANEL_CLASSNAME =
  'w-full max-w-[800px] rounded-lg bg-white p-6 shadow-lg duration-300 dark:bg-zinc-900';

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
      aria-label="모달 오버레이"
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
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          panelClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
