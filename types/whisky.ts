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
  countryCode: CountryCode;
  isDutyFree: boolean;
  productUrl: string;
  isSoldOut: boolean | null;
  price: SaleProductPrice | null;
}

// 상세 (목록 아이템 + 판매처 목록)
export interface WhiskyDetail extends WhiskyListItem {
  saleProducts: SaleProduct[];
}

// ── GET /api/v1/whiskies ──────────────────────────
export interface WhiskyListRequest {
  query?: string;
  categoryId?: number;
  originId?: number;
  regionId?: number;
  volumeMl?: number;
  countryCode?: CountryCode;
  isDutyFree?: boolean;
  sort?: WhiskySort;
  page?: number;
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
