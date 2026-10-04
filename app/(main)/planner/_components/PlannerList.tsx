'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useWhiskyDetailQuery } from '@/hooks/queries/use-whisky';
import { cn, formatAmount } from '@/lib/utils';
import { PlannerItemGroup, PlannerListType } from '@/types/planner';

const COLUMNS = [
  '종류',
  '일본 최저가(엔화)',
  '일본 최저가(원화)',
  '가격 차이',
  '용량',
] as const;

// 금액 칸은 자릿수를 맞춰 비교하기 쉽게 오른쪽 정렬한다.
const MONEY_COLUMNS = new Set<(typeof COLUMNS)[number]>([
  '일본 최저가(엔화)',
  '일본 최저가(원화)',
  '가격 차이',
]);

// 수량 스테퍼가 들어가는 구매 예정 목록만 위스키 칸이 넓다.
const GRID_CLASSNAME = 'grid grid-cols-[1fr_repeat(5,minmax(0,8rem))] gap-2';

/**
 * 행 썸네일. 플래너 응답엔 이미지가 없어서 위스키 상세로 가져온다.
 * 판매처 드롭다운과 같은 쿼리(GET /whiskies/{id})라 캐시를 함께 쓴다.
 */
function RowThumbnail({
  whiskyId,
  saleProductId,
  whiskyName,
}: {
  whiskyId: number;
  saleProductId: number;
  whiskyName: string;
}) {
  const { data } = useWhiskyDetailQuery(whiskyId);
  const [hasError, setHasError] = useState(false);

  // 같은 위스키라도 판매처마다 사진이 달라서 이 행의 판매처 것을 먼저 쓴다.
  const saleProductImage = data?.saleProducts.find(
    (sp) => sp.id === saleProductId
  )?.imageUrl;
  const imageUrl = saleProductImage || data?.imageUrl;

  if (!imageUrl || hasError) {
    return (
      <div className="border-border bg-surface-sunken size-14 shrink-0 rounded-md border" />
    );
  }

  return (
    <div className="border-border bg-surface-sunken relative size-14 shrink-0 overflow-hidden rounded-md border">
      <Image
        src={imageUrl}
        alt={whiskyName}
        fill
        sizes="56px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

/**
 * 판매처 드롭다운. 플래너 응답엔 현재 판매처만 있어서, 열 때
 * 위스키 상세(GET /whiskies/{id})로 나머지 판매처를 불러온다.
 */
function RetailerSelect({
  item,
  onChange,
  isPending,
}: {
  item: PlannerItemGroup;
  onChange: (saleProductId: number) => void;
  isPending: boolean;
}) {
  // 표가 가로 스크롤(overflow)이라 absolute면 마지막 행에서 메뉴가 잘린다.
  // 그래서 버튼 위치를 재서 fixed로 띄운다.
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const isOpen = menuPosition !== null;
  const containerRef = useRef<HTMLDivElement>(null);
  // 썸네일이 이미 같은 쿼리를 쓰므로 여기서도 그냥 부른다(캐시 공유).
  const { data, isLoading } = useWhiskyDetailQuery(item.whiskyId);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuPosition(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setMenuPosition(null);
      }
    };
    // fixed 메뉴는 스크롤을 따라가지 않으므로 스크롤/리사이즈되면 닫는다.
    const close = () => setMenuPosition(null);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    // capture: 표의 가로 스크롤처럼 document까지 버블링되지 않는 스크롤도 잡는다
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  // 품절이거나 가격 없는 판매처는 서버가 400으로 거절하므로 뺀다.
  const saleProducts = (data?.saleProducts ?? []).filter(
    (sp) => !sp.isSoldOut && sp.price !== null
  );

  return (
    <div ref={containerRef} className="relative flex justify-end">
      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          if (isOpen) return setMenuPosition(null);
          const rect = e.currentTarget.getBoundingClientRect();
          setMenuPosition({
            top: rect.bottom + 4,
            // innerWidth는 스크롤바까지 포함해서 fixed 기준(clientWidth)과 어긋난다
            right: document.documentElement.clientWidth - rect.right,
          });
        }}
        aria-expanded={isOpen}
        aria-label="판매처 변경"
        className="text-body-sm text-fg flex items-center gap-1 tabular-nums disabled:opacity-50"
      >
        {item.price ? `¥${formatAmount(item.price.amount)}` : '-'}
        <ChevronUpDownIcon />
      </button>

      {isOpen && (
        <div
          style={menuPosition}
          className="border-border bg-canvas shadow-overlay fixed z-10 flex min-w-max flex-col rounded-xl border p-2"
        >
          {isLoading ? (
            <p className="text-body-sm text-fg-muted px-3 py-2">
              불러오는 중...
            </p>
          ) : saleProducts.length === 0 ? (
            <p className="text-body-sm text-fg-muted px-3 py-2">
              판매 중인 곳이 없습니다
            </p>
          ) : (
            saleProducts.map((saleProduct) => (
              <button
                key={saleProduct.id}
                type="button"
                onClick={() => {
                  setMenuPosition(null);
                  if (saleProduct.id !== item.saleProductId) {
                    onChange(saleProduct.id);
                  }
                }}
                className={cn(
                  'text-body-sm hover:bg-surface-muted rounded-lg px-3 py-2 text-left whitespace-nowrap',
                  saleProduct.id === item.saleProductId && 'font-bold'
                )}
              >
                {saleProduct.retailerName}
                {saleProduct.isDutyFree && ' 면세'}
                {saleProduct.price &&
                  ` (¥${formatAmount(saleProduct.price.amount)})`}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** 병 수 조절. + 는 한 병 추가, − 는 그룹에서 한 행 삭제다. */
function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  disabled,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled: boolean;
}) {
  return (
    <div className="border-border mr-6 flex shrink-0 items-stretch overflow-hidden rounded border">
      <button
        type="button"
        aria-label="수량 줄이기"
        // 0병이 되면 행이 사라지므로 카드 ✕와 헷갈리지 않게 1에서 막는다
        disabled={disabled || quantity <= 1}
        onClick={onDecrement}
        className={STEPPER_BUTTON_CLASSNAME}
      >
        <StepperIcon />
      </button>
      <span className="text-body-sm bg-canvas text-fg flex w-9 items-center justify-center tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="수량 늘리기"
        disabled={disabled}
        onClick={onIncrement}
        className={STEPPER_BUTTON_CLASSNAME}
      >
        <StepperIcon plus />
      </button>
    </div>
  );
}

// 비활성은 버튼을 흐리게 하지 않고 아이콘만 회색으로 바꾼다(디자인).
const STEPPER_BUTTON_CLASSNAME =
  'bg-surface-muted text-fg disabled:text-fg-subtle flex size-9 items-center justify-center disabled:cursor-not-allowed';

function StepperIcon({ plus = false }: { plus?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="size-4"
      aria-hidden
    >
      <path d={plus ? 'M5 12h14M12 5v14' : 'M5 12h14'} />
    </svg>
  );
}

function PlannerRow({
  item,
  listType,
  isDragging,
  showQuantity,
  isPending,
  isEditing,
  isSelected,
  onToggleSelect,
  onDragStart,
  onDragEnd,
  onIncrement,
  onDecrement,
  onChangeSaleProduct,
}: {
  item: PlannerItemGroup;
  listType: PlannerListType;
  isDragging: boolean;
  /** 구매 예정 목록만 병 수를 조절한다. 후보는 아직 살지 안 살지 모른다. */
  showQuantity: boolean;
  isPending: boolean;
  isEditing: boolean;
  isSelected: boolean;
  onToggleSelect: (saleProductId: number) => void;
  onDragStart: (plannerItemId: number) => void;
  onDragEnd: () => void;
  onIncrement: (item: PlannerItemGroup) => void;
  onDecrement: (item: PlannerItemGroup) => void;
  onChangeSaleProduct: (item: PlannerItemGroup, saleProductId: number) => void;
}) {
  return (
    <li
      draggable={!isEditing}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(item.plannerItemId));
        e.dataTransfer.setData('application/x-planner-from', listType);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(item.plannerItemId);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        GRID_CLASSNAME,
        'items-center py-3 transition-opacity',
        isEditing ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40'
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {isEditing && (
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect(item.saleProductId)}
            aria-label={item.whiskyName}
          />
        )}
        <RowThumbnail
          whiskyId={item.whiskyId}
          saleProductId={item.saleProductId}
          whiskyName={item.whiskyName}
        />
        <div className="min-w-0 flex-1">
          <p className="text-body-sm-strong text-fg truncate">
            {item.whiskyName}
          </p>
          <p className="text-body-sm text-fg-muted truncate">
            {item.retailerName}
          </p>
        </div>
        {showQuantity && (
          <QuantityStepper
            quantity={item.quantity}
            disabled={isPending || isEditing}
            onIncrement={() => onIncrement(item)}
            onDecrement={() => onDecrement(item)}
          />
        )}
      </div>
      <span className="text-body-sm text-fg">{item.category?.name ?? '-'}</span>
      <RetailerSelect
        item={item}
        isPending={isPending || isEditing}
        onChange={(saleProductId) => onChangeSaleProduct(item, saleProductId)}
      />
      <span className="text-body-sm text-fg text-right tabular-nums">
        {item.price?.amountKrw != null
          ? `₩${formatAmount(item.price.amountKrw)}`
          : '-'}
      </span>
      <span className="text-body-sm text-fg text-right tabular-nums">-</span>
      <span className="text-body-sm text-fg tabular-nums">
        {item.volumeMl}ml
      </span>
    </li>
  );
}

export interface PlannerListProps {
  title: string;
  listType: PlannerListType;
  items: PlannerItemGroup[];
  emptyMessage: string;
  draggingId: number | null;
  /** 구매 예정 목록만 병 수를 조절한다. */
  showQuantity?: boolean;
  isPending?: boolean;
  onDragStart: (plannerItemId: number) => void;
  onDragEnd: () => void;
  onDrop: (plannerItemId: number, from: PlannerListType) => void;
  /** 편집 모드에서 고른 상품들을 지운다. */
  onDelete: (saleProductIds: number[]) => void;
  onAdd: () => void;
  /** 추가할 대상이 없을 때 막는다(구매 예정은 후보에서 가져오므로 후보가 비면 못 연다). */
  isAddDisabled?: boolean;
  onIncrement: (item: PlannerItemGroup) => void;
  onDecrement: (item: PlannerItemGroup) => void;
  onChangeSaleProduct: (item: PlannerItemGroup, saleProductId: number) => void;
}

/** 목록 하나. 드래그로 다른 목록에서 항목을 받아온다. */
export function PlannerList({
  title,
  listType,
  items,
  emptyMessage,
  draggingId,
  showQuantity = false,
  isPending = false,
  onDragStart,
  onDragEnd,
  onDrop,
  onDelete,
  onAdd,
  isAddDisabled = false,
  onIncrement,
  onDecrement,
  onChangeSaleProduct,
}: PlannerListProps) {
  const [isOver, setIsOver] = useState(false);
  const [isEditingRequested, setIsEditingRequested] = useState(false);
  // 마지막 항목이 지워지면 편집할 게 없으니 모드도 자동으로 풀린다.
  const isEditing = isEditingRequested && items.length > 0;
  // 카드 단위로 고른다. 같은 상품의 병은 함께 지워진다.
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  function exitEditing() {
    setIsEditingRequested(false);
    setSelectedIds(new Set());
  }

  const isAllSelected =
    items.length > 0 &&
    items.every((item) => selectedIds.has(item.saleProductId));

  function toggleSelectAll() {
    setSelectedIds(
      isAllSelected
        ? new Set()
        : new Set(items.map((item) => item.saleProductId))
    );
  }

  function toggleSelect(saleProductId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(saleProductId)) next.add(saleProductId);
      return next;
    });
  }

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const plannerItemId = Number(e.dataTransfer.getData('text/plain'));
        const from = e.dataTransfer.getData(
          'application/x-planner-from'
        ) as PlannerListType;
        if (!plannerItemId || from === listType) return;
        onDrop(plannerItemId, from);
      }}
      className={cn(
        'rounded-lg transition-colors',
        isOver && 'bg-surface-muted ring-primary ring-2'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-section-title text-fg">{title}</h2>
        <div className="flex items-center gap-4">
          {/* 편집 모드에선 편집하기 자리가 삭제하기, 추가하기 자리가 완료가 된다 */}
          <button
            type="button"
            onClick={() => {
              if (!isEditing) return setIsEditingRequested(true);
              onDelete(Array.from(selectedIds));
              exitEditing();
            }}
            disabled={
              isEditing
                ? selectedIds.size === 0 || isPending
                : items.length === 0
            }
            className="text-body-sm text-fg hover:text-fg-muted disabled:hover:text-fg underline underline-offset-4 disabled:opacity-50"
          >
            {isEditing ? '삭제하기' : '편집하기'}
          </button>
          {isEditing ? (
            <Button className="min-h-9 px-4 py-2" onClick={exitEditing}>
              완료
            </Button>
          ) : (
            <Button
              className="min-h-9 px-4 py-2"
              onClick={onAdd}
              disabled={isAddDisabled}
            >
              추가하기
            </Button>
          )}
        </div>
      </div>

      {/* 좁은 화면에선 칸이 뭉개지지 않게 표 전체를 가로 스크롤한다 */}
      <div className="overflow-x-auto">
        <div className="min-w-256">
          <div className="border-border mt-4 border-b">
            <div
              className={cn(GRID_CLASSNAME, 'text-body-sm text-fg-muted pb-3')}
            >
              <div className="flex items-center gap-3">
                {isEditing && (
                  <Checkbox
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    aria-label="전체 선택"
                  />
                )}
                <span>위스키</span>
              </div>
              {COLUMNS.map((column) => (
                <span
                  key={column}
                  className={cn(MONEY_COLUMNS.has(column) && 'text-right')}
                >
                  {column}
                </span>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <p className="text-body-sm text-fg-muted py-6">{emptyMessage}</p>
          ) : (
            <ul className="divide-border divide-y">
              {items.map((item) => (
                <PlannerRow
                  key={item.plannerItemId}
                  item={item}
                  listType={listType}
                  isDragging={draggingId === item.plannerItemId}
                  showQuantity={showQuantity}
                  isPending={isPending}
                  isEditing={isEditing}
                  isSelected={selectedIds.has(item.saleProductId)}
                  onToggleSelect={toggleSelect}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                  onChangeSaleProduct={onChangeSaleProduct}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ChevronUpDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5 shrink-0"
      aria-hidden
    >
      <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
    </svg>
  );
}
