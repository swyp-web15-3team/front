'use client';

import { useEffect, useRef, useState } from 'react';

import { FilterChips } from '@/app/(main)/search/_components/FilterChips';
import {
  FilterModal,
  useFilterModal,
} from '@/app/(main)/search/_components/FilterModal';
import { PriceRangeField } from '@/app/(main)/search/_components/PriceRangeField';
import {
  EMPTY_SEARCH_FILTERS,
  FILTER_GROUP_LABELS,
} from '@/constants/search-filter';
import { Checkbox } from '@/components/ui/Checkbox';
import { useSearchFilterOptions } from '@/hooks/use-search-filter-options';
import { pushEscapeLayer } from '@/lib/escape-stack';
import { getFilterChips, toggleFilterOption } from '@/lib/search-filter';
import { cn } from '@/lib/utils';
import { FilterGroupKey, PriceRange, SearchFilters } from '@/types/search';
import { WhiskySort } from '@/types/whisky';

// TODO: 가격·가격차 정렬은 백엔드 협의 후 sort 값이 추가되면 옵션에 넣는다
const SORT_OPTIONS: { label: string; value: WhiskySort }[] = [
  { label: '이름순', value: 'name,asc' },
  { label: '최신순', value: 'id,desc' },
];

const PRICE_APPLY_DELAY_MS = 400;

function isSamePrice(a: PriceRange | null, b: PriceRange | null) {
  return a?.min === b?.min && a?.max === b?.max;
}

interface FilterBarProps {
  sort: WhiskySort;
  onSortChange: (sort: WhiskySort) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export function FilterBar({
  sort,
  onSortChange,
  filters,
  onFiltersChange: setFilters,
}: FilterBarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const { open: openFilterModal } = useFilterModal();
  const filterOptions = useSearchFilterOptions();

  const hasFilters = getFilterChips(filters).length > 0;

  const toggleOpen = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  const toggleOption = (group: FilterGroupKey, option: string) => {
    setFilters(toggleFilterOption(filters, group, option));
  };

  // 가격은 드래그·입력 중 매번 바뀌므로 입력 중엔 draft만 바꾸고, 멈추면 URL에 반영한다
  const [priceDraft, setPriceDraft] = useState(filters.price);
  const [prevPrice, setPrevPrice] = useState(filters.price);

  // 칩 삭제·모달 적용 등 밖에서 가격이 바뀌면 draft도 맞춘다 (렌더 중 state 조정 패턴)
  if (!isSamePrice(filters.price, prevPrice)) {
    setPrevPrice(filters.price);
    setPriceDraft(filters.price);
  }

  useEffect(() => {
    if (isSamePrice(priceDraft, filters.price)) return;
    const timer = setTimeout(
      () => setFilters({ ...filters, price: priceDraft }),
      PRICE_APPLY_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [priceDraft, filters, setFilters]);

  const renderOptionDropdown = (group: FilterGroupKey) => (
    <FilterDropdown
      key={group}
      label={FILTER_GROUP_LABELS[group]}
      variant="pill"
      isOpen={openKey === group}
      onToggle={() => toggleOpen(group)}
      onClose={() => setOpenKey(null)}
      hasActive={filters.options[group].length > 0}
    >
      <div className="flex flex-col gap-1">
        {filterOptions[group].map((option) => (
          <Checkbox
            key={option}
            checked={filters.options[group].includes(option)}
            onChange={() => toggleOption(group, option)}
            label={option}
            className="hover:bg-surface-muted rounded px-2 py-1.5 whitespace-nowrap"
          />
        ))}
      </div>
    </FilterDropdown>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-label="필터 열기"
          onClick={openFilterModal}
          className="bg-surface-sunken text-fg relative rounded-full p-2"
        >
          <FilterIcon className="size-4" />
          {hasFilters && (
            <span className="bg-brand absolute top-1 right-1 size-1.5 rounded-full" />
          )}
        </button>

        {renderOptionDropdown('category')}

        <FilterDropdown
          label="가격대"
          variant="pill"
          isOpen={openKey === 'price'}
          onToggle={() => toggleOpen('price')}
          onClose={() => setOpenKey(null)}
          hasActive={filters.price !== null}
        >
          <div className="w-80 p-2">
            <PriceRangeField value={priceDraft} onChange={setPriceDraft} />
          </div>
        </FilterDropdown>

        {renderOptionDropdown('priceGap')}

        <FilterDropdown
          label={
            SORT_OPTIONS.find((option) => option.value === sort)?.label ?? ''
          }
          variant="plain"
          isOpen={openKey === 'sort'}
          onToggle={() => toggleOpen('sort')}
          onClose={() => setOpenKey(null)}
          align="right"
          className="ml-auto"
        >
          <div className="flex flex-col">
            {SORT_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  onSortChange(value);
                  setOpenKey(null);
                }}
                className={cn(
                  'text-body-sm hover:bg-surface-muted rounded px-3 py-1.5 text-left whitespace-nowrap',
                  sort === value && 'font-bold'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterDropdown>
      </div>

      <FilterChips
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_SEARCH_FILTERS)}
        className="rounded-md"
      />

      <FilterModal filters={filters} onApply={setFilters} />
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
          'text-body-sm relative flex items-center gap-1 whitespace-nowrap',
          variant === 'pill'
            ? cn(
                'bg-surface-sunken rounded-full px-4 py-2',
                isOpen && 'bg-border'
              )
            : 'text-fg'
        )}
      >
        {label}
        {hasActive && (
          <span className="bg-primary absolute -top-0.5 -right-0.5 size-1.5 rounded-full" />
        )}
        <ChevronIcon
          className={cn('size-3 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div
          className={cn(
            'border-border glass shadow-overlay absolute top-full z-20 mt-2 min-w-40 rounded-lg border p-2',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function FilterIcon({ className }: { className?: string }) {
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
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
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
