import { ApiSuccessResponse } from '@/types/common';

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
