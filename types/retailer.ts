import { ApiSuccessResponse, CountryCode } from '@/types/common';

export interface Retailer {
  id: number;
  name: string;
  countryCode: CountryCode;
  isDutyFree: boolean;
}

// GET /api/v1/retailers
export interface RetailerListRequest {
  countryCode?: CountryCode;
  isDutyFree?: boolean;
}

interface RetailerListData {
  retailers: Retailer[];
}

export type RetailerListResponse = ApiSuccessResponse<RetailerListData>;
