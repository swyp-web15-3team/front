'use client';

import { useState } from 'react';

import {
  DUTY_FREE_PRICE_USD,
  DUTY_FREE_VOLUME_ML,
  EDUCATION_TAX_RATE,
  LIQUOR_TAX_RATE,
  VAT_RATE,
  VOLUNTARY_DECLARATION_CAP_KRW,
  VOLUNTARY_DECLARATION_DISCOUNT,
  WHISKY_TARIFF_RATE,
  type DutyResult,
} from '@/lib/customs-duty';
import { cn } from '@/lib/utils';

function formatKrw(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}

function percent(rate: number) {
  return `${rate * 100}%`;
}

/** 한도 하나에 대한 진행 막대. 초과하면 빨갛게 바뀐다. */
function LimitGauge({
  label,
  value,
  limit,
  formatValue,
  caption,
}: {
  label: string;
  value: number;
  limit: number;
  formatValue: (value: number) => string;
  caption?: string;
}) {
  const ratio = limit > 0 ? Math.min(value / limit, 1) : 0;
  const exceeded = value > limit;

  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p
          className={cn(
            'text-sm tabular-nums',
            exceeded ? 'font-semibold text-red-600' : 'text-gray-500'
          )}
        >
          <span className={cn(exceeded && 'text-red-600')}>
            {formatValue(value)}
          </span>
          <span className="text-gray-400"> / {formatValue(limit)}</span>
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300 ease-out',
            exceeded ? 'bg-red-500' : 'bg-gray-900'
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      {caption && <p className="mt-1 text-xs text-gray-400">{caption}</p>}
    </div>
  );
}

function TaxRow({
  label,
  hint,
  amount,
}: {
  label: string;
  hint: string;
  amount: number;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5">
      <div className="min-w-0">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="ml-1.5 text-xs text-gray-400">{hint}</span>
      </div>
      <span className="shrink-0 text-sm text-gray-900 tabular-nums">
        {formatKrw(amount)}
      </span>
    </div>
  );
}

export interface DutyFreeGuideProps {
  duty: DutyResult;
  /** 환율을 못 받아왔을 때. $400 한도 판정이 불가능하다 */
  rateUnavailable?: boolean;
}

/**
 * 구매 리스트의 면세 한도 현황과, 초과 시 예상 세액 내역을 보여준다.
 * 세율/한도 근거는 lib/customs-duty.ts 주석 참고.
 */
export function DutyFreeGuide({ duty, rateUnavailable }: DutyFreeGuideProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { isDutyFree, exceeded } = duty;

  const exceededLabel = [
    exceeded.includes('volume') && '용량',
    exceeded.includes('price') && '금액',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section
      aria-label="면세 한도 안내"
      className={cn(
        'rounded-xl border p-4',
        isDutyFree ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {isDutyFree
              ? '면세 범위 안이에요'
              : `면세 한도 초과 (${exceededLabel})`}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            1인 기준 · 합산 {DUTY_FREE_VOLUME_ML.toLocaleString('ko-KR')}ml 이하
            AND ${DUTY_FREE_PRICE_USD} 이하
          </p>
        </div>
        {!isDutyFree && (
          <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
            예상 세금 {formatKrw(duty.totalTax)}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:gap-6">
        <LimitGauge
          label="총 용량"
          value={duty.totalVolumeMl}
          limit={DUTY_FREE_VOLUME_ML}
          formatValue={(v) => `${v.toLocaleString('ko-KR')}ml`}
        />
        <LimitGauge
          label="총 금액"
          value={duty.priceUsd}
          limit={DUTY_FREE_PRICE_USD}
          formatValue={(v) => `$${Math.round(v).toLocaleString('ko-KR')}`}
          caption={
            rateUnavailable
              ? '환율을 불러오지 못해 금액 한도는 확인할 수 없어요'
              : formatKrw(duty.priceKrw)
          }
        />
      </div>

      {!isDutyFree && (
        <>
          <p className="mt-4 text-xs leading-relaxed text-red-700">
            한도를 넘으면 <b>초과분이 아니라 전량</b>에 세금이 붙어요. 입국 시
            자진신고하면 관세의 {percent(VOLUNTARY_DECLARATION_DISCOUNT)}를(최대{' '}
            {VOLUNTARY_DECLARATION_CAP_KRW.toLocaleString('ko-KR')}원) 깎아주고,
            신고하지 않다가 적발되면 가산세가 붙습니다.
          </p>

          <button
            type="button"
            onClick={() => setIsDetailOpen((open) => !open)}
            aria-expanded={isDetailOpen}
            className="mt-3 text-xs text-gray-600 underline underline-offset-2 hover:text-gray-900"
          >
            {isDetailOpen ? '세금 상세 접기' : '세금 상세 보기'}
          </button>

          {isDetailOpen && (
            <div className="mt-3 rounded-lg border border-red-100 bg-white p-3">
              <div className="divide-y divide-gray-100">
                <TaxRow
                  label="물품가"
                  hint="구매 리스트 합계"
                  amount={duty.priceKrw}
                />
                <TaxRow
                  label="관세"
                  hint={`물품가의 ${percent(WHISKY_TARIFF_RATE)}`}
                  amount={duty.tariff}
                />
                <TaxRow
                  label="주세"
                  hint={`(물품가+관세)의 ${percent(LIQUOR_TAX_RATE)}`}
                  amount={duty.liquorTax}
                />
                <TaxRow
                  label="교육세"
                  hint={`주세의 ${percent(EDUCATION_TAX_RATE)}`}
                  amount={duty.educationTax}
                />
                <TaxRow
                  label="부가세"
                  hint={`위 합계의 ${percent(VAT_RATE)}`}
                  amount={duty.vat}
                />
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t-2 border-gray-900 pt-2">
                <span className="text-sm font-semibold">예상 총액</span>
                <span className="text-right">
                  <span className="block text-base font-bold tabular-nums">
                    {formatKrw(duty.totalWithTax)}
                  </span>
                  <span className="block text-xs text-red-600 tabular-nums">
                    세금 {formatKrw(duty.totalTax)}
                  </span>
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                위스키(HS 2208.30) 기준 추정치예요. 실제 세액은 환율·품목 분류에
                따라 달라질 수 있어요.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
