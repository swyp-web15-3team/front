import { apiClient } from '@/lib/api/client';
import { ExchangeRatesResponse } from '@/types/exchange-rate';

/** date를 생략하면 서버가 최신 고시 환율을 내려준다. */
export async function fetchExchangeRates(
  date?: string
): Promise<ExchangeRatesResponse['data']> {
  try {
    const { data } = await apiClient.get<ExchangeRatesResponse>(
      '/exchange-rates',
      { params: date ? { date } : undefined }
    );
    return data.data;
  } catch (error) {
    // ponytail: 데모용 임시 대응. 서버가 주말/공휴일에 502를 내서 고정 날짜로 재요청한다.
    // 백엔드가 직전 영업일 fallback을 지원하면 삭제.
    if (date === DEMO_FALLBACK_DATE) throw error;
    return fetchExchangeRates(DEMO_FALLBACK_DATE);
  }
}

const DEMO_FALLBACK_DATE = '2026-10-16';
