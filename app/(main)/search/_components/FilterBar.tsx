'use client';

import { useEffect, useRef, useState } from 'react';

import { pushEscapeLayer } from '@/lib/escape-stack';
import { cn } from '@/lib/utils';

interface FilterGroup {
  key: string;
  label: string;
  options: string[];
}

// TODO: 필터/정렬 API 연동 후 옵션 목록을 서버 응답 기준으로 교체하고,
// selected/sort 값을 useProductListQuery 파라미터로 전달한다.
const FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'region',
    label: '생산 지역',
    options: ['스코틀랜드', '일본', '아일랜드', '미국', '캐나다'],
  },
  {
    key: 'blend',
    label: '블렌딩',
    options: ['싱글몰트', '블렌디드', '싱글그레인', '블렌디드 몰트'],
  },
  {
    key: 'priceRange',
    label: '가격대',
    options: ['10만원 이하', '10~20만원', '20~30만원', '30만원 이상'],
  },
  {
    key: 'priceGap',
    label: '가격 차이',
    options: ['10% 이상 차이', '20% 이상 차이', '30% 이상 차이'],
  },
];

const SORT_OPTIONS = [
  '추천순',
  '할인율 높은순',
  '한국가 낮은순',
  '한국가 높은순',
  '최신순',
];

const QUICK_TYPES = ['재패니스', '버번', '라이', '아이리시'];

export function FilterBar() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);

  const toggleOpen = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  const toggleOption = (groupKey: string, option: string) => {
    setSelected((prev) => {
      const current = prev[groupKey] ?? [];
      const next = current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option];
      return { ...prev, [groupKey]: next };
    });
  };

  const toggleType = (type: string) => {
    setActiveTypes((prev) =>
      prev.includes(type)
        ? prev.filter((value) => value !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_GROUPS.map((group) => (
          <FilterDropdown
            key={group.key}
            label={group.label}
            variant="pill"
            isOpen={openKey === group.key}
            onToggle={() => toggleOpen(group.key)}
            onClose={() => setOpenKey(null)}
            hasActive={(selected[group.key]?.length ?? 0) > 0}
          >
            <div className="flex flex-col gap-1">
              {group.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={(selected[group.key] ?? []).includes(option)}
                    onChange={() => toggleOption(group.key, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </FilterDropdown>
        ))}

        <FilterDropdown
          label={sort}
          variant="plain"
          isOpen={openKey === 'sort'}
          onToggle={() => toggleOpen('sort')}
          onClose={() => setOpenKey(null)}
          align="right"
          className="ml-auto"
        >
          <div className="flex flex-col">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSort(option);
                  setOpenKey(null);
                }}
                className={cn(
                  'rounded px-3 py-1.5 text-left text-sm whitespace-nowrap hover:bg-gray-50',
                  sort === option && 'font-bold'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </FilterDropdown>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_TYPES.map((type) => {
          const isActive = activeTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm',
                isActive
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300'
              )}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  variant: 'pill' | 'plain';
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  hasActive?: boolean;
  align?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}

function FilterDropdown({
  label,
  variant,
  isOpen,
  onToggle,
  onClose,
  hasActive = false,
  align = 'left',
  className,
  children,
}: FilterDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const { isTopLayer, pop } = pushEscapeLayer();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTopLayer()) onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      pop();
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className={cn('relative shrink-0', className)} ref={containerRef}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'relative flex items-center gap-1 text-sm whitespace-nowrap',
          variant === 'pill'
            ? cn('rounded-full bg-gray-100 px-4 py-2', isOpen && 'bg-gray-200')
            : 'text-gray-700'
        )}
      >
        {label}
        {hasActive && (
          <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-red-500" />
        )}
        <ChevronIcon
          className={cn('size-3 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div
          className={cn(
            'absolute top-full z-20 mt-2 min-w-40 rounded-md border border-gray-200 bg-white p-2 shadow-md',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
