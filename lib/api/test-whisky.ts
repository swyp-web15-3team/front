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
