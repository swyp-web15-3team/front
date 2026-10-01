'use client';

import {
  findRate,
  useExchangeRatesQuery,
} from '@/hooks/queries/use-exchange-rate';
import { calculateLiquorDuty } from '@/lib/customs-duty';
import { formatKrw } from '@/lib/sale-price';

interface EstimatedDutyProps {
  /** 반입 대상(해외·면세점) 최저가의 원화 환산가. 없으면 계산하지 않는다 */
  priceKrw: number | null;
  volumeMl: number;
}

/** 이 위스키 한 병만 들여올 때의 예상 세액 */
export function EstimatedDuty({ priceKrw, volumeMl }: EstimatedDutyProps) {
  const { data: exchangeRates } = useExchangeRatesQuery();
  const krwPerUsd = findRate(exchangeRates?.rates, 'USD');

  // $400 한도 판정에 USD 환율이 필요하다. 없으면 판정을 보류한다.
  if (priceKrw === null || krwPerUsd === null) return <>-</>;

  const duty = calculateLiquorDuty({
    bottles: [{ price: priceKrw, volumeMl, quantity: 1 }],
    // 서버가 원화 환산가를 주므로 현지 통화 환율은 필요 없다
    krwPerUnit: 1,
    krwPerUsd,
  });

  return (
    <>{duty.isDutyFree ? '면세 대상' : `약 ${formatKrw(duty.totalTax)}`}</>
  );
}
