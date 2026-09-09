'use client';

import { VerticalCard } from '@/components/ui/VerticalCard';

export default function SearchPage() {
  const products = {
    imageUrl: 'https://placehold.co/200x150.png',
    name: '야마자키 12년',
    originalName: '山崎 | Yamazaki 12yo',
    discountRate: -42,
    krPrice: 298000,
    jpPrice: 168500,
    jpPriceYen: 18500,
  };

  const items = Array.from({ length: 50 }, (_, i) => ({
    ...products,
    name: `${i + 1} ${products.name}`,
  }));
  return (
    <>
      <div className="mx-auto max-w-300">
        <input
          type="text"
          placeholder="검색하세요"
          className="mb-4 w-full bg-gray-200 p-2"
        />
        {items.length === 0 ? (
          <div className="flex min-h-100 items-center justify-center">
            <p>상품이 없습니다</p>
          </div>
        ) : (
          <>
            <p>{items.length}개</p>
            <div className="grid grid-cols-2 gap-4 bg-blue-100 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item, i) => (
                <VerticalCard key={i} product={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
