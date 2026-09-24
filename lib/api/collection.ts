import { apiClient } from '@/lib/api/client';
import {
  AddCollectionItemResponse,
  Collection,
  CollectionItemListResponse,
  CollectionListResponse,
  RemoveCollectionItemResponse,
} from '@/types/collection';

/** 관심 그룹 이름 최대 길이 (서버가 400으로 거절하는 기준) */
export const COLLECTION_NAME_MAX_LENGTH = 100;

export async function fetchCollections(): Promise<
  CollectionListResponse['data']
> {
  const { data } = await apiClient.get<CollectionListResponse>('/collections');
  return data.data;
}

export async function fetchCollectionItems(
  collectionId: number
): Promise<CollectionItemListResponse['data']> {
  const { data } = await apiClient.get<CollectionItemListResponse>(
    `/collections/${collectionId}/items`
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

// 추가는 PUT이라 멱등이다. 이미 담긴 위스키를 다시 눌러도 409가 아니라 그대로 성공한다.
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
