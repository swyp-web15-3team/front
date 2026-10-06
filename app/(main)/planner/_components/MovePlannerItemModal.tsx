'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DEFAULT_WHISKY_IMAGE } from '@/constants/images';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import { useMovePlannerItemsBulkMutation } from '@/hooks/queries/use-planner';
import { useWhiskyDetailQuery } from '@/hooks/queries/use-whisky';
import { useModal } from '@/hooks/use-modal';
import { cn, formatAmount } from '@/lib/utils';
import { PlannerItemGroup } from '@/types/planner';

interface MovePlannerItemModalProps {
  /** 구매 후보 목록. 여기서 고른 것만 구매 예정으로 올라간다. */
  candidates: PlannerItemGroup[];
}

export function useMovePlannerItemModal() {
  return useModal(MODAL_ID.MOVE_PLANNER_ITEM);
}

/**
 * 구매 예정 목록의 "추가하기". 새 위스키를 검색하는 게 아니라
 * 이미 담아둔 구매 후보 중에서 고른다. (검색해서 담는 건 후보 목록의 추가하기)
 */
export function MovePlannerItemModal({
  candidates,
}: MovePlannerItemModalProps) {
  const { isOpen, close } = useMovePlannerItemModal();
  const { mutate: moveItems, isPending } = useMovePlannerItemsBulkMutation();

  // 카드 단위로 고른다. 같은 상품의 병은 함께 움직인다.
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  function handleClose() {
    setSelectedIds(new Set());
    setErrorMessage('');
    close();
  }

  function toggle(saleProductId: number) {
    setErrorMessage('');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(saleProductId)) next.add(saleProductId);
      return next;
    });
  }

  function handleComplete() {
    setErrorMessage('');
    moveItems(
      {
        fromListType: 'CANDIDATE',
        toListType: 'PURCHASE',
        saleProductIds: Array.from(selectedIds),
      },
      {
        onSuccess: handleClose,
        onError: () => setErrorMessage('이동에 실패했어요. 다시 시도해주세요.'),
      }
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      panelClassName="bg-surface-muted flex h-[80vh] max-w-[900px] flex-col overflow-hidden p-0"
    >
      <div className="flex min-h-0 flex-1 flex-col p-8">
        <h2 className="text-section-title">구매 예정 상품 추가하기</h2>
        <p className="text-body-sm text-fg-muted mt-2">
          구매 후보 목록에서 구매할 상품을 선택하세요.
        </p>

        <div className="mt-6 min-h-0 flex-1">
          {candidates.length === 0 ? (
            <div className="bg-canvas text-caption text-fg-muted flex h-full items-center justify-center rounded-2xl">
              구매 후보 목록이 비어 있어요.
            </div>
          ) : (
            <ul className="bg-canvas h-full overflow-y-auto rounded-2xl p-3">
              {candidates.map((item) => (
                <li key={item.saleProductId} className="py-1">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-3">
                    <Checkbox
                      checked={selectedIds.has(item.saleProductId)}
                      onChange={() => toggle(item.saleProductId)}
                      aria-label={item.whiskyName}
                      className="ml-1 [&_span]:size-7"
                    />
                    <CandidateThumbnail
                      whiskyId={item.whiskyId}
                      saleProductId={item.saleProductId}
                      whiskyName={item.whiskyName}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm-strong truncate">
                        {item.whiskyName}
                        {item.quantity > 1 && (
                          <span className="text-fg-muted">
                            {' '}
                            × {item.quantity}
                          </span>
                        )}
                      </p>
                      <p className="text-body-sm text-fg-muted truncate">
                        {item.retailerName}
                      </p>
                      <p className="text-price">
                        {item.price?.amountKrw != null
                          ? `${formatAmount(item.price.amountKrw)}원`
                          : '-'}
                      </p>
                      <p className="text-price-sub text-fg-muted">
                        {item.price
                          ? `¥${formatAmount(item.price.amount)}`
                          : '-'}
                        {` · ${item.volumeMl}ml`}
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {errorMessage && (
          <p className="text-caption text-danger mt-2">{errorMessage}</p>
        )}
      </div>

      {/* 버튼 바만 흰 배경이라 회색 본문과 분리된다 */}
      <div className="bg-canvas shrink-0 px-8 py-6">
        <div className="flex gap-4">
          <Button variant="secondary" fullWidth onClick={handleClose}>
            취소
          </Button>
          <Button
            fullWidth
            disabled={selectedIds.size === 0 || isPending}
            onClick={handleComplete}
            className={cn(isPending && 'cursor-progress')}
          >
            {isPending ? '추가 중...' : `${selectedIds.size}개 상품 추가하기`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * 후보 썸네일. 플래너 응답엔 이미지가 없어서 위스키 상세로 가져온다.
 * 같은 위스키라도 판매처마다 사진이 달라 이 항목의 판매처 것을 먼저 쓴다.
 */
function CandidateThumbnail({
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

  const saleProductImage = data?.saleProducts.find(
    (sp) => sp.id === saleProductId
  )?.imageUrl;
  const imageUrl = saleProductImage || data?.imageUrl;

  return (
    <div className="border-border bg-surface-sunken relative size-20 shrink-0 overflow-hidden rounded-xl border">
      <Image
        src={imageUrl && !hasError ? imageUrl : DEFAULT_WHISKY_IMAGE}
        alt={whiskyName}
        fill
        sizes="80px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
