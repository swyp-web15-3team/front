import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatRateDate } from '@/app/(main)/planner/_components/PlannerSummary';

describe('formatRateDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('오늘 고시분이면 날짜 대신 "오늘"로 줄인다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 28));

    expect(formatRateDate('2026-09-28')).toBe('오늘');
  });

  // 서버가 주말/공휴일 등으로 이전 영업일 고시를 내려주는 경우
  it('지난 날짜는 월/일로 표기하고 0을 떼어낸다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 28));

    expect(formatRateDate('2026-09-04')).toBe('9월 4일');
  });

  it('형식이 다르면 원본을 그대로 쓴다', () => {
    expect(formatRateDate('unknown')).toBe('unknown');
  });
});
