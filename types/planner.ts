import { ApiSuccessResponse, CountryCode } from '@/types/common';

export type PlannerListType = 'PURCHASE' | 'CANDIDATE';

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
  listType: PlannerListType;
  saleProductId: number;
  whiskyId: number;
  whiskyName: string;
  volumeMl: number;
  abv: number | null;
  retailerId: number;
  retailerName: string;
  countryCode: CountryCode;
  isDutyFree: boolean;
  productUrl: string | null;
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

// POST /api/v1/planners/items 요청/응답. 같은 saleProductId를 다시 보내면
// 새 항목을 만들지 않고 기존 항목의 quantity를 늘린다.
export interface AddPlannerItemRequest {
  saleProductId: number;
  listType: PlannerListType;
  quantity: number;
}

export type AddPlannerItemResponse = ApiSuccessResponse<PlannerItem>;

// PATCH /api/v1/planners/move 요청. saleProductId가 있으면 그 상품의 모든 병만,
// 없으면 fromListType 전체를 toListType으로 옮긴다. 성공 시 204 No Content.
export interface MovePlannerItemsRequest {
  fromListType: PlannerListType;
  toListType: PlannerListType;
  saleProductId?: number;
}

// DELETE /api/v1/planners/items 요청. listType 없으면 플래너 전체 삭제,
// listType만 있으면 그 리스트 전체, saleProductId까지 있으면 그 리스트의
// 해당 상품 전부 삭제. 성공 시 204 No Content.
export interface DeletePlannerItemsRequest {
  listType?: PlannerListType;
  saleProductId?: number;
}
