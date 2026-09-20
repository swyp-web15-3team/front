'use client';

import { useMemo, useState } from 'react';

import {
  AddPlannerItemModal,
  useAddPlannerItemModal,
} from '@/components/common/AddPlannerItemModal';
import { HorizontalCard } from '@/components/ui/HorizontalCard';
import { Modal } from '@/components/ui/Modal';
import {
  PLANNER_PURCHASE_LIMIT_ML,
  PLANNER_PURCHASE_LIMIT_USD,
} from '@/constants/planner';
import {
  useAddPlannerItemMutation,
  useDeletePlannerItemMutation,
  useDeletePlannerItemsMutation,
  useMovePlannerItemsMutation,
  usePlannerQuery,
} from '@/hooks/queries/use-planner';
import { cn } from '@/lib/utils';
import { PlannerItem, PlannerListType } from '@/types/planner';
import { Product } from '@/types/product';

// 서버는 행 단위(1행 = 1병)로 내려준다. 같은 saleProductId + listType을
// 한 카드로 묶고, 그룹의 행 수를 화면상 수량으로 사용한다.
interface PlannerGroup {
  saleProductId: number;
  listType: PlannerListType;
  plannerItemIds: number[];
  representative: PlannerItem;
  quantity: number;
}

function groupItems(items: PlannerItem[]): PlannerGroup[] {
  const groups = new Map<string, PlannerGroup>();

  for (const item of items) {
    const key = `${item.saleProductId}:${item.listType}`;
    const existing = groups.get(key);
    if (existing) {
      existing.plannerItemIds.push(item.plannerItemId);
      existing.quantity += 1;
    } else {
      groups.set(key, {
        saleProductId: item.saleProductId,
        listType: item.listType,
        plannerItemIds: [item.plannerItemId],
        representative: item,
        quantity: 1,
      });
    }
  }

  return Array.from(groups.values());
}

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

const SECTION_TO_LIST_TYPE: Record<BoardSection, PlannerListType> = {
  purchase: 'PURCHASE',
  candidate: 'CANDIDATE',
};

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
  group,
  section,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
  onQuantityChange,
}: {
  group: PlannerGroup;
  section: BoardSection;
  isDragging: boolean;
  onDragStart: (saleProductId: number) => void;
  onDragEnd: () => void;
  onDelete: (group: PlannerGroup) => void;
  onQuantityChange: (group: PlannerGroup, diff: 1 | -1) => void;
}) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(group.saleProductId));
        e.dataTransfer.setData('application/x-planner-from', section);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(group.saleProductId);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'relative cursor-grab transition-all duration-150 ease-out active:cursor-grabbing',
        isDragging && 'scale-95 opacity-40'
      )}
    >
      <HorizontalCard product={toProduct(group.representative)} />
      <button
        type="button"
        onClick={() => onDelete(group)}
        aria-label="삭제"
        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm hover:text-gray-900"
      >
        ✕
      </button>
      <div className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 px-1 py-0.5 shadow-sm">
        <button
          type="button"
          aria-label="개수 줄이기"
          disabled={group.quantity <= 1}
          onClick={() => onQuantityChange(group, -1)}
          className="flex size-6 items-center justify-center rounded-full text-sm disabled:opacity-30"
        >
          −
        </button>
        <span className="w-4 text-center text-sm">{group.quantity}</span>
        <button
          type="button"
          aria-label="개수 늘리기"
          onClick={() => onQuantityChange(group, 1)}
          className="flex size-6 items-center justify-center rounded-full text-sm"
        >
          +
        </button>
      </div>
    </li>
  );
}

