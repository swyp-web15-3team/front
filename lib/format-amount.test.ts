import { describe, expect, it } from 'vitest';

import { formatAmount } from '@/lib/utils';

describe('formatAmount', () => {
  it('소수 금액을 정수로 반올림하고 천 단위 콤마를 붙인다', () => {
    expect(formatAmount(42843.936)).toBe('42,844');
    expect(formatAmount(104000)).toBe('104,000');
    expect(formatAmount(0.4)).toBe('0');
  });

  it('값이 없으면 undefined를 반환한다', () => {
    expect(formatAmount(null)).toBeUndefined();
    expect(formatAmount(undefined)).toBeUndefined();
  });
});
