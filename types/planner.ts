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

export type PlannerListType = 'PURCHASE' | 'CANDIDATE';

// 서버가 내려주는 플래너 한 행. 한 행 = 1병이고 수량 필드는 없다.
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

// 같은 saleProductId + listType 행들을 한 카드로 묶은 화면용 단위.
// quantity는 그룹의 행 수이고, 삭제/수량 변경은 plannerItemIds로 처리한다.
export interface PlannerItemGroup extends PlannerItem {
  quantity: number;
  plannerItemIds: number[];
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

// POST /api/v1/planners/items 요청/응답.
// 서버는 수량 컬럼이 없어 quantity만큼 행을 만든다. 같은 상품을 다시 넣으면
// 새 plannerItemId 행이 생기고, 한 요청 안에 같은 saleProductId는 못 넣는다.
export interface AddPlannerItemRequestItem {
  saleProductId: number;
  /** 병 수. 생략하면 1, 최대 20 */
  quantity?: number;
  /** 생략하면 CANDIDATE */
  listType?: PlannerListType;
}

export interface AddPlannerItemRequest {
  /** 1~20개 */
  items: AddPlannerItemRequestItem[];
}

export type AddPlannerItemResponse = ApiSuccessResponse<{
  items: PlannerItem[];
}>;
