import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Product } from '@/types/product';
import type { WhiskyCard } from '@/types/whisky';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 금액을 정수로 반올림해 천 단위 콤마를 붙인다. 통화 기호/단위는 붙이지 않는다.
 * 서버 환산가(amountKrw 등)는 소수로 오므로 화면 표시 직전에 이 함수를 거친다.
 */
export function formatAmount(amount: number): string;
export function formatAmount(
  amount: number | null | undefined
): string | undefined;
export function formatAmount(amount: number | null | undefined) {
  return amount == null
    ? undefined
    : Math.round(amount).toLocaleString('ko-KR');
}

/**
 * 목록/검색/콜렉션/연관 위스키가 공통으로 쓰는 WhiskyCard -> 카드용 Product 변환.
 * 서버는 목록 응답에 원문명(originalName)을 안 내려줘서 빈 문자열로 둔다.
 */
export function whiskyToProduct(whisky: WhiskyCard): Product {
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
