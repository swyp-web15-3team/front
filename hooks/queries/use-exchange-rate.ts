'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { fetchExchangeRates } from '@/lib/api/exchange-rate';
import { ExchangeRate } from '@/types/exchange-rate';

export const exchangeRateKeys = {
  all: ['exchange-rates'] as const,
  detail: (date?: string) =>
    [...exchangeRateKeys.all, date ?? 'latest'] as const,
};

/**
 * 환율은 없으면 면세 한도 판정만 보류하면 되는 부가 정보라서,
 * 실패해도 화면을 막지 않는다. 재시도하면 인터셉터의 5xx 토스트와
 * Sentry 기록이 호출 횟수만큼 반복되므로 재시도하지 않는다.
 */
export function useExchangeRatesQuery(date?: string) {
  return useQuery({
    queryKey: exchangeRateKeys.detail(date),
    queryFn: () => fetchExchangeRates(date),
    retry: false,
    // 고시 환율은 하루 단위로 바뀐다
    staleTime: 60 * 60 * 1000,
  });
}

/** 관세 계산에 쓸 통화 1단위당 원화. 없으면 null (계산을 막아야 한다) */
export function findRate(
  rates: ExchangeRate[] | undefined,
  currency: string
): number | null {
  return rates?.find((r) => r.currency === currency)?.rate ?? null;
}

/**
 * 환율 서비스가 꺼져 있어(EXCHANGE_004) 값을 못 받은 경우인지.
 * 일시적 장애와 구분해 안내 문구를 다르게 쓰고 싶을 때 사용한다.
 */
export function isExchangeRateUnavailable(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 503;
}
