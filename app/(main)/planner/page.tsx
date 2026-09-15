'use client';

import { useMemo, useState } from 'react';

import {
  AddPlannerItemModal,
  useAddPlannerItemModal,
} from '@/components/common/AddPlannerItemModal';
import { HorizontalCard } from '@/components/ui/HorizontalCard';
import {
  PLANNER_PURCHASE_LIMIT_ML,
  PLANNER_PURCHASE_LIMIT_USD,
} from '@/constants/planner';
import { usePlannerQuery } from '@/hooks/queries/use-planner';
import { cn } from '@/lib/utils';
import { usePlannerBoardStore } from '@/store/use-planner-board-store';
import { PlannerItem } from '@/types/planner';
import { Product } from '@/types/product';

function toProduct(item: PlannerItem): Product {
  return {
    imageUrl: '',
    name: item.whiskyName,
    originalName: item.retailerName,
    discountRate: 0,
    krPrice: item.price?.amountKrw ?? 0,
    jpPrice: item.price?.amountKrw ?? 0,
    jpPriceYen: item.price?.amount ?? 0,
    volumeMl: item.volumeMl,
  };
}

type BoardSection = 'purchase' | 'candidate';

function LimitBar({
  value,
  limit,
  unit,
}: {
  value: number;
  limit: number;
  unit: string;
}) {
  const ratio = limit > 0 ? Math.min(value / limit, 1) : 0;
  const exceeded = value > limit;

  return (
    <div className="flex-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn(
            'h-full rounded-full bg-gray-900',
            exceeded && 'bg-red-500'
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p
        className={cn('mt-1 text-sm text-gray-500', exceeded && 'text-red-500')}
      >
        {value.toLocaleString('ko-KR')}
        {unit} / {limit.toLocaleString('ko-KR')}
        {unit}
      </p>
    </div>
  );
}

function PlannerCard({
  item,
  section,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  item: PlannerItem;
  section: BoardSection;
  isDragging: boolean;
  onDragStart: (plannerItemId: number) => void;
  onDragEnd: () => void;
}) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(item.plannerItemId));
        e.dataTransfer.setData('application/x-planner-from', section);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(item.plannerItemId);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'cursor-grab transition-all duration-150 ease-out active:cursor-grabbing',
        isDragging && 'scale-95 opacity-40'
      )}
    >
      <HorizontalCard product={toProduct(item)} />
    </li>
  );
}

function DropZone({
  title,
  count,
  section,
  accentClassName,
  onDrop,
  children,
}: {
  title: string;
  count: number;
  section: BoardSection;
  accentClassName: string;
  onDrop: (plannerItemId: number, from: BoardSection) => void;
  children: React.ReactNode;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
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
        ) as BoardSection;
        if (!plannerItemId || from === section) return;
        onDrop(plannerItemId, from);
      }}
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-3 transition-colors duration-150 sm:p-4',
        accentClassName,
        isOver && 'border-gray-400 bg-gray-50'
      )}
    >
      <h2 className="mb-3 flex items-center gap-1.5 text-base font-semibold text-gray-900">
        {title}
        <span className="text-sm font-normal text-gray-400">{count}</span>
      </h2>
      {children}
    </div>
  );
}

export default function PlanPage() {
  const { data, isLoading, isError, refetch } = usePlannerQuery();
  const { open: openAddPlannerItemModal } = useAddPlannerItemModal();
  const { purchaseIds, moveToPurchase, moveToCandidate } =
    usePlannerBoardStore();
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const items = useMemo(() => data?.items ?? [], [data]);

  const purchaseItems = items.filter((item) =>
    purchaseIds.has(item.plannerItemId)
  );
  const candidateItems = items.filter(
    (item) => !purchaseIds.has(item.plannerItemId)
  );

  const totalKrw = purchaseItems.reduce(
    (sum, item) => sum + (item.price?.amountKrw ?? 0),
    0
  );
  const totalMl = purchaseItems.reduce((sum, item) => sum + item.volumeMl, 0);
  const isOverLimit =
    totalKrw > PLANNER_PURCHASE_LIMIT_USD ||
    totalMl > PLANNER_PURCHASE_LIMIT_ML;

  function handleDrop(plannerItemId: number, from: BoardSection) {
    if (from === 'candidate') {
      moveToPurchase(plannerItemId);
    } else if (from === 'purchase') {
      moveToCandidate(plannerItemId);
    }
    setDraggingId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  return (
    <div className="mx-auto max-w-300">
      {isLoading ? (
        <div className="flex min-h-100 items-center justify-center">
          <p>불러오는 중...</p>
        </div>
      ) : isError ? (
        <div className="flex min-h-100 flex-col items-center justify-center gap-2">
          <p>일시적인 오류가 발생했습니다</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm underline"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {isOverLimit && (
            <p className="text-sm text-red-500">구매 한도를 초과했어요.</p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <LimitBar
              value={totalKrw}
              limit={PLANNER_PURCHASE_LIMIT_USD}
              unit="원"
            />
            <LimitBar
              value={totalMl}
              limit={PLANNER_PURCHASE_LIMIT_ML}
              unit="ml"
            />
          </div>

          <DropZone
            title="구매 리스트"
            count={purchaseItems.length}
            section="purchase"
            accentClassName="border-t-4 border-t-gray-900"
            onDrop={handleDrop}
          >
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {purchaseItems.map((item) => (
                <PlannerCard
                  key={item.plannerItemId}
                  item={item}
                  section="purchase"
                  isDragging={draggingId === item.plannerItemId}
                  onDragStart={setDraggingId}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </ul>
            {purchaseItems.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">
                후보 상품을 이 영역으로 드래그하면 구매 리스트에 담겨요
              </p>
            )}
          </DropZone>

          <DropZone
            title="후보"
            count={candidateItems.length}
            section="candidate"
            accentClassName="border-t-4 border-t-gray-300"
            onDrop={handleDrop}
          >
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {candidateItems.map((item) => (
                <PlannerCard
                  key={item.plannerItemId}
                  item={item}
                  section="candidate"
                  isDragging={draggingId === item.plannerItemId}
                  onDragStart={setDraggingId}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </ul>
            {candidateItems.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">
                구매 리스트 상품을 이 영역으로 드래그하면 후보로 옮겨져요
              </p>
            )}
          </DropZone>

          <button
            type="button"
            onClick={() => openAddPlannerItemModal()}
            className="w-full rounded-md border border-dashed border-gray-300 py-3 text-sm text-gray-500"
          >
            + 추가하기 / 옮기기
          </button>
        </div>
      )}

      <AddPlannerItemModal />
    </div>
  );
}
