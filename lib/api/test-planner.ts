import { findCandidateBySaleProductId } from '@/lib/api/test-collection';
import { PlannerItem, PlannerResponse } from '@/types/planner';

const MOCK_NETWORK_DELAY_MS = 400;
let nextPlannerItemId = 100;

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

// TODO: 플래너 API 연동 후 apiClient.post<AddPlannerItemResponse['data']>('/api/v1/planners/items', { saleProductId })로 교체한다.
// 명세: 수량 컬럼이 없어 같은 saleProductId를 다시 보내면 새 플래너 항목이 또 생성된다.
export async function addPlannerItem(
  saleProductId: number
): Promise<PlannerItem> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  const candidate = findCandidateBySaleProductId(saleProductId);
  if (!candidate) {
    throw new Error('판매 상품을 찾을 수 없습니다.');
  }

  const newItem: PlannerItem = {
    plannerItemId: nextPlannerItemId++,
    saleProductId: candidate.saleProductId,
    whiskyId: candidate.whiskyId,
    whiskyName: candidate.whiskyName,
    volumeMl: candidate.volumeMl,
    abv: null,
    retailerId: 0,
    retailerName: '',
    countryCode: 'JP',
    isDutyFree: false,
    productUrl: '',
    isSoldOut: false,
    price: candidate.price,
    exchange: null,
    computable: candidate.price !== null,
  };
  MOCK_PLANNER_ITEMS.push(newItem);
  return newItem;
}
