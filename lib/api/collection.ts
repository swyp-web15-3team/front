import type { AxiosError } from 'axios';

import { apiClient } from '@/lib/api/client';
import {
  AddCollectionItemResponse,
  Collection,
  CollectionListResponse,
  CollectionWhiskyListRequest,
  CollectionWhiskyListResponse,
  RemoveCollectionItemResponse,
} from '@/types/collection';
import { ApiErrorResponse, ApiSuccessResponse } from '@/types/common';

// baseURL(NEXT_PUBLIC_API_URL)이 .../api/v1까지 포함하므로 여기서는 그 뒤 경로만 적는다.
export const COLLECTION_NAME_MAX_LENGTH = 100;

export async function fetchCollections(): Promise<
  CollectionListResponse['data']
> {
  const { data } = await apiClient.get<CollectionListResponse>('/collections');
  return data.data;
}

export async function fetchCollectionWhiskies(
  collectionId: number,
  { page, size }: CollectionWhiskyListRequest = {}
): Promise<CollectionWhiskyListResponse['data']> {
  const { data } = await apiClient.get<CollectionWhiskyListResponse>(
    `/collections/${collectionId}/whiskies`,
    { params: { page, size } }
  );
  return data.data;
}

export async function createCollection(rawName: string): Promise<Collection> {
  const { data } = await apiClient.post<ApiSuccessResponse<Collection>>(
    '/collections',
    { name: rawName.trim() }
  );
  return data.data;
}

export async function renameCollection(
  collectionId: number,
  rawName: string
): Promise<Collection> {
  const { data } = await apiClient.patch<ApiSuccessResponse<Collection>>(
    `/collections/${collectionId}`,
    { name: rawName.trim() }
  );
  return data.data;
}

export async function deleteCollection(
  collectionId: number
): Promise<{ id: number }> {
  await apiClient.delete(`/collections/${collectionId}`);
  return { id: collectionId };
}

export async function addCollectionItem(
  collectionId: number,
  whiskyId: number
): Promise<AddCollectionItemResponse['data']> {
  const { data } = await apiClient.put<AddCollectionItemResponse>(
    `/collections/${collectionId}/items/${whiskyId}`
  );
  return data.data;
}

export async function removeCollectionItem(
  collectionId: number,
  whiskyId: number
): Promise<RemoveCollectionItemResponse['data']> {
  const { data } = await apiClient.delete<RemoveCollectionItemResponse>(
    `/collections/${collectionId}/items/${whiskyId}`
  );
  return data.data;
}

// 서버는 에러를 ProblemDetail(detail에 사용자용 메시지)로 내려준다.
// axios 에러의 message는 "Request failed with status code 409"라서 화면에 그대로 못 쓴다.
export function getCollectionErrorMessage(error: unknown): string {
  const detail = (error as AxiosError<ApiErrorResponse>)?.response?.data
    ?.detail;
  return detail || '요청을 처리하지 못했어요. 다시 시도해주세요.';
}
