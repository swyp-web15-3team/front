'use client';

import { useMemo, useState } from 'react';

import {
  AddPlannerItemModal,
  useAddPlannerItemModal,
} from '@/components/common/AddPlannerItemModal';
import { HorizontalCard } from '@/components/ui/HorizontalCard';
import { HorizontalScroller } from '@/components/ui/HorizontalScroller';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { VerticalCard } from '@/components/ui/VerticalCard';
import { DutyFreeGuide } from '@/app/(main)/planner/_components/DutyFreeGuide';
import {
  findRate,
  useExchangeRatesQuery,
} from '@/hooks/queries/use-exchange-rate';
import {
  useDeletePlannerItemMutation,
  useDeletePlannerItemsMutation,
  useMovePlannerItemsMutation,
  usePlannerQuery,
} from '@/hooks/queries/use-planner';
import { calculateLiquorDuty } from '@/lib/customs-duty';
import { cn } from '@/lib/utils';
import { PlannerItemGroup } from '@/types/planner';
import { Product } from '@/types/product';

function toProduct(item: PlannerItemGroup): Product {
  return {
    id: item.whiskyId,
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

function PlannerCard({
  item,
  section,
  variant = 'horizontal',
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
  onDecrease,
}: {
  item: PlannerItemGroup;
  section: BoardSection;
  variant?: 'horizontal' | 'vertical';
  isDragging: boolean;
  onDragStart: (plannerItemId: number) => void;
  onDragEnd: () => void;
  onDelete: (item: PlannerItemGroup) => void;
  onDecrease: (item: PlannerItemGroup) => void;
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
        'relative cursor-grab transition-all duration-150 ease-out active:cursor-grabbing',
        variant === 'vertical' && 'w-56 shrink-0 snap-start',
        isDragging && 'scale-95 opacity-40'
      )}
    >
      {variant === 'vertical' ? (
        <VerticalCard product={toProduct(item)} />
      ) : (
        <HorizontalCard product={toProduct(item)} />
      )}
      <button
        type="button"
        onClick={() => onDelete(item)}
        aria-label="삭제"
        className="bg-canvas/90 text-fg-muted hover:text-fg absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-sm"
      >
        ✕
      </button>
      <div className="border-border bg-canvas/90 absolute right-2 bottom-2 flex items-center gap-1.5 rounded-full border px-1 py-0.5 shadow-sm">
        <button
          type="button"
          aria-label="개수 줄이기"
          disabled={item.quantity <= 1}
          onClick={() => onDecrease(item)}
          className="text-body-sm text-fg flex size-6 items-center justify-center rounded-full disabled:opacity-30"
        >
          −
        </button>
        <span className="text-body-sm w-4 text-center">{item.quantity}</span>
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
      <p className="text-body-sm-strong text-center">{message}</p>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          취소
        </Button>
        <Button fullWidth onClick={onConfirm}>
          {confirmLabel}
        </Button>
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
  headerExtra,
  children,
}: {
  title: string;
  count: number;
  section: BoardSection;
  accentClassName: string;
  onDrop: (plannerItemId: number, from: BoardSection) => void;
  onReset: () => void;
  resetLabel: string;
  headerExtra?: React.ReactNode;
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
        'border-border bg-canvas rounded-lg border p-3 transition-colors duration-150 sm:p-4',
        accentClassName,
        isOver && 'border-primary bg-surface-muted'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-section-title text-fg flex items-center gap-1.5">
          {title}
          <span className="text-body-sm text-fg-muted">{count}</span>
        </h2>
        <div className="flex items-center gap-3">
          {headerExtra}
          {count > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-caption text-fg-muted hover:text-fg"
            >
              {resetLabel}
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function PlanPage() {
  const { data, isLoading, isError, refetch } = usePlannerQuery();
  const { open: openAddPlannerItemModal } = useAddPlannerItemModal();
  const { mutate: deletePlannerItem } = useDeletePlannerItemMutation();
  const { mutate: deletePlannerItems } = useDeletePlannerItemsMutation();
  const { mutate: movePlannerItems } = useMovePlannerItemsMutation();
  const { data: exchangeRates } = useExchangeRatesQuery();

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [candidateView, setCandidateView] = useState<'swipe' | 'list'>('swipe');
  const [confirmAction, setConfirmAction] = useState<
    'resetPurchase' | 'resetCandidates' | 'resetAll' | null
  >(null);

  const items = useMemo(() => data ?? [], [data]);

  const purchaseItems = items.filter((item) => item.listType === 'PURCHASE');
  const candidateItems = items.filter((item) => item.listType === 'CANDIDATE');

  // 서버가 amountKrw로 원화 환산가를 주므로 krwPerUnit은 1이고,
  // $400 한도 판정에만 USD 환율이 필요하다.
  const krwPerUsd = findRate(exchangeRates?.rates, 'USD');
  const duty = calculateLiquorDuty({
    bottles: purchaseItems.map((item) => ({
      price: item.price?.amountKrw ?? 0,
      volumeMl: item.volumeMl,
      quantity: item.quantity,
    })),
    krwPerUnit: 1,
    // 환율이 없으면 priceUsd가 0이 되어 금액 한도는 초과로 잡지 않는다
    krwPerUsd: krwPerUsd ?? 0,
  });

  function handleDrop(plannerItemId: number, from: BoardSection) {
    // 카드를 드래그했으면 saleProductId 기준으로 그 그룹의 병 전체가 함께 옮겨진다
    const group = items.find((item) =>
      item.plannerItemIds.includes(plannerItemId)
    );
    if (group) {
      movePlannerItems({
        fromListType: group.listType,
        toListType: from === 'candidate' ? 'PURCHASE' : 'CANDIDATE',
        saleProductId: group.saleProductId,
      });
    }
    setDraggingId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  // 수량은 행 개수라, 줄이기는 그룹에서 행 하나를 지우는 것과 같다.
  // 늘리기는 추가 API 스펙이 확정되면 연결한다.
  function handleDecrease(group: PlannerItemGroup) {
    if (group.quantity <= 1) return;
    deletePlannerItem(group.plannerItemIds[group.plannerItemIds.length - 1]);
  }

  // 카드 ✕는 그 그룹 전체라, 행마다 호출하지 않고 범위 삭제 한 번으로 지운다
  function handleDelete(group: PlannerItemGroup) {
    deletePlannerItems({
      listType: group.listType,
      saleProductId: group.saleProductId,
    });
  }

  function handleConfirmReset() {
    if (confirmAction === 'resetPurchase') {
      // 구매 리스트 초기화는 삭제가 아니라 전체를 후보로 내리는 이동이다
      movePlannerItems({
        fromListType: 'PURCHASE',
        toListType: 'CANDIDATE',
      });
    } else if (confirmAction === 'resetCandidates') {
      deletePlannerItems({ listType: 'CANDIDATE' });
    } else if (confirmAction === 'resetAll') {
      deletePlannerItems(undefined);
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
            className="text-body-sm text-fg-muted hover:text-fg underline"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <DutyFreeGuide duty={duty} rateUnavailable={krwPerUsd === null} />

          <DropZone
            title="구매 리스트"
            count={purchaseItems.length}
            section="purchase"
            accentClassName="border-t-primary border-t-4"
            onDrop={handleDrop}
            onReset={() => setConfirmAction('resetPurchase')}
            resetLabel="초기화"
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
                  onDelete={handleDelete}
                  onDecrease={handleDecrease}
                />
              ))}
            </ul>
            {purchaseItems.length === 0 && (
              <p className="text-body-sm text-fg-muted py-6 text-center">
                후보 상품을 이 영역으로 드래그하면 구매 리스트에 담겨요
              </p>
            )}
          </DropZone>

          <DropZone
            title="후보"
            count={candidateItems.length}
            section="candidate"
            accentClassName="border-t-border-strong border-t-4"
            onDrop={handleDrop}
            onReset={() => setConfirmAction('resetCandidates')}
            resetLabel="리스트 전체 삭제"
            headerExtra={
              <button
                type="button"
                onClick={() =>
                  setCandidateView((v) => (v === 'swipe' ? 'list' : 'swipe'))
                }
                aria-label={
                  candidateView === 'swipe' ? '세로 목록 보기' : '가로 보기'
                }
                className="text-caption text-fg-muted hover:text-fg"
              >
                {candidateView === 'swipe' ? '목록 보기' : '가로 보기'}
              </button>
            }
          >
            {candidateView === 'swipe' ? (
              <HorizontalScroller dragScroll={false} trackClassName="gap-3">
                {candidateItems.map((item) => (
                  <PlannerCard
                    key={item.plannerItemId}
                    item={item}
                    section="candidate"
                    variant="vertical"
                    isDragging={draggingId === item.plannerItemId}
                    onDragStart={setDraggingId}
                    onDragEnd={handleDragEnd}
                    onDelete={handleDelete}
                    onDecrease={handleDecrease}
                  />
                ))}
              </HorizontalScroller>
            ) : (
              <ul className="grid max-h-[32rem] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                {candidateItems.map((item) => (
                  <PlannerCard
                    key={item.plannerItemId}
                    item={item}
                    section="candidate"
                    isDragging={draggingId === item.plannerItemId}
                    onDragStart={setDraggingId}
                    onDragEnd={handleDragEnd}
                    onDelete={handleDelete}
                    onDecrease={handleDecrease}
                  />
                ))}
              </ul>
            )}
            {candidateItems.length === 0 && (
              <p className="text-body-sm text-fg-muted py-6 text-center">
                구매 리스트 상품을 이 영역으로 드래그하면 후보로 옮겨져요
              </p>
            )}
          </DropZone>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openAddPlannerItemModal()}
              className="border-border-strong text-body-sm text-fg-muted hover:bg-surface-muted w-full rounded-md border border-dashed py-3"
            >
              + 추가하기 / 옮기기
            </button>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmAction('resetAll')}
                className="border-border-strong text-body-sm text-fg-muted hover:bg-surface-muted shrink-0 rounded-md border border-dashed px-4 py-3"
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
