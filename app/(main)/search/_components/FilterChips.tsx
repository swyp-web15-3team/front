'use client';

import { getFilterChips } from '@/lib/search-filter';
import { cn } from '@/lib/utils';
import { SearchFilters } from '@/types/search';

interface FilterChipsProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  className?: string;
}

// 선택된 필터를 회색 영역에 텍스트 + X 버튼으로 보여준다. 선택이 없으면 렌더하지 않는다
export function FilterChips({
  filters,
  onChange,
  onReset,
  className,
}: FilterChipsProps) {
  const chips = getFilterChips(filters);
  if (chips.length === 0) return null;

  return (
    <div
      className={cn('bg-tertiary flex items-center gap-4 px-5 py-4', className)}
    >
      <ul className="flex min-w-0 flex-1 gap-4 overflow-x-auto whitespace-nowrap">
        {chips.map((chip) => (
          <li
            key={chip.id}
            className="flex items-center gap-0.5 text-sm text-gray-600"
          >
            {chip.label}
            <button
              type="button"
              aria-label={`${chip.label} 필터 해제`}
              onClick={() => onChange(chip.removed)}
            >
              <XIcon className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onReset}
        className="shrink-0 text-sm font-medium"
      >
        초기화
      </button>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
