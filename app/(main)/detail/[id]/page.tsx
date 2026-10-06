import { cache } from 'react';
import { isAxiosError } from 'axios';
import type { Metadata } from 'next';
import Image from 'next/image';
import { DEFAULT_WHISKY_IMAGE } from '@/constants/images';
import { notFound } from 'next/navigation';

import { CommentSection } from '@/app/(main)/detail/_components/CommentSection';
import { EstimatedDuty } from '@/app/(main)/detail/_components/EstimatedDuty';
import { RelatedWhiskySection } from '@/app/(main)/detail/_components/RelatedWhiskySection';
import { SaveButton } from '@/app/(main)/detail/_components/SaveButton';
import { ShareButton } from '@/app/(main)/detail/_components/ShareButton';
import { ShopTable } from '@/app/(main)/detail/_components/ShopTable';
import { fetchRelatedWhiskies, fetchWhiskyDetail } from '@/lib/api/whisky';
import { findLowestPriceKrw, formatKrw } from '@/lib/sale-price';
import { WhiskyCard, WhiskyDetail } from '@/types/whisky';

// generateMetadata와 페이지가 같은 요청을 공유하도록 cache로 감싼다 (axios는 fetch처럼 자동 dedupe되지 않음)
const getWhiskyDetail = cache(
  async (whiskyId: number): Promise<WhiskyDetail> => {
    try {
      return await fetchWhiskyDetail(whiskyId);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) notFound();
      throw error;
    }
  }
);

function parseWhiskyId(id: string) {
  const whiskyId = Number(id);
  return Number.isInteger(whiskyId) && whiskyId > 0 ? whiskyId : null;
}

export async function generateMetadata({
  params,
}: PageProps<'/detail/[id]'>): Promise<Metadata> {
  const whiskyId = parseWhiskyId((await params).id);
  if (whiskyId === null) return {};

  const whisky = await getWhiskyDetail(whiskyId);
  return { title: whisky.name };
}

// 연관 위스키는 부가 정보라 실패해도 상세 화면은 그대로 보여준다
async function getRelatedWhiskies(whiskyId: number): Promise<WhiskyCard[]> {
  try {
    const { whiskies } = await fetchRelatedWhiskies(whiskyId);
    return whiskies;
  } catch {
    return [];
  }
}

export default async function DetailPage({
  params,
}: PageProps<'/detail/[id]'>) {
  const whiskyId = parseWhiskyId((await params).id);
  if (whiskyId === null) notFound();

  const [whisky, relatedWhiskies] = await Promise.all([
    getWhiskyDetail(whiskyId),
    getRelatedWhiskies(whiskyId),
  ]);

  const availableSales = whisky.saleProducts.filter((sale) => !sale.isSoldOut);
  const lowestPriceKrw = findLowestPriceKrw(availableSales);
  // 예상 관세는 들고 들어오는 경우(해외·면세점 구매)만 의미가 있다
  const lowestImportPriceKrw = findLowestPriceKrw(
    availableSales.filter(
      (sale) => sale.countryCode !== 'KR' || sale.isDutyFree
    )
  );

  const specs = [
    { label: '종류', value: whisky.category?.name },
    {
      label: '용량',
      value: whisky.volumeMl
        ? `${whisky.volumeMl.toLocaleString('ko-KR')}ml`
        : null,
    },
    {
      label: '도수',
      value: whisky.abv != null ? `${Number(whisky.abv)}%` : null,
    },
    {
      label: '원산지',
      value: [whisky.origin?.name, whisky.region?.name]
        .filter(Boolean)
        .join(' · '),
    },
    {
      label: '예상 관세',
      value: (
        <EstimatedDuty
          priceKrw={lowestImportPriceKrw}
          volumeMl={whisky.volumeMl}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-12 py-6 sm:gap-16 sm:py-10">
      <section className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="border-border bg-canvas relative aspect-square w-full overflow-hidden rounded-lg border">
          <Image
            src={whisky.imageUrl || DEFAULT_WHISKY_IMAGE}
            alt={whisky.name}
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            priority
            className="object-contain"
          />
        </div>

        <div className="flex flex-col md:pt-12">
          <h1 className="text-t7 font-bold">{whisky.name}</h1>
          {/* TODO: 영문명 필드가 API에 추가되면 이름 아래에 표시 */}

          <div className="mt-6">
            <p className="text-t8 text-danger font-bold tabular-nums">
              {lowestPriceKrw !== null
                ? formatKrw(lowestPriceKrw)
                : '가격 정보 없음'}
            </p>
            <p className="text-body-sm text-fg-muted mt-1">
              국내외 최저가 기준
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <ShareButton />
            <SaveButton
              whisky={{
                id: whisky.id,
                name: whisky.name,
                imageUrl: whisky.imageUrl,
              }}
            />
          </div>

          <dl className="text-body mt-6 flex max-w-80 flex-col gap-2">
            {specs.map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <dt className="text-fg-muted">{label}</dt>
                <dd className="text-fg font-medium">{value || '-'}</dd>
              </div>
            ))}
          </dl>

          <p className="border-border bg-canvas text-body-sm text-fg mt-6 rounded-md border px-4 py-4">
            1인당 주류 면세 한도는 2병(합산 2L 이하, $400 이하)입니다.
            <br />약 $125 내외는 단독 반입 시 세금이 부과되지 않는 면세
            상태입니다.
          </p>
        </div>
      </section>

      <section>
        <ShopTable
          sales={whisky.saleProducts}
          lowestPriceKrw={lowestPriceKrw}
        />
      </section>

      <RelatedWhiskySection whiskies={relatedWhiskies} />

      <CommentSection />
    </div>
  );
}
