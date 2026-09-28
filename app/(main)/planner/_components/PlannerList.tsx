'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { PlannerItemGroup, PlannerListType } from '@/types/planner';

const COLUMNS = [
  '종류',
  '일본 최저가',
  '국내 최저가',
  '가격 차이',
  '용량',
] as const;

function PlannerRow({
  item,
  listType,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  item: PlannerItemGroup;
  listType: PlannerListType;
  isDragging: boolean;
  onDragStart: (plannerItemId: number) => void;
  onDragEnd: () => void;
}) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(item.plannerItemId));
        e.dataTransfer.setData('application/x-planner-from', listType);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(item.plannerItemId);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'grid cursor-grab grid-cols-[1fr_repeat(5,minmax(0,7rem))] items-center gap-2 py-3 transition-opacity active:cursor-grabbing',
        isDragging && 'opacity-40'
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* 이미지 URL은 플래너 응답에 없다. 서버가 내려주면 <Image />로 교체 */}
        <div className="border-border bg-surface-sunken size-14 shrink-0 rounded-md border" />
        <div className="min-w-0">
          <p className="text-body-sm-strong text-fg truncate">
            {item.whiskyName}
            {item.quantity > 1 && (
              <span className="text-fg-muted"> × {item.quantity}</span>
            )}
          </p>
          <p className="text-body-sm text-fg-muted truncate">
            {item.retailerName}
          </p>
        </div>
      </div>
      <span className="text-body-sm text-fg">-</span>
      <span className="text-body-sm text-fg tabular-nums">
        {item.price ? `¥${item.price.amount.toLocaleString('ko-KR')}` : '-'}
      </span>
      <span className="text-body-sm text-fg tabular-nums">-</span>
      <span className="text-body-sm text-fg tabular-nums">-</span>
      <span className="text-body-sm text-fg tabular-nums">
        {item.volumeMl}ml
      </span>
    </li>
  );
}

export interface PlannerListProps {
  title: string;
  listType: PlannerListType;
  items: PlannerItemGroup[];
  emptyMessage: string;
  draggingId: number | null;
  onDragStart: (plannerItemId: number) => void;
  onDragEnd: () => void;
  onDrop: (plannerItemId: number, from: PlannerListType) => void;
  onEdit: () => void;
  onAdd: () => void;
}

/** 목록 하나. 드래그로 다른 목록에서 항목을 받아온다. */
export function PlannerList({
  title,
  listType,
  items,
  emptyMessage,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
  onEdit,
  onAdd,
}: PlannerListProps) {
  const [isOver, setIsOver] = useState(false);

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const plannerItemId = Number(e.dataTransfer.getData('text/plain'));
        const from = e.dataTransfer.getData(
          'application/x-planner-from'
        ) as PlannerListType;
        if (!plannerItemId || from === listType) return;
        onDrop(plannerItemId, from);
      }}
      className={cn(
        'rounded-lg transition-colors',
        isOver && 'bg-surface-muted ring-primary ring-2'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-section-title text-fg">{title}</h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onEdit}
            className="text-body-sm text-fg hover:text-fg-muted underline underline-offset-4"
          >
            편집하기
          </button>
          <Button className="min-h-9 px-4 py-2" onClick={onAdd}>
            추가하기
          </Button>
        </div>
      </div>

      <div className="border-border mt-4 border-b">
        <div className="text-body-sm text-fg-muted grid grid-cols-[1fr_repeat(5,minmax(0,7rem))] gap-2 pb-3">
          <span>위스키</span>
          {COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-body-sm text-fg-muted py-6">{emptyMessage}</p>
      ) : (
        <ul className="divide-border divide-y">
          {items.map((item) => (
            <PlannerRow
              key={item.plannerItemId}
              item={item}
              listType={listType}
              isDragging={draggingId === item.plannerItemId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
