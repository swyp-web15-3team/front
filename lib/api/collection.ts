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
    `/collections/${collectionId}/whiskies`
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

// 단건/다건 모두 whiskyIds 배열로 보낸다. DELETE는 axios에서 body를
// config.data로 넘겨야 한다(두 번째 인자가 body가 아니다).
export async function removeCollectionItems(
  collectionId: number,
  whiskyIds: number[]
): Promise<RemoveCollectionItemResponse['data']> {
  const { data } = await apiClient.delete<RemoveCollectionItemResponse>(
    `/collections/${collectionId}/whiskies`,
    { data: { whiskyIds } }
  );
  return data.data;
}

// 다른 컬렉션으로 옮기기. 제거와 달리 POST라 body를 두 번째 인자로 넘긴다.
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
