import { apiClient } from '@/lib/api/client';
import { ExchangeRatesResponse } from '@/types/exchange-rate';

/** date를 생략하면 서버가 최신 고시 환율을 내려준다. */
export async function fetchExchangeRates(
  date?: string
): Promise<ExchangeRatesResponse['data']> {
  const { data } = await apiClient.get<ExchangeRatesResponse>(
    '/exchange-rates',
    { params: date ? { date } : undefined }
  );
  return data.data;
}
