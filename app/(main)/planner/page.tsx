'use client';

import {
  AddPlannerItemModal,
  useAddPlannerItemModal,
} from '@/components/common/AddPlannerItemModal';
import { HorizontalCard } from '@/components/ui/HorizontalCard';
import { usePlannerQuery } from '@/hooks/queries/use-planner';
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
  };
}

export default function PlanPage() {
  const { data, isLoading, isError, refetch } = usePlannerQuery();
  const { open: openAddPlannerItemModal } = useAddPlannerItemModal();

  const items = data?.items ?? [];

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
        <ul className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <li key={item.plannerItemId}>
              <HorizontalCard product={toProduct(item)} />
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => openAddPlannerItemModal()}
        className="mt-2 w-full rounded-md border border-dashed border-gray-300 py-3 text-sm text-gray-500"
      >
        + 추가하기 / 옮기기
      </button>

      <AddPlannerItemModal />
    </div>
  );
}
