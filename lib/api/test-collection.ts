import {
  AddCollectionItemResponse,
  Collection,
  CollectionItemListResponse,
  CollectionListResponse,
} from '@/types/collection';
import { ApiErrorResponse } from '@/types/common';
import { PlannerCandidate } from '@/types/planner';

const MOCK_NETWORK_DELAY_MS = 400;
export const COLLECTION_NAME_MAX_LENGTH = 20;

const MOCK_COLLECTIONS: Collection[] = [
  { id: 1, name: '기본 관심 목록', isDefault: true },
  { id: 2, name: '커스텀 관심 목록 A', isDefault: false },
  { id: 3, name: '커스텀 관심 목록 B', isDefault: false },
  { id: 4, name: '커스텀 관심 목록 C', isDefault: false },
];

// 플래너 추가 모달(컬렉션 탭/전체 탭)에서 쓰는, 플래너에 추가 가능한 위스키 후보 전체 풀.
// saleProductId는 플래너 mock(test-planner.ts)의 addPlannerItem과 공유한다.
const MOCK_CANDIDATES: PlannerCandidate[] = [
  {
    saleProductId: 501,
    whiskyId: 101,
    whiskyName: '라가불린 16년',
    whiskyOriginalName: 'Lagavulin 16',
    volumeMl: 750,
    price: {
      amount: 9800,
      currency: 'JPY',
      amountKrw: 94000,
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
  },
  {
    saleProductId: 502,
    whiskyId: 102,
    whiskyName: '야마자키 12년',
    whiskyOriginalName: '山崎 12yo',
    volumeMl: 700,
    price: {
      amount: 18500,
      currency: 'JPY',
      amountKrw: 168500,
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
  },
  {
    saleProductId: 503,
    whiskyId: 103,
    whiskyName: '히비키 하모니',
    whiskyOriginalName: '響 Harmony',
    volumeMl: 700,
    price: {
      amount: 8000,
      currency: 'JPY',
      amountKrw: 76500,
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
  },
  {
    saleProductId: 504,
    whiskyId: 104,
    whiskyName: '하쿠슈 12년',
    whiskyOriginalName: '白州 12yo',
    volumeMl: 700,
    price: {
      amount: 12000,
      currency: 'JPY',
      amountKrw: 115000,
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
  },
  {
    saleProductId: 505,
    whiskyId: 105,
    whiskyName: '닛카 요이치',
    whiskyOriginalName: 'Nikka Yoichi',
    volumeMl: 700,
    price: {
      amount: 7500,
      currency: 'JPY',
      amountKrw: 72000,
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
  },
];

// 컬렉션 id -> 담긴 위스키(saleProductId 기준) 매핑
const MOCK_COLLECTION_ITEM_IDS: Record<number, number[]> = {
  1: [501, 502],
  2: [503],
  3: [504, 505],
  4: [],
};

export function findCandidateBySaleProductId(
  saleProductId: number
): PlannerCandidate | undefined {
  return MOCK_CANDIDATES.find((c) => c.saleProductId === saleProductId);
}

export function getAllCandidates(): PlannerCandidate[] {
  return MOCK_CANDIDATES;
}

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

// TODO: 컬렉션 상세 API 연동 후 apiClient.get<CollectionItemListResponse>(`/api/v1/collections/${collectionId}/items`)로 교체한다.
export async function fetchCollectionItems(
  collectionId: number
): Promise<CollectionItemListResponse['data']> {
  await delay();

  const saleProductIds = MOCK_COLLECTION_ITEM_IDS[collectionId] ?? [];
  const items = saleProductIds
    .map(findCandidateBySaleProductId)
    .filter((item): item is PlannerCandidate => item !== undefined);

  return { items };
}

// TODO: 컬렉션 API 연동 후 apiClient.post<CollectionListResponse['data']['collections'][number]>('/api/v1/collections', { name })로 교체한다.
// 명세서(관심 그룹 생성) 기준 유효성 검증과 에러 케이스를 목업으로 재현한다.
export async function createCollection(rawName: string): Promise<Collection> {
  await delay();

  const name = rawName.trim();

  if (!name) {
    throw new MockApiError(400, '관심 그룹 이름을 입력해 주세요.');
  }

  if (name.length > COLLECTION_NAME_MAX_LENGTH) {
    throw new MockApiError(
      400,
      `관심 그룹 이름은 ${COLLECTION_NAME_MAX_LENGTH}자 이하로 입력해 주세요.`
    );
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

// TODO: 컬렉션 API 연동 후 apiClient.put<AddCollectionItemResponse['data']>(`/api/v1/collections/${collectionId}/items/${whiskyId}`)로 교체한다.
// 명세서(관심 그룹에 위스키 추가) 기준 403/404 에러 케이스를 목업으로 재현한다.
export async function addCollectionItem(
  collectionId: number,
  whiskyId: number
): Promise<AddCollectionItemResponse['data']> {
  await delay();

  if (!MOCK_COLLECTIONS.some((c) => c.id === collectionId)) {
    throw new MockApiError(404, '관심 그룹을 찾을 수 없습니다.');
  }

  return { collectionId, whiskyId, saved: true };
}
