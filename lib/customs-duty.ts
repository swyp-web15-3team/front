/**
 * 여행자 휴대품(주류) 예상 세액 계산. 2026-09 기준 대한민국 규정.
 *
 * 면세 한도 (관세청 여행자 휴대품 통관 기준):
 * - 주류는 기본면세범위(미화 $800)와 별도로 면세된다
 * - 총 용량 2L 이하 AND 총 가격 미화 $400 이하일 때 면세
 * - 2025-03-21 시행규칙 개정으로 "2병" 병 수 제한은 폐지됐다
 * - 한도를 넘으면 일부가 아니라 전량에 과세된다
 * - 만 19세 미만은 주류 면세범위가 없다
 *
 * 세율 (위스키, HS 2208.30):
 * - 관세 20% (국제협력관세. 기본세율은 30%지만 실제로는 20%가 적용된다.
 *   한-EU/영국 FTA 원산지는 0%지만 일본산은 협정 대상이 아니라 20%)
 * - 주세 72% (관세 포함 가격 기준), 교육세 = 주세액의 30%
 * - 부가세 10% (물품가 + 관세 + 주세 + 교육세 기준)
 * - 주류는 간이세율 적용 대상이 아니라 위 세목을 순차 계산한다 (관세법 제81조)
 *
 * 자진신고 시 관세의 30%를 감면한다 (20만원 한도).
 */

export const DUTY_FREE_VOLUME_ML = 2000;
export const DUTY_FREE_PRICE_USD = 400;

export const WHISKY_TARIFF_RATE = 0.2;
export const LIQUOR_TAX_RATE = 0.72;
export const EDUCATION_TAX_RATE = 0.3;
export const VAT_RATE = 0.1;

/** 자진신고 관세 감면율과 감면 한도 */
export const VOLUNTARY_DECLARATION_DISCOUNT = 0.3;
export const VOLUNTARY_DECLARATION_CAP_KRW = 200_000;

export interface DutyBottle {
  /** 한 병 가격 (원화 환산 전 현지 통화) */
  price: number;
  volumeMl: number;
  quantity: number;
}

export interface DutyInput {
  bottles: DutyBottle[];
  /** 현지 통화 1단위당 원화 (JPY면 100엔이 아니라 1엔당) */
  krwPerUnit: number;
  /** 미화 1달러당 원화. $400 한도 판정에 쓴다 */
  krwPerUsd: number;
  /** 자진신고 감면 적용 여부 */
  voluntaryDeclaration?: boolean;
}

export interface DutyResult {
  totalVolumeMl: number;
  /** 물품가 합계(원화) */
  priceKrw: number;
  /** 한도 판정에 쓴 물품가의 달러 환산액 */
  priceUsd: number;
  /** 면세 한도 안에 드는지 */
  isDutyFree: boolean;
  /** 초과한 한도. isDutyFree면 빈 배열 */
  exceeded: Array<'volume' | 'price'>;
  tariff: number;
  liquorTax: number;
  educationTax: number;
  vat: number;
  /** 감면 적용 후 총 세액 */
  totalTax: number;
  /** 물품가 + 총 세액 */
  totalWithTax: number;
}

/**
 * 한도를 넘으면 초과분이 아니라 전량에 과세된다.
 * krwPerUnit / krwPerUsd는 /exchange-rates 응답에서 가져온다.
 */
export function calculateLiquorDuty({
  bottles,
  krwPerUnit,
  krwPerUsd,
  voluntaryDeclaration = false,
}: DutyInput): DutyResult {
  const totalVolumeMl = bottles.reduce(
    (sum, b) => sum + b.volumeMl * b.quantity,
    0
  );
  const priceLocal = bottles.reduce((sum, b) => sum + b.price * b.quantity, 0);
  const priceKrw = priceLocal * krwPerUnit;
  const priceUsd = krwPerUsd > 0 ? priceKrw / krwPerUsd : 0;

  const exceeded: DutyResult['exceeded'] = [];
  if (totalVolumeMl > DUTY_FREE_VOLUME_ML) exceeded.push('volume');
  if (priceUsd > DUTY_FREE_PRICE_USD) exceeded.push('price');

  const base = {
    totalVolumeMl,
    priceKrw,
    priceUsd,
    isDutyFree: exceeded.length === 0,
    exceeded,
  };

  if (exceeded.length === 0) {
    return {
      ...base,
      tariff: 0,
      liquorTax: 0,
      educationTax: 0,
      vat: 0,
      totalTax: 0,
      totalWithTax: priceKrw,
    };
  }

  const tariff = priceKrw * WHISKY_TARIFF_RATE;
  const liquorTax = (priceKrw + tariff) * LIQUOR_TAX_RATE;
  const educationTax = liquorTax * EDUCATION_TAX_RATE;
  const vat = (priceKrw + tariff + liquorTax + educationTax) * VAT_RATE;

  const discount = voluntaryDeclaration
    ? Math.min(
        tariff * VOLUNTARY_DECLARATION_DISCOUNT,
        VOLUNTARY_DECLARATION_CAP_KRW
      )
    : 0;

  const totalTax = tariff + liquorTax + educationTax + vat - discount;

  return {
    ...base,
    tariff,
    liquorTax,
    educationTax,
    vat,
    totalTax,
    totalWithTax: priceKrw + totalTax,
  };
}
