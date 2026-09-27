'use client';

import {
  PRICE_HISTOGRAM,
  PRICE_MAX,
  PRICE_STEP,
} from '@/constants/search-filter';
import { formatWon, normalizePriceRange } from '@/lib/search-filter';
import { cn } from '@/lib/utils';
import { PriceRange } from '@/types/search';

interface PriceRangeFieldProps {
  value: PriceRange | null;
  onChange: (value: PriceRange | null) => void;
}

// 네이티브 range는 썸 중심이 양 끝에서 반지름(10px)만큼 안쪽에서 움직이므로,
// 트랙을 좌우로 10px씩 넓혀 썸 중심이 막대 시작/끝과 일치하게 한다
const THUMB_CLASSNAME =
  'pointer-events-none absolute -left-2.5 top-1/2 h-5 w-[calc(100%+20px)] -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-black [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black';

const HISTOGRAM_PEAK = Math.max(...PRICE_HISTOGRAM);
const BIN_SIZE = PRICE_MAX / PRICE_HISTOGRAM.length;

function clampPrice(amount: number) {
  return Math.min(Math.max(amount, 0), PRICE_MAX);
}

// 가격 입력 2칸 + 분포 히스토그램 + 양방향 슬라이더
export function PriceRangeField({ value, onChange }: PriceRangeFieldProps) {
  const { min, max } = value ?? { min: 0, max: PRICE_MAX };

  const update = (next: PriceRange) => onChange(normalizePriceRange(next));

  // 입력 중에는 min > max를 허용하고, blur 시 순서를 맞춘다
  const handleBlur = () => {
    if (min > max) update({ min: max, max: min });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {/* 하한 0 / 상한 PRICE_MAX는 "조건 없음"이라 입력칸을 비워 둔다 */}
        <PriceInput
          label="최소 가격"
          amount={min > 0 ? min : null}
          onChange={(amount) => update({ min: amount, max })}
          onClear={() => update({ min: 0, max })}
          onBlur={handleBlur}
        />
        <span className="h-px w-3 bg-gray-300" />
        <PriceInput
          label="최대 가격"
          amount={max < PRICE_MAX ? max : null}
          onChange={(amount) => update({ min, max: amount })}
          onClear={() => update({ min, max: PRICE_MAX })}
          onBlur={handleBlur}
        />
      </div>

      <div className="px-2.5">
        <div className="flex h-20 items-end gap-0.5">
          {PRICE_HISTOGRAM.map((count, index) => {
            const binStart = index * BIN_SIZE;
            // 가격 조건이 없으면 전체를 선택 안 된 상태로 보여준다
            const isInRange =
              value !== null && binStart + BIN_SIZE > min && binStart < max;
            return (
              <div
                key={index}
                className={cn(
                  'flex-1 rounded-t',
                  isInRange ? 'bg-brand' : 'bg-brand/15'
                )}
                style={{ height: `${(count / HISTOGRAM_PEAK) * 100}%` }}
              />
            );
          })}
        </div>
        {/* 썸(20px) 중심이 막대 바닥선에 오도록 절반만큼 끌어올린다 */}
        <div className="relative -mt-2.5 h-5">
          <input
            type="range"
            aria-label="최소 가격"
            min={0}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={min}
            onChange={(e) =>
              update({ min: Math.min(Number(e.target.value), max), max })
            }
            className={THUMB_CLASSNAME}
          />
          <input
            type="range"
            aria-label="최대 가격"
            min={0}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={max}
            onChange={(e) =>
              update({ min, max: Math.max(Number(e.target.value), min) })
            }
            className={THUMB_CLASSNAME}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <span>{formatWon(0)}</span>
          <span>{formatWon(PRICE_MAX / 2)}</span>
          <span>{formatWon(PRICE_MAX)} +</span>
        </div>
      </div>
    </div>
  );
}

interface PriceInputProps {
  label: string;
  /** null이면 입력 없음 (빈 칸) */
  amount: number | null;
  onChange: (amount: number) => void;
  onClear: () => void;
  onBlur: () => void;
}

function PriceInput({
  label,
  amount,
  onChange,
  onClear,
  onBlur,
}: PriceInputProps) {
  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    // 숫자를 전부 지우면 X 버튼과 똑같이 조건을 해제한다
    if (digits === '') onClear();
    else onChange(clampPrice(Number(digits)));
  };

  return (
    <div className="flex flex-1 items-center rounded-md border border-gray-200 px-3 py-2.5">
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        placeholder={label}
        value={amount === null ? '' : amount.toLocaleString('ko-KR')}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={onBlur}
        className="w-full min-w-0 text-sm outline-none placeholder:text-gray-400"
      />
      {amount !== null && (
        <>
          <span className="mr-2 text-sm">원</span>
          <button
            type="button"
            aria-label={`${label} 지우기`}
            onClick={onClear}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="size-4 text-gray-400"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
