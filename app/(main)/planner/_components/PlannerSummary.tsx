'use client';

import {
  DUTY_FREE_PRICE_USD,
  DUTY_FREE_VOLUME_ML,
  type DutyResult,
} from '@/lib/customs-duty';
import { cn } from '@/lib/utils';

/** 남은 한도 한 칸. 남으면 파랑(더 살 수 있음), 넘치면 빨강(빼야 함). */
function LimitCard({
  remaining,
  limit,
  format,
  overLabel,
  underLabel,
}: {
  remaining: number;
  limit: number;
  format: (value: number) => string;
  overLabel: string;
  underLabel: string;
}) {
  const exceeded = remaining < 0;
  const amount = format(Math.abs(remaining));

  return (
    <div className="bg-surface-muted flex items-center justify-between gap-2 rounded-lg px-5 py-4">
      <p className="text-section-title text-fg">
        <span
          className={cn(
            'text-t9',
            exceeded ? 'text-danger' : 'text-primary-strong'
          )}
        >
          {amount}
        </span>{' '}
        {exceeded ? overLabel : underLabel}
      </p>
      <p className="text-body-sm tabular-nums">
        <span className={cn(exceeded ? 'text-danger' : 'text-primary-strong')}>
          {exceeded ? '-' : '+'}
          {amount}
        </span>
        <span className="text-fg-muted"> / {format(limit)}</span>
      </p>
    </div>
  );
}

/**
 * 고시 날짜를 캡션용으로 줄인다. 서버는 "조회한 날짜의 환율"을 하루 단위로
 * 캐싱해 내려주므로 시각이 없고, 오늘 날짜면 날짜를 읽을 이유도 없다.
 */
export function formatRateDate(date: string): string {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (date === todayKey) return '오늘';

  const [, month, day] = date.split('-');
  return month && day ? `${Number(month)}월 ${Number(day)}일` : date;
}

function RateCard({ value, caption }: { value: string; caption: string }) {
  return (
    <div className="bg-surface-muted flex items-center justify-between gap-2 rounded-lg px-5 py-3">
      <p className="text-body-sm-strong text-fg tabular-nums">{value}</p>
      <p className="text-caption text-fg-muted">{caption}</p>
    </div>
  );
}

export interface PlannerSummaryProps {
  duty: DutyResult;
  krwPerUsd: number | null;
  krwPerJpy: number | null;
  /** 고시 날짜 (YYYY-MM-DD). 하루 단위 값이라 시각은 없다 */
  rateDate?: string;
}

/** 상단 요약: 남은 면세 한도(금액·용량)와 오늘 환율. */
export function PlannerSummary({
  duty,
  krwPerUsd,
  krwPerJpy,
  rateDate,
}: PlannerSummaryProps) {
  const rateCaption = rateDate ? ` (${formatRateDate(rateDate)} 기준)` : '';

  return (
    <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
      <LimitCard
        remaining={DUTY_FREE_PRICE_USD - duty.priceUsd}
        limit={DUTY_FREE_PRICE_USD}
        format={(v) => `$${Math.round(v).toLocaleString('ko-KR')}`}
        underLabel="더 구매 가능해요"
        overLabel="를 빼야해요"
      />
      <LimitCard
        remaining={DUTY_FREE_VOLUME_ML - duty.totalVolumeMl}
        limit={DUTY_FREE_VOLUME_ML}
        format={(v) => `${v.toLocaleString('ko-KR')}ml`}
        underLabel="더 구매 가능해요"
        overLabel="를 빼야해요"
      />
      <RateCard
        value={
          krwPerUsd
            ? `₩${Math.round(krwPerUsd).toLocaleString('ko-KR')} ≈ $1`
            : '환율 정보 없음'
        }
        caption={`달러 환율${rateCaption}`}
      />
      <RateCard
        value={
          krwPerJpy
            ? `₩${Math.round(krwPerJpy * 100).toLocaleString('ko-KR')} ≈ ¥100`
            : '환율 정보 없음'
        }
        caption={`엔화 환율${rateCaption}`}
      />
    </div>
  );
}