function ConfirmModal({
  isOpen,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} panelClassName="max-w-[360px]">
      <p className="text-center text-sm font-medium">{message}</p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

function DropZone({
  title,
  count,
  section,
  accentClassName,
  onDrop,
  onReset,
  resetLabel,
  children,
}: {
  title: string;
  count: number;
  section: BoardSection;
  accentClassName: string;
  onDrop: (saleProductId: number, from: BoardSection) => void;
  onReset: () => void;
  resetLabel: string;
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
        const saleProductId = Number(e.dataTransfer.getData('text/plain'));
        const from = e.dataTransfer.getData(
          'application/x-planner-from'
        ) as BoardSection;
        if (!saleProductId || from === section) return;
        onDrop(saleProductId, from);
      }}
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-3 transition-colors duration-150 sm:p-4',
        accentClassName,
        isOver && 'border-gray-400 bg-gray-50'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
          {title}
          <span className="text-sm font-normal text-gray-400">{count}</span>
        </h2>
        {count > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {resetLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function PlanPage() {
  const { data, isLoading, isError, refetch } = usePlannerQuery();
  const { open: openAddPlannerItemModal } = useAddPlannerItemModal();
  const { mutate: addPlannerItem } = useAddPlannerItemMutation();
  const { mutate: deletePlannerItem } = useDeletePlannerItemMutation();
  const { mutate: deletePlannerItems } = useDeletePlannerItemsMutation();
  const { mutate: movePlannerItems } = useMovePlannerItemsMutation();
  const [draggingSaleProductId, setDraggingSaleProductId] = useState<
    number | null
  >(null);
  const [confirmAction, setConfirmAction] = useState<
    'resetPurchase' | 'resetCandidates' | 'resetAll' | null
  >(null);

  const items = useMemo(() => data?.items ?? [], [data]);
  const groups = useMemo(() => groupItems(items), [items]);

  const purchaseGroups = groups.filter((g) => g.listType === 'PURCHASE');
  const candidateGroups = groups.filter((g) => g.listType === 'CANDIDATE');

  const totalKrw = purchaseGroups.reduce(
    (sum, g) => sum + (g.representative.price?.amountKrw ?? 0) * g.quantity,
    0
  );
  const totalMl = purchaseGroups.reduce(
    (sum, g) => sum + g.representative.volumeMl * g.quantity,
    0
  );
  const isOverLimit =
    totalKrw > PLANNER_PURCHASE_LIMIT_USD ||
    totalMl > PLANNER_PURCHASE_LIMIT_ML;

  function handleDrop(saleProductId: number, from: BoardSection) {
    setDraggingSaleProductId(null);
    const to = from === 'purchase' ? 'candidate' : 'purchase';
    movePlannerItems({
      fromListType: SECTION_TO_LIST_TYPE[from],
      toListType: SECTION_TO_LIST_TYPE[to],
      saleProductId,
    });
  }

  function handleDragEnd() {
    setDraggingSaleProductId(null);
  }

  function handleQuantityChange(group: PlannerGroup, diff: 1 | -1) {
    if (diff === 1) {
      addPlannerItem([
        {
          saleProductId: group.saleProductId,
          listType: group.listType,
          quantity: 1,
        },
      ]);
      return;
    }
    if (group.quantity <= 1) return;
    deletePlannerItem(group.plannerItemIds[group.plannerItemIds.length - 1]);
  }

  function handleDelete(group: PlannerGroup) {
    deletePlannerItems({
      listType: group.listType,
      saleProductId: group.saleProductId,
    });
  }

  function handleConfirmReset() {
    if (confirmAction === 'resetPurchase') {
      movePlannerItems({ fromListType: 'PURCHASE', toListType: 'CANDIDATE' });
    } else if (confirmAction === 'resetCandidates') {
      deletePlannerItems({ listType: 'CANDIDATE' });
    } else if (confirmAction === 'resetAll') {
      deletePlannerItems({});
    }
    setConfirmAction(null);
  }

  const confirmModalContent: Record<
    'resetPurchase' | 'resetCandidates' | 'resetAll',
    { message: string; confirmLabel: string }
  > = {
    resetPurchase: {
      message: '구매 리스트의 상품을 모두 후보로 이동할까요?',
      confirmLabel: '이동',
    },
    resetCandidates: {
      message: '후보 상품이 전체 삭제됩니다. 동의하시나요?',
      confirmLabel: '삭제',
    },
    resetAll: {
      message: '플래너의 모든 상품이 삭제됩니다. 동의하시나요?',
      confirmLabel: '초기화',
    },
  };

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
            count={purchaseGroups.length}
            section="purchase"
            accentClassName="border-t-4 border-t-gray-900"
            onDrop={handleDrop}
            onReset={() => setConfirmAction('resetPurchase')}
            resetLabel="초기화"
          >
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {purchaseGroups.map((group) => (
                <PlannerCard
                  key={`${group.saleProductId}:${group.listType}`}
                  group={group}
                  section="purchase"
                  isDragging={draggingSaleProductId === group.saleProductId}
                  onDragStart={setDraggingSaleProductId}
                  onDragEnd={handleDragEnd}
                  onDelete={handleDelete}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </ul>
            {purchaseGroups.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">
                후보 상품을 이 영역으로 드래그하면 구매 리스트에 담겨요
              </p>
            )}
          </DropZone>

          <DropZone
            title="후보"
            count={candidateGroups.length}
            section="candidate"
            accentClassName="border-t-4 border-t-gray-300"
            onDrop={handleDrop}
            onReset={() => setConfirmAction('resetCandidates')}
            resetLabel="전체 삭제"
          >
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {candidateGroups.map((group) => (
                <PlannerCard
                  key={`${group.saleProductId}:${group.listType}`}
                  group={group}
                  section="candidate"
                  isDragging={draggingSaleProductId === group.saleProductId}
                  onDragStart={setDraggingSaleProductId}
                  onDragEnd={handleDragEnd}
                  onDelete={handleDelete}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </ul>
            {candidateGroups.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">
                구매 리스트 상품을 이 영역으로 드래그하면 후보로 옮겨져요
              </p>
            )}
          </DropZone>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openAddPlannerItemModal()}
              className="w-full rounded-md border border-dashed border-gray-300 py-3 text-sm text-gray-500"
            >
              + 추가하기 / 옮기기
            </button>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmAction('resetAll')}
                className="shrink-0 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500"
              >
                플래너 초기화
              </button>
            )}
          </div>
        </div>
      )}

      <AddPlannerItemModal />
      <ConfirmModal
        isOpen={confirmAction !== null}
        message={
          confirmAction ? confirmModalContent[confirmAction].message : ''
        }
        confirmLabel={
          confirmAction ? confirmModalContent[confirmAction].confirmLabel : ''
        }
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
