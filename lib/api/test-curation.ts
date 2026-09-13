import { Curation, CurationListResponse, WhiskyCard } from '@/types/whisky';

const MOCK_NETWORK_DELAY_MS = 400;

const MOCK_CURATION_WHISKIES: WhiskyCard[] = [
  {
    id: 101,
    name: '라가불린 16년',
    volumeMl: 700,
    abv: 43.0,
    category: { id: 1, name: '싱글 몰트' },
    kr: {
      amount: 240000,
      currency: 'KRW',
      retailerName: '롯데면세점',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    jp: {
      amount: 9800,
      currency: 'JPY',
      amountKrw: 182000,
      retailerName: '나리타 면세',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    comparison: { diffAmountKrw: 58000, diffRatio: 0.4, cheaperCountry: 'JP' },
  },
  {
    id: 102,
    name: '히비키 하모니',
    volumeMl: 700,
    abv: 43.0,
    category: { id: 2, name: '블렌디드' },
    kr: {
      amount: 130000,
      currency: 'KRW',
      retailerName: '신세계면세점',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    jp: {
      amount: 5200,
      currency: 'JPY',
      amountKrw: 96000,
      retailerName: '간사이공항 면세',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    comparison: { diffAmountKrw: 34000, diffRatio: 0.35, cheaperCountry: 'JP' },
  },
  {
    id: 103,
    name: '맥켈란 12년',
    volumeMl: 700,
    abv: 40.0,
    category: { id: 1, name: '싱글 몰트' },
    kr: {
      amount: 165000,
      currency: 'KRW',
      retailerName: '신라면세점',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    jp: {
      amount: 6800,
      currency: 'JPY',
      amountKrw: 126000,
      retailerName: '나리타 면세',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    comparison: { diffAmountKrw: 39000, diffRatio: 0.31, cheaperCountry: 'JP' },
  },
  {
    id: 104,
    name: '조니워커 블루라벨',
    volumeMl: 750,
    abv: 40.0,
    category: { id: 2, name: '블렌디드' },
    kr: {
      amount: 220000,
      currency: 'KRW',
      retailerName: '롯데면세점',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    jp: {
      amount: 9200,
      currency: 'JPY',
      amountKrw: 171000,
      retailerName: '하네다 면세',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    comparison: { diffAmountKrw: 49000, diffRatio: 0.29, cheaperCountry: 'JP' },
  },
  {
    id: 105,
    name: '글렌피딕 15년',
    volumeMl: 700,
    abv: 40.0,
    category: { id: 1, name: '싱글 몰트' },
    kr: {
      amount: 155000,
      currency: 'KRW',
      retailerName: '신라면세점',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    jp: {
      amount: 6200,
      currency: 'JPY',
      amountKrw: 115000,
      retailerName: '나리타 면세',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    comparison: { diffAmountKrw: 40000, diffRatio: 0.26, cheaperCountry: 'JP' },
  },
  {
    id: 106,
    name: '발베니 12년',
    volumeMl: 700,
    abv: 40.0,
    category: { id: 1, name: '싱글 몰트' },
    kr: {
      amount: 148000,
      currency: 'KRW',
      retailerName: '신세계면세점',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    jp: {
      amount: 6100,
      currency: 'JPY',
      amountKrw: 113000,
      retailerName: '간사이공항 면세',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    comparison: { diffAmountKrw: 35000, diffRatio: 0.24, cheaperCountry: 'JP' },
  },
  {
    id: 107,
    name: '탈리스커 10년',
    volumeMl: 700,
    abv: 45.8,
    category: { id: 1, name: '싱글 몰트' },
    kr: {
      amount: 138000,
      currency: 'KRW',
      retailerName: '롯데면세점',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    jp: {
      amount: 5800,
      currency: 'JPY',
      amountKrw: 107000,
      retailerName: '하네다 면세',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    comparison: { diffAmountKrw: 31000, diffRatio: 0.22, cheaperCountry: 'JP' },
  },
  {
    id: 108,
    name: '와일드터키 101',
    volumeMl: 700,
    abv: 50.5,
    category: { id: 3, name: '버번' },
    kr: {
      amount: 68000,
      currency: 'KRW',
      retailerName: '신라면세점',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    jp: {
      amount: 2900,
      currency: 'JPY',
      amountKrw: 53700,
      retailerName: '나리타 면세',
      collectedAt: '2026-09-08T03:00:00+09:00',
      stale: false,
    },
    comparison: { diffAmountKrw: 14300, diffRatio: 0.21, cheaperCountry: 'JP' },
  },
];

const MOCK_CURATIONS: Curation[] = [
  {
    id: 1,
    title: '한·일 가격 차이 TOP',
    whiskies: MOCK_CURATION_WHISKIES,
  },
];

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));
}

// TODO: 큐레이션 API 연동 후 apiClient.get<CurationListResponse>('/api/v1/curations')로 교체한다.
export async function fetchCurations(): Promise<CurationListResponse['data']> {
  await delay();
  return { curations: MOCK_CURATIONS };
}
