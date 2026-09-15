import { ApiSuccessResponse, CountryCode } from '@/types/common';

export interface PlannerItemPrice {
  amount: number;
  currency: 'JPY';
  amountKrw: number | null;
  collectedAt: string;
  stale: boolean;
}

export interface PlannerItemExchange {
  source: string;
  krwPerJpy: number;
  validFrom: string;
  validTo: string;
}

export interface PlannerItem {
  plannerItemId: number;
  saleProductId: number;
  whiskyId: number;
  whiskyName: string;
  volumeMl: number;
  abv: number | null;
  retailerId: number;
  retailerName: string;
  countryCode: CountryCode;
  isDutyFree: boolean;
  productUrl: string;
  isSoldOut: boolean | null;
  price: PlannerItemPrice | null;
  exchange: PlannerItemExchange | null;
  computable: boolean;
}

export interface PlannerResponse {
  data: {
    items: PlannerItem[];
  };
}

// 플래너에 추가할 수 있는 일본 판매 상품 후보 (컬렉션/전체 검색 모달에서 사용)
export interface PlannerCandidate {
  saleProductId: number;
  whiskyId: number;
  whiskyName: string;
  whiskyOriginalName: string;
  volumeMl: number;
  price: PlannerItemPrice | null;
}

// POST /api/v1/planners/items 요청/응답. saleProductId만 전달하며,
// 같은 saleProductId를 다시 보내면 새 플래너 항목이 또 생성된다(수량 컬럼 없음).
export interface AddPlannerItemRequest {
  saleProductId: number;
}

export type AddPlannerItemResponse = ApiSuccessResponse<PlannerItem>;
