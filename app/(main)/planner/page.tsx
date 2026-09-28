'use client';

import { useMemo, useState } from 'react';

import {
  AddPlannerItemModal,
  useAddPlannerItemModal,
} from '@/components/common/AddPlannerItemModal';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PlannerList } from '@/app/(main)/planner/_components/PlannerList';
import { PlannerSummary } from '@/app/(main)/planner/_components/PlannerSummary';
import {
  findRate,
  useExchangeRatesQuery,
} from '@/hooks/queries/use-exchange-rate';
import {
  useDeletePlannerItemsMutation,
  useMovePlannerItemsMutation,
  usePlannerQuery,
} from '@/hooks/queries/use-planner';
import { calculateLiquorDuty } from '@/lib/customs-duty';
import { PlannerListType } from '@/types/planner';

const RESET_CONTENT: Record<
  PlannerListType,
  { message: string; confirmLabel: string }
> = {
  PURCHASE: {
    message: '구매 예정 목록의 상품을 모두 후보로 이동할까요?',
    confirmLabel: '이동',
  },
  CANDIDATE: {
    message: '구매 후보 목록이 전체 삭제됩니다. 동의하시나요?',
    confirmLabel: '삭제',
  },
};

export default function PlanPage() {
  const { data, isLoading, isError, refetch } = usePlannerQuery();
  const { open: openAddPlannerItemModal } = useAddPlannerItemModal();
  const { mutate: deletePlannerItems } = useDeletePlannerItemsMutation();
  const { mutate: movePlannerItems } = useMovePlannerItemsMutation();
  const { data: exchangeRates } = useExchangeRatesQuery();

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [resetTarget, setResetTarget] = useState<PlannerListType | null>(null);

  const items = useMemo(() => data ?? [], [data]);

  const purchaseItems = items.filter((item) => item.listType === 'PURCHASE');
  const candidateItems = items.filter((item) => item.listType === 'CANDIDATE');

  // 서버가 amountKrw로 원화 환산가를 주므로 krwPerUnit은 1이고,
  // $400 한도 판정에만 USD 환율이 필요하다.
  const krwPerUsd = findRate(exchangeRates?.rates, 'USD');
  const krwPerJpy = findRate(exchangeRates?.rates, 'JPY');
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

  function handleDrop(plannerItemId: number, from: PlannerListType) {
    // 카드를 드래그했으면 saleProductId 기준으로 그 그룹의 병 전체가 함께 옮겨진다
    const group = items.find((item) =>
      item.plannerItemIds.includes(plannerItemId)
    );
    if (group) {
      movePlannerItems({
        fromListType: group.listType,
        toListType: from === 'CANDIDATE' ? 'PURCHASE' : 'CANDIDATE',
        saleProductId: group.saleProductId,
      });
    }
    setDraggingId(null);
  }

  function handleConfirmReset() {
    if (resetTarget === 'PURCHASE') {
      // 구매 예정 목록 초기화는 삭제가 아니라 전체를 후보로 내리는 이동이다
      movePlannerItems({ fromListType: 'PURCHASE', toListType: 'CANDIDATE' });
    } else if (resetTarget === 'CANDIDATE') {
      deletePlannerItems({ listType: 'CANDIDATE' });
    }
    setResetTarget(null);
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
            className="text-body-sm text-fg-muted hover:text-fg underline"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          <PlannerSummary
            duty={duty}
            krwPerUsd={krwPerUsd}
            krwPerJpy={krwPerJpy}
            rateDate={exchangeRates?.date}
          />

          <PlannerList
            title="구매 예정 목록"
            listType="PURCHASE"
            items={purchaseItems}
            emptyMessage="현재 구매할 상품이 비었어요. 아래 후보 목록에서 상품을 가져와보세요."
            draggingId={draggingId}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
            onDrop={handleDrop}
            onEdit={() => setResetTarget('PURCHASE')}
            onAdd={() => openAddPlannerItemModal()}
          />

          <PlannerList
            title="구매 후보 목록"
            listType="CANDIDATE"
            items={candidateItems}
            emptyMessage="현재 구매 후보 목록이 비었어요. 추가하기 버튼을 이용해보세요."
            draggingId={draggingId}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
            onDrop={handleDrop}
            onEdit={() => setResetTarget('CANDIDATE')}
            onAdd={() => openAddPlannerItemModal()}
          />
        </div>
      )}

      <AddPlannerItemModal />
      <Modal
        isOpen={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        panelClassName="max-w-[360px]"
      >
        <p className="text-body-sm-strong text-center">
          {resetTarget ? RESET_CONTENT[resetTarget].message : ''}
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setResetTarget(null)}
          >
            취소
          </Button>
          <Button fullWidth onClick={handleConfirmReset}>
            {resetTarget ? RESET_CONTENT[resetTarget].confirmLabel : ''}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
