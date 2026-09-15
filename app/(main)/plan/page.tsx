'use client';

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
      ) : items.length === 0 ? (
        <div className="flex min-h-100 items-center justify-center">
          <p>플래너에 담긴 상품이 없습니다</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.plannerItemId}>
              <HorizontalCard product={toProduct(item)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
