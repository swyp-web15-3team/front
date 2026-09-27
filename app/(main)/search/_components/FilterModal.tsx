'use client';

import { useState } from 'react';

import { FilterChips } from '@/app/(main)/search/_components/FilterChips';
import { PriceRangeField } from '@/app/(main)/search/_components/PriceRangeField';
import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import {
  EMPTY_SEARCH_FILTERS,
  FILTER_GROUP_LABELS,
} from '@/constants/search-filter';
import { useModal } from '@/hooks/use-modal';
import { useSearchFilterOptions } from '@/hooks/use-search-filter-options';
import { isSameFilters, toggleFilterOption } from '@/lib/search-filter';
import { cn } from '@/lib/utils';
import { FilterGroupKey, SearchFilters } from '@/types/search';

interface FilterModalProps {
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
}

export function useFilterModal() {
  return useModal(MODAL_ID.SEARCH_FILTER);
}

// 모달 안에서는 draft만 바꾸고, "상품보기"를 눌러야 실제 필터에 반영한다
export function FilterModal({ filters, onApply }: FilterModalProps) {
  const { isOpen, close } = useFilterModal();
  const [draft, setDraft] = useState(filters);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // 열릴 때마다 현재 적용된 필터로 draft를 초기화한다 (렌더 중 state 조정 패턴)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setDraft(filters);
  }

  const toggleDraftOption = (group: FilterGroupKey, option: string) => {
    setDraft((prev) => toggleFilterOption(prev, group, option));
  };

  const handleApply = () => {
    onApply(draft);
    close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      panelClassName="flex max-h-[90vh] max-w-[640px] flex-col p-0"
    >
      <h2 className="px-6 pt-6 pb-4 text-lg font-bold">필터</h2>

      <FilterChips
        filters={draft}
        onChange={setDraft}
        onReset={() => setDraft(EMPTY_SEARCH_FILTERS)}
      />

      <div className="flex flex-col gap-7 overflow-y-auto px-6 py-5">
        <OptionSection
          group="category"
          selected={draft.options.category}
          onToggle={(option) => toggleDraftOption('category', option)}
        />

        <section>
          <h3 className="mb-3 font-medium">가격</h3>
          <PriceRangeField
            value={draft.price}
            onChange={(price) => setDraft((prev) => ({ ...prev, price }))}
          />
        </section>

        <OptionSection
          group="priceGap"
          selected={draft.options.priceGap}
          onToggle={(option) => toggleDraftOption('priceGap', option)}
        />
      </div>

      <div className="flex gap-3 px-6 pt-2 pb-6">
        <button
          type="button"
          onClick={close}
          className="flex-1 rounded-md border border-gray-200 py-3.5"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={isSameFilters(draft, filters)}
          className="bg-brand flex-1 rounded-md py-3.5 text-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          상품보기
        </button>
      </div>
    </Modal>
  );
}

interface OptionSectionProps {
  group: FilterGroupKey;
  selected: string[];
  onToggle: (option: string) => void;
}

function OptionSection({ group, selected, onToggle }: OptionSectionProps) {
  const filterOptions = useSearchFilterOptions();

  return (
    <section>
      <h3 className="mb-3 font-medium">{FILTER_GROUP_LABELS[group]}</h3>
      <div className="flex flex-wrap gap-2">
        {filterOptions[group].map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option)}
              className={cn(
                'rounded-md border px-4 py-2 text-sm',
                isSelected ? 'border-black' : 'border-gray-200'
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}
