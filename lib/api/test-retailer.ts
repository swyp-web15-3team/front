import {
  Retailer,
  RetailerListRequest,
  RetailerListResponse,
} from '@/types/retailer';

const MOCK_NETWORK_DELAY_MS = 400;

const MOCK_RETAILERS: Retailer[] = [
  { id: 1, name: '롯데면세점', countryCode: 'KR', isDutyFree: true },
  { id: 2, name: '롯데마트', countryCode: 'KR', isDutyFree: false },
  { id: 3, name: '나리타 면세', countryCode: 'JP', isDutyFree: true },
  { id: 4, name: '돈키호테', countryCode: 'JP', isDutyFree: false },
];

// TODO: 판매처 API 연동 후 이 파일을 retailer.ts로 옮기고 아래 목업 대신
// apiClient.get<RetailerListResponse>('/api/v1/retailers', { params })로 교체한다.
// 반환 형태(RetailerListResponse['data'])만 유지하면 훅 수정 없이 교체 가능하다.
export async function fetchRetailers(
  params: RetailerListRequest = {}
): Promise<RetailerListResponse['data']> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  const retailers = MOCK_RETAILERS.filter((retailer) => {
    if (params.countryCode && retailer.countryCode !== params.countryCode) {
      return false;
    }
    if (
      params.isDutyFree !== undefined &&
      retailer.isDutyFree !== params.isDutyFree
    ) {
      return false;
    }
    return true;
  });

  return { retailers };
}
