'use client';

import { useState } from 'react';
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
    volumeMl,
  } = product;
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        'shadow-m1 flex w-full overflow-hidden rounded-xl border border-gray-200 bg-white',
        className
      )}
    >
      <div className="relative aspect-square w-32 shrink-0">
        {imageUrl && !hasError ? (
          <Image
            src={imageUrl}
            alt={`${name} ${originalName}` || ''}
            fill
            sizes="128px"
            loading={loading}
            className="rounded-xl object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-100 text-center text-xs text-gray-400">
            이미지 로딩 실패
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 p-4">
        <p className="truncate text-lg">{name}</p>
        <p className="truncate text-gray-500">{originalName}</p>
        <div className="mt-2">
          {discountRate > 0 && (
            <span className="mr-1 text-[#EC4B4B]">-{discountRate}%</span>
          )}
          <span>
            {jpPrice?.toLocaleString('ko-KR')}원
            <span className="text-gray-500">(일본 최저가)</span>
          </span>
        </div>
        <p>
          {krPrice?.toLocaleString('ko-KR')}원
          <span className="text-gray-500">(한국 최저가)</span>
          {volumeMl != null && (
            <span className="text-gray-500"> · {volumeMl}ml</span>
          )}
        </p>
      </div>
    </div>
  );
}
