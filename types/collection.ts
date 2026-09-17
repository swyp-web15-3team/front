import { ApiSuccessResponse } from '@/types/common';
import { PlannerCandidate } from '@/types/planner';

export interface Collection {
  id: number;
  name: string;
  isDefault: boolean;
}

export type CollectionListResponse = ApiSuccessResponse<{
  collections: Collection[];
}>;

// 컬렉션에 담긴, 플래너에 추가 가능한 위스키 후보 목록
export type CollectionItemListResponse = ApiSuccessResponse<{
  items: PlannerCandidate[];
}>;

export type AddCollectionItemResponse = ApiSuccessResponse<{
  collectionId: number;
  whiskyId: number;
  saved: boolean;
}>;

// 응답 형태가 추가와 동일하다 (collectionId, whiskyId, 다른 그룹에도 남아있는지 여부).
export type RemoveCollectionItemResponse = AddCollectionItemResponse;
