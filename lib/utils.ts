import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Product } from '@/types/product';
import type { WhiskyListItem } from '@/types/whisky';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 목록/검색/컬렉션이 공통으로 쓰는 WhiskyListItem -> 카드용 Product 변환.
 * 서버는 목록 응답에 원문명(originalName)을 안 내려줘서 빈 문자열로 둔다.
 */
export function whiskyToProduct(whisky: WhiskyListItem): Product {
  return {
    id: whisky.id,
    imageUrl: whisky.imageUrl || '',
    name: whisky.name,
    originalName: '',
    discountRate: whisky.comparison
      ? -Math.round(whisky.comparison.diffRatio * 100)
      : 0,
    krPrice: whisky.kr?.amount ?? 0,
    jpPrice: whisky.jp?.amountKrw ?? 0,
    jpPriceYen: whisky.jp?.amount ?? 0,
    volumeMl: whisky.volumeMl,
  };
}
