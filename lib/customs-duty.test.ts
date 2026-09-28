import { describe, expect, it } from 'vitest';

import { calculateLiquorDuty } from '@/lib/customs-duty';

// 1엔 = 9원, 1달러 = 1400원 가정
const rates = { krwPerUnit: 9, krwPerUsd: 1400 };

describe('calculateLiquorDuty', () => {
  it('2L·$400 이내면 면세다', () => {
    const result = calculateLiquorDuty({
      bottles: [{ price: 12_000, volumeMl: 700, quantity: 2 }],
      ...rates,
    });

    expect(result.totalVolumeMl).toBe(1400);
    expect(result.isDutyFree).toBe(true);
    expect(result.totalTax).toBe(0);
    expect(result.totalWithTax).toBe(216_000);
  });

  it('병 수가 3병이어도 2L·$400 이내면 면세다 (2025-03-21 병 수 제한 폐지)', () => {
    const result = calculateLiquorDuty({
      bottles: [{ price: 6_000, volumeMl: 500, quantity: 3 }],
      ...rates,
    });

    expect(result.totalVolumeMl).toBe(1500);
    expect(result.isDutyFree).toBe(true);
  });

  it('용량이 2L를 넘으면 초과분이 아니라 전량에 과세한다', () => {
    const result = calculateLiquorDuty({
      bottles: [{ price: 5_000, volumeMl: 700, quantity: 3 }],
      ...rates,
    });

    expect(result.exceeded).toEqual(['volume']);
    // 물품가 135,000원 기준 순차 계산
    expect(result.tariff).toBeCloseTo(27_000);
    expect(result.liquorTax).toBeCloseTo(116_640);
    expect(result.educationTax).toBeCloseTo(34_992);
    expect(result.vat).toBeCloseTo(31_363.2);
    expect(result.totalTax).toBeCloseTo(209_995.2);
  });

  it('$400를 넘으면 용량이 2L 이내여도 과세한다', () => {
    const result = calculateLiquorDuty({
      bottles: [{ price: 70_000, volumeMl: 700, quantity: 1 }],
      ...rates,
    });

    // 630,000원 / 1400 = $450
    expect(result.priceUsd).toBeCloseTo(450);
    expect(result.exceeded).toEqual(['price']);
    expect(result.totalTax).toBeGreaterThan(0);
  });

  it('자진신고하면 관세의 30%를 감면한다', () => {
    const input = {
      bottles: [{ price: 5_000, volumeMl: 700, quantity: 3 }],
      ...rates,
    };
    const normal = calculateLiquorDuty(input);
    const declared = calculateLiquorDuty({
      ...input,
      voluntaryDeclaration: true,
    });

    expect(normal.totalTax - declared.totalTax).toBeCloseTo(
      normal.tariff * 0.3
    );
  });

  it('자진신고 감면은 20만원을 넘지 않는다', () => {
    const input = {
      bottles: [{ price: 1_000_000, volumeMl: 700, quantity: 3 }],
      ...rates,
    };
    const normal = calculateLiquorDuty(input);
    const declared = calculateLiquorDuty({
      ...input,
      voluntaryDeclaration: true,
    });

    expect(normal.tariff * 0.3).toBeGreaterThan(200_000);
    expect(normal.totalTax - declared.totalTax).toBeCloseTo(200_000);
  });
});
