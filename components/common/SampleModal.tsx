'use client';

import { MODAL_ID } from '@/constants/modal';
import { useModal } from '@/hooks/use-modal';
import { cn } from '@/lib/utils';

export function useSampleModal() {
  return useModal(MODAL_ID.SAMPLE);
}

export function SampleModal() {
  const { isOpen, shouldRender, close } = useSampleModal();

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
      onClick={close}
    >
      <div
        className={cn(
          'w-full max-w-sm rounded-lg bg-white p-6 shadow-lg transition-all duration-200 dark:bg-zinc-900',
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">샘플 모달</h2>
        <p className="mt-2 text-sm text-zinc-500">
          useModal 훅으로 열고 닫히는 샘플 모달입니다.
        </p>
        <button
          onClick={close}
          className="mt-4 rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
