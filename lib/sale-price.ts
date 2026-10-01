import { SaleProduct } from '@/types/whisky';

export function formatKrw(amount: number) {
  return `${Math.round(amount).toLocaleString('ko-KR')}원`;
}

/** 판매처 가격의 원화 환산가. 가격이 없거나 환산가를 못 받았으면 null */
export function getSalePriceKrw(sale: SaleProduct): number | null {
  const { price } = sale;
  if (!price) return null;
  if (price.currency === 'KRW') return price.amount;
  return price.amountKrw;
}

/** 원화 환산가 기준 최저가. 비교할 가격이 하나도 없으면 null */
export function findLowestPriceKrw(sales: SaleProduct[]): number | null {
  const prices = sales
    .map(getSalePriceKrw)
    .filter((price): price is number => price !== null);
  return prices.length > 0 ? Math.min(...prices) : null;
}
