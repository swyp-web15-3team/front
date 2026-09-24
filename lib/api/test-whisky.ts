import { PlannerCandidate } from '@/types/planner';
import {
  SaleProduct,
  WhiskyCard,
  WhiskyCategory,
  WhiskyCategoryListResponse,
  WhiskyDetailResponse,
  WhiskyListItem,
  WhiskyListRequest,
  WhiskyListResponse,
  WhiskyRelatedListResponse,
} from '@/types/whisky';

const MOCK_NETWORK_DELAY_MS = 400;
const MOCK_TOTAL_ELEMENTS = 137;

const MOCK_CATEGORIES: WhiskyCategory[] = [
  { id: 1, name: '싱글 몰트' },
  { id: 2, name: '블렌디드' },
  { id: 3, name: '버번' },
];

const MOCK_WHISKY_CARD: WhiskyCard = {
  id: 1,
  name: 'Lagavulin 16',
  volumeMl: 700,
  abv: 43.0,
  category: MOCK_CATEGORIES[0],
  kr: {
    amount: 189000,
    currency: 'KRW',
    retailerName: '롯데면세점',
    collectedAt: '2026-09-08T03:00:00+09:00',
    stale: false,
  },
  jp: {
    amount: 9800,
    currency: 'JPY',
    amountKrw: 94000,
    retailerName: '나리타 면세',
    collectedAt: '2026-09-08T03:00:00+09:00',
    stale: false,
  },
  comparison: { diffAmountKrw: 95000, diffRatio: 0.5, cheaperCountry: 'JP' },
};

const MOCK_WHISKY: WhiskyListItem = {
  ...MOCK_WHISKY_CARD,
  origin: { id: 1, name: '스코틀랜드' },
  region: { id: 10, name: '아일라' },
};

const MOCK_SALE_PRODUCTS: SaleProduct[] = [
  {
    id: 501,
    retailerName: '롯데면세점',
    countryCode: 'KR',
    isDutyFree: true,
    productUrl: 'https://example.com/product/501',
    isSoldOut: false,
    price: {
      amount: 189000,
      currency: 'KRW',
      amountKrw: 189000,
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
  },
  {
    id: 502,
    retailerName: '나리타 면세',
    countryCode: 'JP',
    isDutyFree: true,
    productUrl: 'https://example.com/product/502',
    isSoldOut: false,
    price: {
      amount: 9800,
      currency: 'JPY',
      amountKrw: 94000,
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
  },
];

// 플래너/컬렉션 추가 모달에서 쓰는, 플래너에 추가 가능한 위스키 후보 전체 풀.
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
const MOCK_COLLECTION_CANDIDATE_IDS: Record<number, number[]> = {
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

// TODO: 위스키 목록 API 연동 후 이 파일을 whisky.ts로 옮기고 아래 목업 대신
// apiClient.get<WhiskyListResponse>('/api/v1/whiskies', { params })로 교체한다.
// 반환 형태(WhiskyListResponse['data'])만 유지하면 훅 수정 없이 교체 가능하다.
export async function fetchWhiskies({
  page = 0,
  size = 20,
}: WhiskyListRequest = {}): Promise<WhiskyListResponse['data']> {
  await delay();

  const start = page * size;
  const end = Math.min(start + size, MOCK_TOTAL_ELEMENTS);
  const content = Array.from({ length: Math.max(end - start, 0) }, (_, i) => ({
    ...MOCK_WHISKY,
    id: start + i + 1,
    name: `${start + i + 1} ${MOCK_WHISKY.name}`,
  }));

  return {
    content,
    page,
    size,
    totalElements: MOCK_TOTAL_ELEMENTS,
    totalPages: Math.ceil(MOCK_TOTAL_ELEMENTS / size),
  };
}

// TODO: 위스키 종류 API 연동 후 apiClient.get<WhiskyCategoryListResponse>('/api/v1/whisky-categories')로 교체한다.
export async function fetchWhiskyCategories(): Promise<
  WhiskyCategoryListResponse['data']
> {
  await delay();
  return { categories: MOCK_CATEGORIES };
}

// TODO: 위스키 상세 API 연동 후 apiClient.get<WhiskyDetailResponse>(`/api/v1/whiskies/${whiskyId}`)로 교체한다.
export async function fetchWhiskyDetail(
  whiskyId: number
): Promise<WhiskyDetailResponse['data']> {
  await delay();

  return {
    ...MOCK_WHISKY,
    id: whiskyId,
    saleProducts: MOCK_SALE_PRODUCTS,
  };
}

// TODO: 연관 위스키 API 연동 후 apiClient.get<WhiskyRelatedListResponse>(`/api/v1/whiskies/${whiskyId}/related`)로 교체한다.
export async function fetchRelatedWhiskies(
  whiskyId: number
): Promise<WhiskyRelatedListResponse['data']> {
  await delay();

  const whiskies = Array.from({ length: 4 }, (_, i) => ({
    ...MOCK_WHISKY_CARD,
    id: whiskyId + i + 1,
    name: `${whiskyId + i + 1} ${MOCK_WHISKY_CARD.name}`,
  }));

  return { whiskies };
}

// TODO: 위스키 검색 API 연동 후 apiClient.get<WhiskyListResponse>('/api/v1/whiskies', { params: { query } })로 교체한다.
// 플래너 추가 모달의 "전체" 탭에서 쓰는, 플래너에 추가 가능한 위스키 후보 검색.
export async function searchWhiskyCandidates(
  query: string
): Promise<PlannerCandidate[]> {
  await delay();

  const keyword = query.trim().toLowerCase();
  if (!keyword) return getAllCandidates();

  return getAllCandidates().filter(
    (item) =>
      item.whiskyName.toLowerCase().includes(keyword) ||
      item.whiskyOriginalName.toLowerCase().includes(keyword)
  );
}

// TODO: 컬렉션 아이템에 saleProductId가 생기면 실제 API(GET /collections/{id}/whiskies)로 교체한다.
// 플래너 추가 모달 전용 목업. 실제 컬렉션 API 응답에는 플래너 추가에 필요한
// saleProductId가 없어서, 그 탭만 아직 목업 후보 풀을 쓴다.
export async function fetchCollectionCandidates(
  collectionId: number
): Promise<{ items: PlannerCandidate[] }> {
  await delay();

  const saleProductIds = MOCK_COLLECTION_CANDIDATE_IDS[collectionId] ?? [];
  const items = saleProductIds
    .map(findCandidateBySaleProductId)
    .filter((item): item is PlannerCandidate => item !== undefined);

  return { items };
}
