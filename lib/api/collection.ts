import type { AxiosError } from 'axios';

import { apiClient } from '@/lib/api/client';
import {
  AddCollectionItemResponse,
  Collection,
  CollectionItemListResponse,
  CollectionListResponse,
  CollectionWhiskyListRequest,
  RemoveCollectionItemResponse,
} from '@/types/collection';
import { ApiErrorResponse } from '@/types/common';

/** 콜렉션 이름 최대 길이 (서버가 400으로 거절하는 기준) */
export const COLLECTION_NAME_MAX_LENGTH = 100;

export async function fetchCollections(): Promise<
  CollectionListResponse['data']
> {
  const { data } = await apiClient.get<CollectionListResponse>('/collections');
  return data.data;
}

export async function fetchCollectionItems(
  collectionId: number,
  { page, size }: CollectionWhiskyListRequest = {}
): Promise<CollectionItemListResponse['data']> {
  const { data } = await apiClient.get<CollectionItemListResponse>(
    `/collections/${collectionId}/whiskies`,
    { params: { page, size } }
  );
  return data.data;
}

export async function createCollection(name: string): Promise<Collection> {
  const { data } = await apiClient.post<{ data: Collection }>('/collections', {
    name: name.trim(),
  });
  return data.data;
}

export async function renameCollection(
  collectionId: number,
  name: string
): Promise<Collection> {
  const { data } = await apiClient.patch<{ data: Collection }>(
    `/collections/${collectionId}`,
    { name: name.trim() }
  );
  return data.data;
}

export async function deleteCollection(
  collectionId: number
): Promise<{ id: number }> {
  await apiClient.delete(`/collections/${collectionId}`);
  return { id: collectionId };
}

// whiskyId는 경로가 아니라 body로 보낸다.
export async function addCollectionItem(
  collectionId: number,
  whiskyId: number
): Promise<AddCollectionItemResponse['data']> {
  const { data } = await apiClient.post<AddCollectionItemResponse>(
    `/collections/${collectionId}/whiskies`,
    { whiskyId }
  );
  return data.data;
}

// 단건/다건 모두 whiskyIds 쿼리 파라미터를 반복해서 보낸다.
// (?whiskyIds=4&whiskyIds=1 — body나 whiskyIds[]=4 형태가 아니다)
export async function removeCollectionItems(
  collectionId: number,
  whiskyIds: number[]
): Promise<RemoveCollectionItemResponse['data']> {
  const { data } = await apiClient.delete<RemoveCollectionItemResponse>(
    `/collections/${collectionId}/whiskies`,
    { params: { whiskyIds }, paramsSerializer: { indexes: null } }
  );
  return data.data;
}

// 다른 콜렉션으로 옮기기. 제거와 달리 POST라 body를 두 번째 인자로 넘긴다.
export async function moveCollectionItems(
  collectionId: number,
  targetCollectionId: number,
  whiskyIds: number[]
): Promise<RemoveCollectionItemResponse['data']> {
  const { data } = await apiClient.post<RemoveCollectionItemResponse>(
    `/collections/${collectionId}/whiskies/move`,
    { targetCollectionId, whiskyIds }
  );
  return data.data;
}

/** 복사 API가 한 번에 받는 최대 위스키 수 (초과하면 서버가 400) */
export const COPY_COLLECTION_ITEMS_MAX = 20;

// 이동과 달리 출발 그룹에도 그대로 남는다. 도착 그룹에 이미 있는 건 서버가 건너뛴다.
// 204 No Content라 응답 본문이 없다.
export async function copyCollectionItems(
  collectionId: number,
  targetCollectionId: number,
  whiskyIds: number[]
): Promise<void> {
  await apiClient.post(`/collections/${collectionId}/whiskies/copy`, {
    targetCollectionId,
    whiskyIds,
  });
}

// 서버는 에러를 ProblemDetail(detail에 사용자용 메시지)로 내려준다.
// axios 에러의 message는 "Request failed with status code 409"라서 화면에 그대로 못 쓴다.
export function getCollectionErrorMessage(error: unknown): string {
  const detail = (error as AxiosError<ApiErrorResponse>)?.response?.data
    ?.detail;
  return detail || '요청을 처리하지 못했어요. 다시 시도해주세요.';
}
