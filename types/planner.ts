import { CountryCode } from '@/types/common';

export interface PlannerItemPrice {
  amount: number;
  currency: 'JPY';
  amountKrw: number | null;
  collectedAt: string;
  stale: boolean;
}

export interface PlannerItemExchange {
  source: string;
  krwPerJpy: number;
  validFrom: string;
  validTo: string;
}

export interface PlannerItem {
  plannerItemId: number;
  saleProductId: number;
  whiskyId: number;
  whiskyName: string;
  volumeMl: number;
  abv: number | null;
  retailerId: number;
  retailerName: string;
  countryCode: CountryCode;
  isDutyFree: boolean;
  productUrl: string;
  isSoldOut: boolean | null;
  price: PlannerItemPrice | null;
  exchange: PlannerItemExchange | null;
  computable: boolean;
}

export interface PlannerResponse {
  data: {
    items: PlannerItem[];
  };
}
