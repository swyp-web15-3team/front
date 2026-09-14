import { ApiSuccessResponse } from '@/types/common';

export interface Collection {
  id: number;
  name: string;
  isDefault: boolean;
}

export type CollectionListResponse = ApiSuccessResponse<{
  collections: Collection[];
}>;
