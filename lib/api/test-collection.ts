import { Collection, CollectionListResponse } from '@/types/collection';

const MOCK_NETWORK_DELAY_MS = 400;

const MOCK_COLLECTIONS: Collection[] = [
  { id: 1, name: '기본 관심 목록', isDefault: true },
  { id: 2, name: '커스텀 관심 목록 A', isDefault: false },
  { id: 3, name: '커스텀 관심 목록 B', isDefault: false },
  { id: 4, name: '커스텀 관심 목록 C', isDefault: false },
];

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));
}

// TODO: 컬렉션 API 연동 후 apiClient.get<CollectionListResponse>('/api/v1/collections')로 교체한다.
export async function fetchCollections(): Promise<
  CollectionListResponse['data']
> {
  await delay();
  return { collections: MOCK_COLLECTIONS };
}
