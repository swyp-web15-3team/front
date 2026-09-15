import { PlannerItem, PlannerResponse } from '@/types/planner';

const MOCK_NETWORK_DELAY_MS = 400;

const MOCK_PLANNER_ITEMS: PlannerItem[] = [
  {
    plannerItemId: 10,
    saleProductId: 501,
    whiskyId: 101,
    whiskyName: 'Lagavulin 16',
    volumeMl: 700,
    abv: 43.0,
    retailerId: 3,
    retailerName: '나리타 면세',
    countryCode: 'JP',
    isDutyFree: true,
    productUrl: 'https://example.com/product/501',
    isSoldOut: false,
    price: {
      amount: 9800,
      currency: 'JPY',
      amountKrw: 94000,
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    exchange: {
      source: 'KOREA_EXIM',
      krwPerJpy: 9.59,
      validFrom: '2026-09-08',
      validTo: '2026-09-08',
    },
    computable: true,
  },
  {
    plannerItemId: 11,
    saleProductId: 502,
    whiskyId: 102,
    whiskyName: '야마자키 12년',
    volumeMl: 700,
    abv: 43.0,
    retailerId: 4,
    retailerName: '돈키호테',
    countryCode: 'JP',
    isDutyFree: false,
    productUrl: 'https://example.com/product/502',
    isSoldOut: true,
    price: null,
    exchange: null,
    computable: false,
  },
];

// TODO: 플래너 API 연동 후 이 파일을 planner.ts로 옮기고 아래 목업 대신
// apiClient.get<PlannerResponse>('/api/v1/planners')로 교체한다.
// 반환 형태(PlannerResponse['data'])만 유지하면 훅 수정 없이 교체 가능하다.
export async function fetchPlanner(): Promise<PlannerResponse['data']> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  return { items: MOCK_PLANNER_ITEMS };
}
