import { Collection, CollectionListResponse } from '@/types/collection';
import { ApiErrorResponse } from '@/types/common';

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

// POST /api/v1/collections 명세서(400/409)를 흉내낸 목업 에러.
// axios 인터셉터가 실제로 붙으면 error.response.data가 이 모양이 되므로 형태를 맞춰둔다.
export class MockApiError extends Error {
  status: number;
  data: ApiErrorResponse;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.data = { success: false, message };
  }
}

// TODO: 컬렉션 API 연동 후 apiClient.get<CollectionListResponse>('/api/v1/collections')로 교체한다.
export async function fetchCollections(): Promise<
  CollectionListResponse['data']
> {
  await delay();
  return { collections: MOCK_COLLECTIONS };
}

// TODO: 컬렉션 API 연동 후 apiClient.post<CollectionListResponse['data']['collections'][number]>('/api/v1/collections', { name })로 교체한다.
// 명세서(관심 그룹 생성) 기준 유효성 검증과 에러 케이스를 목업으로 재현한다.
export async function createCollection(rawName: string): Promise<Collection> {
  await delay();

  const name = rawName.trim();

  if (!name || name.length > 100) {
    throw new MockApiError(400, '관심 그룹 이름을 입력해 주세요.');
  }

  if (MOCK_COLLECTIONS.some((c) => c.name === name)) {
    throw new MockApiError(409, '이미 사용 중인 관심 그룹 이름입니다.');
  }

  // 개발 환경 QA용: 이름에 "실패"가 들어가면 500 에러 케이스를 바로 재현한다.
  if (process.env.NODE_ENV !== 'production' && name.includes('실패')) {
    throw new MockApiError(500, '서버 내부 오류가 발생했습니다.');
  }

  const newCollection: Collection = {
    id: Math.max(...MOCK_COLLECTIONS.map((c) => c.id)) + 1,
    name,
    isDefault: false,
  };
  MOCK_COLLECTIONS.push(newCollection);
  return newCollection;
}
