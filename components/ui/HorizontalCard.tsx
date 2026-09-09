import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';

interface HorizontalCardProps {
  product: Product;
  loading?: 'eager' | 'lazy';
  className?: string;
}

export function HorizontalCard({
  product,
  loading = 'lazy',
  className,
}: HorizontalCardProps) {
  const {
    imageUrl = '', // 추후 기본 이미지 URL로 변경 가능
    name,
    originalName,
    discountRate = 0,
    krPrice,
    jpPrice,
    jpPriceYen,
  } = product;

  return (
    <div
      className={cn(
        'shadow-m1 flex w-full overflow-hidden rounded-xl border border-gray-200 bg-white',
        className
      )}
    >
      <div className="relative aspect-square w-32 shrink-0">
        <Image
          src={imageUrl}
          alt={`${name} ${originalName}` || ''}
          fill
          sizes="128px"
          loading={loading}
          className="rounded-xl object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 p-4">
        <p className="text-lg">{name}</p>
        <p className="text-gray-500">{originalName}</p>
        {/* <p className="text-lg text-[#EC4B4B]">{discountRate}%</p> */}
        <div className="justify-be mt-2 flex">
          <span>한국가</span>
          <span>{krPrice?.toLocaleString('ko-KR')}원</span>
        </div>
        <div className="flex justify-between">
          <span>일본가</span>
          <span>{jpPrice?.toLocaleString('ko-KR')}원</span>
        </div>
        <p className="text-right text-xs text-gray-500">
          (¥{jpPriceYen?.toLocaleString('ko-KR')})
        </p>
      </div>
    </div>
  );
}
