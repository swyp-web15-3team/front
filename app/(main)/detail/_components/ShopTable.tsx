'use client';

import { useState } from 'react';

import { openGoogleMaps } from '@/lib/google-maps';
import { formatKrw, getSalePriceKrw } from '@/lib/sale-price';
import { cn } from '@/lib/utils';
import { CountryCode } from '@/types/common';
import { SaleProduct } from '@/types/whisky';

const INITIAL_VISIBLE_COUNT = 5;

const COUNTRY_LABEL: Record<CountryCode, string> = {
  KR: '한국',
  JP: '일본',
};

interface ShopTableProps {
  sales: SaleProduct[];
  /** 최저가 표시 기준(원화). null이면 최저가 표시를 하지 않는다 */
  lowestPriceKrw: number | null;
}

// 품절·가격 없음은 뒤로, 나머지는 원화 환산가 오름차순
function compareSale(a: SaleProduct, b: SaleProduct) {
  const soldOutDiff =
    Number(Boolean(a.isSoldOut)) - Number(Boolean(b.isSoldOut));
  if (soldOutDiff !== 0) return soldOutDiff;
  return (
    (getSalePriceKrw(a) ?? Number.POSITIVE_INFINITY) -
    (getSalePriceKrw(b) ?? Number.POSITIVE_INFINITY)
  );
}

export function ShopTable({ sales, lowestPriceKrw }: ShopTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedSales = [...sales].sort(compareSale);
  const visibleSales = isExpanded
    ? sortedSales
    : sortedSales.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = sortedSales.length > INITIAL_VISIBLE_COUNT && !isExpanded;

  if (sales.length === 0) {
    return (
      <p className="text-body-sm text-fg-muted py-10 text-center">
        판매처 정보가 없습니다
      </p>
    );
  }

  return (
    <div>
      <table className="w-full table-fixed text-left">
        <thead>
          <tr className="text-body-sm-strong text-fg">
            <th scope="col" className="pb-3 font-medium">
              판매처
            </th>
            <th scope="col" className="w-14 pb-3 font-medium sm:w-32">
              <span className="hidden sm:inline">구매 가능 </span>지역
            </th>
            <th scope="col" className="w-28 pb-3 font-medium sm:w-56">
              가격
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleSales.map((sale) => (
            <ShopRow
              key={sale.id}
              sale={sale}
              isLowest={
                lowestPriceKrw !== null &&
                !sale.isSoldOut &&
                getSalePriceKrw(sale) === lowestPriceKrw
              }
            />
          ))}
        </tbody>
      </table>

      {hasMore && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="bg-canvas text-body-sm text-fg hover:bg-surface-muted rounded-md px-4 py-2.5 shadow-sm"
          >
            더 많은 판매처 보기
          </button>
        </div>
      )}
    </div>
  );
}

function ShopRow({ sale, isLowest }: { sale: SaleProduct; isLowest: boolean }) {
  const priceKrw = getSalePriceKrw(sale);
  const { price } = sale;

  return (
    <tr className={cn(sale.isSoldOut && 'opacity-50')}>
      <td className="py-3">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {/* TODO: 판매처 로고 필드가 API에 추가되면 이미지로 교체 */}
          <span
            aria-hidden="true"
            className="border-border bg-surface-sunken text-body-sm-strong text-fg-muted flex size-8 shrink-0 items-center justify-center rounded-sm border sm:size-10"
          >
            {sale.retailerName.slice(0, 1)}
          </span>
          {/* 이름이 남는 폭을 다 차지해 아이콘이 이름 길이와 상관없이 오른쪽 끝에 정렬된다 */}
          <span className="text-body text-fg min-w-0 flex-1 truncate">
            {sale.retailerName}
          </span>
          {sale.productUrl && (
            <a
              href={sale.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${sale.retailerName} 상품 페이지 열기`}
              className="text-fg hover:text-fg-muted flex size-6 shrink-0 items-center justify-center sm:size-8"
            >
              <ExternalLinkIcon />
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              // TODO: 공통 토스트 유틸 도입 후 alert 교체
              if (!sale.retailerAddress) {
                alert('등록된 매장 주소가 없습니다.');
                return;
              }
              openGoogleMaps(sale.retailerAddress);
            }}
            aria-label={`${sale.retailerName} 위치 보기`}
            className="text-fg hover:text-fg-muted flex size-6 shrink-0 items-center justify-center sm:-ml-1 sm:size-8"
          >
            <MapPinIcon />
          </button>
        </div>
      </td>
      <td className="text-body text-fg py-3">
        {COUNTRY_LABEL[sale.countryCode]}
      </td>
      <td className="py-3">
        {sale.isSoldOut ? (
          <p className="text-body text-fg-muted">품절</p>
        ) : priceKrw === null ? (
          <p className="text-body-sm text-fg-muted">가격 정보 없음</p>
        ) : (
          <>
            <p
              className={cn(
                'text-price',
                isLowest ? 'text-danger max-sm:leading-tight' : 'text-fg'
              )}
            >
              {/* 모바일은 칸이 좁아 금액이 중간에서 끊기지 않게 "최저가"를 윗줄로 뺀다 */}
              {isLowest && (
                <span className="max-sm:text-t3 block sm:inline">최저가 </span>
              )}
              <span className="whitespace-nowrap">{formatKrw(priceKrw)}</span>
            </p>
            {price?.currency === 'JPY' && (
              <p className="text-price-sub text-fg-muted mt-1">
                ¥ {Math.round(price.amount).toLocaleString('ko-KR')}
              </p>
            )}
          </>
        )}
      </td>
    </tr>
  );
}

// TODO: 추후 아이콘 라이브러리로 교체
function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
