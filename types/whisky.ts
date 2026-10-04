import { ApiSuccessResponse, CountryCode } from '@/types/common';

export type WhiskySort = 'name,asc' | 'name,desc' | 'id,asc' | 'id,desc';

export interface WhiskyCategory {
  id: number;
  name: string;
}

export interface WhiskyOrigin {
  id: number;
  name: string;
}

export interface WhiskyRegion {
  id: number;
  name: string;
}

export interface WhiskyPriceKr {
  amount: number;
  currency: 'KRW';
  retailerName: string;
  collectedAt: string;
  stale: boolean;
}

export interface WhiskyPriceJp {
  amount: number;
  currency: 'JPY';
  amountKrw: number | null;
  retailerName: string;
  collectedAt: string;
  stale: boolean;
}

export interface WhiskyComparison {
  diffAmountKrw: number;
  diffRatio: number;
  cheaperCountry: CountryCode;
}

// 연관 위스키 / 큐레이션 미리보기 카드
export interface WhiskyCard {
  id: number;
  name: string;
  volumeMl: number;
  abv: number | null;
  category: WhiskyCategory;
  kr: WhiskyPriceKr | null;
  jp: WhiskyPriceJp | null;
  comparison: WhiskyComparison | null;
  imageUrl?: string;
}

// 목록·검색 결과 한 행 (카드 + 원산지/지역)
export interface WhiskyListItem extends WhiskyCard {
  origin: WhiskyOrigin | null;
  region: WhiskyRegion | null;
}

export interface SaleProductPrice {
  amount: number;
  currency: 'KRW' | 'JPY';
  amountKrw: number | null;
  collectedAt: string;
  stale: boolean;
}

export interface SaleProduct {
  id: number;
  retailerName: string;
  retailerAddress?: string | null;
  countryCode: CountryCode;
  isDutyFree: boolean;
  productUrl: string;
  imageUrl?: string;
  isSoldOut: boolean | null;
  price: SaleProductPrice | null;
}

// 상세 (목록 아이템 + 판매처 목록)
export interface WhiskyDetail extends WhiskyListItem {
  saleProducts: SaleProduct[];
}

// ── GET /api/v1/whiskies ──────────────────────────
export interface WhiskyListRequest {
  /** 위스키 이름 부분 검색. 앞뒤 공백 제거 */
  query?: string;
  /** 종류 ID. 여러 개면 `?categoryId=1&categoryId=2`로 전달 */
  categoryId?: number[];
  /** 원산지 ID */
  originId?: number;
  /** 생산 지역 ID */
  regionId?: number;
  /** 용량(ml) */
  volumeMl?: number;
  /** 판매 국가 */
  countryCode?: CountryCode;
  /** 면세점 판매 여부 */
  isDutyFree?: boolean;
  /** 최저가(한국·일본 중 낮은 값) 원화 최소 가격 (포함) */
  minPrice?: number;
  /** 최저가(한국·일본 중 낮은 값) 원화 최대 가격 (포함) */
  maxPrice?: number;
  /** 일본 할인율(%) 최소값 (포함) */
  minPriceDiffPercent?: number;
  /** 일본 할인율(%) 최대값 (미포함) */
  maxPriceDiffPercent?: number;
  /** 정렬 조건 */
  sort?: WhiskySort;
  /** 페이지 번호 */
  page?: number;
  /** 페이지 크기 */
  size?: number;
}

interface WhiskyListData {
  content: WhiskyListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type WhiskyListResponse = ApiSuccessResponse<WhiskyListData>;

// ── GET /api/v1/whiskies/suggestions ──────────────
export interface WhiskySuggestionsRequest {
  query?: string;
}

export interface WhiskySuggestion {
  keyword: string;
}

interface WhiskySuggestionsData {
  suggestions: WhiskySuggestion[];
}

export type WhiskySuggestionsResponse =
  ApiSuccessResponse<WhiskySuggestionsData>;

// ── GET /api/v1/whisky-categories ─────────────────
interface WhiskyCategoryListData {
  categories: WhiskyCategory[];
}

export type WhiskyCategoryListResponse =
  ApiSuccessResponse<WhiskyCategoryListData>;

// ── GET /api/v1/whiskies/{whiskyId} ───────────────
export type WhiskyDetailResponse = ApiSuccessResponse<WhiskyDetail>;

// ── GET /api/v1/whiskies/{whiskyId}/related ───────
interface WhiskyRelatedListData {
  whiskies: WhiskyCard[];
}

export type WhiskyRelatedListResponse =
  ApiSuccessResponse<WhiskyRelatedListData>;

// ── GET /api/v1/curations ─────────────────────────
export interface CurationListRequest {
  page?: number;
  size?: number;
}

// 주제가 없으면 id/title은 null, content는 []
interface CurationListData {
  id: number | null;
  title: string | null;
  content: WhiskyListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type CurationListResponse = ApiSuccessResponse<CurationListData>;
