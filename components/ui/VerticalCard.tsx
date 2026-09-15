'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';

interface VerticalCardProps {
  product: Product;
  loading?: 'eager' | 'lazy';
  className?: string;
}

export function VerticalCard({
  product,
  loading = 'lazy',
  className,
}: VerticalCardProps) {
  const {
    imageUrl = '', // 추후 기본 이미지 URL로 변경 가능
    name,
    originalName,
    discountRate = 0,
    krPrice,
    jpPrice,
    jpPriceYen,
    volumeMl,
  } = product;
  const [hasError, setHasError] = useState(false);

  return (
    <>
      <div
        className={cn(
          'shadow-m1 flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white',
          className
        )}
      >
        <div className="relative aspect-4/3 w-full">
          {imageUrl && !hasError ? (
            <Image
              src={imageUrl}
              alt={`${name} ${originalName}` || ''}
              fill
              sizes="(max-width: 768px) 50vw, 240px"
              loading={loading}
              className="rounded-xl object-cover"
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-100 text-center text-gray-400">
              {/* TODO: 이미지 로딩 실패 시 표시할 내용 추가 */}
              이미지 로딩 실패
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-lg">{name}</p>
          <p className="text-gray-500">{originalName}</p>
          <p className="text-lg text-[#EC4B4B]">{discountRate}%</p>
          <div className="flex justify-between">
            <span>한국가</span>
            <span>{krPrice?.toLocaleString('ko-KR')}원</span>
          </div>
          <div className="flex justify-between">
            <span>일본가</span>
            <span>{jpPrice?.toLocaleString('ko-KR')}원</span>
          </div>
          {/* <p className="text-right text-xs text-gray-500">
            (¥{jpPriceYen?.toLocaleString('ko-KR')})
          </p> */}
          <p className="text-left text-xs text-gray-500">
            {volumeMl ? `${volumeMl.toLocaleString('ko-KR')}ml` : ''}
          </p>
        </div>
      </div>
    </>
  );
}
