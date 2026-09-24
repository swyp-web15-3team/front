import { ApiSuccessResponse } from '@/types/common';
import { WhiskyComparison } from '@/types/whisky';

export interface Collection {
  id: number;
  name: string;
  isDefault: boolean;
}

export type CollectionListResponse = ApiSuccessResponse<{
  collections: Collection[];
}>;

export type AddCollectionItemResponse = ApiSuccessResponse<{
  collectionId: number;
  whiskyId: number;
  saved: boolean;
}>;

export type RemoveCollectionItemResponse = AddCollectionItemResponse;

// ── GET /api/v1/collections/{collectionId}/whiskies ──
// 목록 카드(WhiskyCard)와 달리 category가 없고, 가격에 collectedAt/stale이 없다.
export interface CollectionWhiskyPriceKr {
  amount: number;
  currency: 'KRW';
  retailerName: string;
}

export interface CollectionWhiskyPriceJp {
  amount: number;
  currency: 'JPY';
  amountKrw: number | null;
  retailerName: string;
}

export interface CollectionWhisky {
  id: number;
  name: string;
  volumeMl: number;
  abv: number | null;
  kr: CollectionWhiskyPriceKr | null;
  jp: CollectionWhiskyPriceJp | null;
  comparison: WhiskyComparison | null;
}

export interface CollectionWhiskyListRequest {
  page?: number;
  size?: number;
}

export type CollectionWhiskyListResponse = ApiSuccessResponse<{
  collection: Collection;
  items: CollectionWhisky[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}>;
