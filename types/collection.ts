import { ApiSuccessResponse } from '@/types/common';
import { WhiskyListItem } from '@/types/whisky';

export interface Collection {
  id: number;
  name: string;
  isDefault: boolean;
}

export type CollectionListResponse = ApiSuccessResponse<{
  collections: Collection[];
}>;

// 컬렉션에 담긴 위스키 목록. 서버는 검색/목록과 같은 WhiskyListItem 형태로
// 페이지네이션해서 내려준다(saleProductId·whiskyName 같은 플래너 필드는 없다).
export type CollectionItemListResponse = ApiSuccessResponse<{
  items: WhiskyListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}>;

export type AddCollectionItemResponse = ApiSuccessResponse<{
  collectionId: number;
  whiskyId: number;
  saved: boolean;
}>;

export type RemoveCollectionItemResponse = AddCollectionItemResponse;
