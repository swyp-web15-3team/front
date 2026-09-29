'use client';

import { useMemo, useState } from 'react';

import {
  AddPlannerItemModal,
  useAddPlannerItemModal,
} from '@/components/common/AddPlannerItemModal';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PlannerList } from '@/app/(main)/planner/_components/PlannerList';
import {
  MovePlannerItemModal,
  useMovePlannerItemModal,
} from '@/app/(main)/planner/_components/MovePlannerItemModal';
import { PlannerSummary } from '@/app/(main)/planner/_components/PlannerSummary';
import {
  findRate,
  useExchangeRatesQuery,
} from '@/hooks/queries/use-exchange-rate';
import {
  useAddPlannerItemMutation,
  useChangePlannerSaleProductMutation,
  useDeletePlannerItemMutation,
  useDeletePlannerItemsMutation,
  useMovePlannerItemsMutation,
  usePlannerQuery,
} from '@/hooks/queries/use-planner';
import { calculateLiquorDuty } from '@/lib/customs-duty';
import { PlannerItemGroup, PlannerListType } from '@/types/planner';

export default function PlanPage() {
  const { data, isLoading, isError, refetch } = usePlannerQuery();
  const { open: openAddPlannerItemModal } = useAddPlannerItemModal();
  const { open: openMovePlannerItemModal } = useMovePlannerItemModal();
  const { mutate: deletePlannerItems } = useDeletePlannerItemsMutation();
  const { mutate: movePlannerItems } = useMovePlannerItemsMutation();
  const { mutate: deletePlannerItem } = useDeletePlannerItemMutation();
  const { mutate: addPlannerItems } = useAddPlannerItemMutation();
  const { mutate: changeSaleProduct, isPending: isChangingSaleProduct } =
    useChangePlannerSaleProductMutation();
  const { data: exchangeRates } = useExchangeRatesQuery();

  const [draggingId, setDraggingId] = useState<number | null>(null);
  // 편집 모드에서 삭제를 누르면 확인을 먼저 받는다. 되돌릴 수 없어서다.
  const [deleteTarget, setDeleteTarget] = useState<{
    listType: PlannerListType;
    saleProductIds: number[];
  } | null>(null);

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

  // 서버에 수량 컬럼이 없어서 + 는 같은 상품 한 병을 더 넣는 것이다
  function handleIncrement(item: PlannerItemGroup) {
    addPlannerItems([
      {
        saleProductId: item.saleProductId,
        quantity: 1,
        listType: item.listType,
      },
    ]);
  }

  // − 는 그룹의 행 하나를 지운다. 어느 plannerItemId든 한 병이라 상관없다.
  function handleDecrement(item: PlannerItemGroup) {
    const [plannerItemId] = item.plannerItemIds;
    if (plannerItemId !== undefined) deletePlannerItem(plannerItemId);
  }

  function handleChangeSaleProduct(
    item: PlannerItemGroup,
    saleProductId: number
  ) {
    changeSaleProduct({
      listType: item.listType,
      fromSaleProductId: item.saleProductId,
      toSaleProductId: saleProductId,
      quantity: item.quantity,
    });
  }

  // 범위 삭제는 saleProductId 하나씩만 받아서 고른 개수만큼 호출한다.
  function handleConfirmDelete() {
    if (!deleteTarget) return;
    for (const saleProductId of deleteTarget.saleProductIds) {
      deletePlannerItems({ listType: deleteTarget.listType, saleProductId });
    }
    setDeleteTarget(null);
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
            onDelete={(saleProductIds) =>
              setDeleteTarget({ listType: 'PURCHASE', saleProductIds })
            }
            onAdd={() => openMovePlannerItemModal()}
            // 후보가 비면 구매 예정으로 가져올 게 없다
            isAddDisabled={candidateItems.length === 0}
            showQuantity
            isPending={isChangingSaleProduct}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onChangeSaleProduct={handleChangeSaleProduct}
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
            onDelete={(saleProductIds) =>
              setDeleteTarget({ listType: 'CANDIDATE', saleProductIds })
            }
            onAdd={() => openAddPlannerItemModal()}
            isPending={isChangingSaleProduct}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onChangeSaleProduct={handleChangeSaleProduct}
          />
        </div>
      )}

      <AddPlannerItemModal />
      <MovePlannerItemModal candidates={candidateItems} />
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        panelClassName="max-w-[360px]"
      >
        <p className="text-body-sm-strong text-center">
          선택한 상품 {deleteTarget?.saleProductIds.length ?? 0}개를 삭제할까요?
        </p>
        <p className="text-caption text-fg-muted mt-1 text-center">
          삭제한 상품은 되돌릴 수 없습니다.
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setDeleteTarget(null)}
          >
            취소
          </Button>
          <Button fullWidth onClick={handleConfirmDelete}>
            삭제
          </Button>
        </div>
      </Modal>
    </div>
  );
}
