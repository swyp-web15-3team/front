import Link from 'next/link';

import { CurationScroller } from '@/app/(main)/_components/CurationScroller';
import { WhiskyCard } from '@/types/whisky';

function toProduct(whisky: WhiskyCard) {
  return {
    imageUrl: '',
    name: whisky.name,
    originalName: '',
    discountRate: whisky.comparison
      ? -Math.round(whisky.comparison.diffRatio * 100)
      : 0,
    krPrice: whisky.kr?.amount ?? 0,
    jpPrice: whisky.jp?.amountKrw ?? 0,
    jpPriceYen: whisky.jp?.amount ?? 0,
  };
}

interface CurationSectionProps {
  id: number;
  title: string;
  content: WhiskyCard[];
}

export function CurationSection({ id, title, content }: CurationSectionProps) {
  const maxDiscountRate = Math.max(
    0,
    ...content.map((whisky) =>
      whisky.comparison ? Math.round(whisky.comparison.diffRatio * 100) : 0
    )
  );

  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {maxDiscountRate > 0 && (
            <p className="text-sm text-gray-500">
              최대 {maxDiscountRate}% 할인
            </p>
          )}
        </div>
        <Link
          href={`/curations/${id}`}
          className="text-sm text-gray-500 underline"
        >
          더보기
        </Link>
      </div>

      <CurationScroller
        className="mt-4"
        items={content.map((whisky) => ({
          id: whisky.id,
          product: toProduct(whisky),
        }))}
      />
    </section>
  );
}
