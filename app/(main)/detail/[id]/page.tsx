import { isAxiosError } from 'axios';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { CardShop } from '@/app/(main)/detail/_components/CardShop';
import { CommentSection } from '@/app/(main)/detail/_components/CommentSection';
import { SaveButton } from '@/app/(main)/detail/_components/SaveButton';
import { ShareButton } from '@/app/(main)/detail/_components/ShareButton';
import { fetchWhiskyDetail } from '@/lib/api/whisky';
import { SaleProduct, WhiskyDetail } from '@/types/whisky';

const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/300x350.png';

const SHOP_GROUPS: Array<{
  title: string;
  filter: (sale: SaleProduct) => boolean;
}> = [
  {
    title: '국내 대형마트',
    filter: (sale) => sale.countryCode === 'KR' && !sale.isDutyFree,
  },
  { title: '면세점', filter: (sale) => sale.isDutyFree },
  {
    title: '일본 로컬샵',
    filter: (sale) => sale.countryCode === 'JP' && !sale.isDutyFree,
  },
];

function formatKrw(amount: number) {
  return `${Math.round(amount).toLocaleString('ko-KR')}원`;
}

function formatSalePrice(sale: SaleProduct) {
  const { price } = sale;
  if (!price) return { price: '가격 정보 없음' };

  if (price.currency === 'KRW') return { price: formatKrw(price.amount) };

  const yen = `¥${Math.round(price.amount).toLocaleString('ko-KR')}`;
  return price.amountKrw != null
    ? { price: formatKrw(price.amountKrw), subPrice: ` (${yen})` }
    : { price: yen };
}

async function getWhiskyDetail(whiskyId: number): Promise<WhiskyDetail> {
  try {
    return await fetchWhiskyDetail(whiskyId);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) notFound();
    throw error;
  }
}

export default async function DetailPage({
  params,
}: PageProps<'/detail/[id]'>) {
  const { id } = await params;
  const whiskyId = Number(id);
  if (!Number.isInteger(whiskyId) || whiskyId <= 0) notFound();

  const whisky = await getWhiskyDetail(whiskyId);

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
      value: whisky.abv != null ? `${Number(whisky.abv).toFixed(1)}%` : null,
    },
    {
      label: '원산지',
      value: [whisky.origin?.name, whisky.region?.name]
        .filter(Boolean)
        .join(' · '),
    },
  ];

  return (
    <>
      <div className="flex gap-4">
        <div>
          <Image
            src={whisky.imageUrl || PLACEHOLDER_IMAGE_URL}
            alt={whisky.name}
            width={300}
            height={350}
            priority
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-page-title">{whisky.name}</p>
          <div>{/* 태그들 */}</div>
          <div className="text-body-sm flex flex-col">
            {specs.map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1">
                <p className="text-fg-muted">{label}</p>
                <p className="text-fg">{value || '-'}</p>
              </div>
            ))}
            {/* TODO: 예상 총 관세 계산 로직/API 연동 */}
          </div>
          <p className="border-border text-body-sm text-fg-muted rounded-md border p-3">
            1인당 주류 면세 한도는 합산 2L 이하, $400 이하입니다. (병 수 제한
            없음)
          </p>
          <div className="my-2 flex gap-2">
            <SaveButton
              whisky={{
                id: whisky.id,
                name: whisky.name,
                imageUrl: whisky.imageUrl,
              }}
            />
            <ShareButton />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3">
        {SHOP_GROUPS.map(({ title, filter }) => {
          const sales = whisky.saleProducts.filter(filter);

          return (
            <div key={title}>
              <p className="text-section-title mb-2">{title}</p>
              <div className="flex flex-col gap-2">
                {sales.length === 0 ? (
                  <p className="text-body-sm text-fg-muted">
                    판매처 정보가 없습니다
                  </p>
                ) : (
                  sales.map((sale) => (
                    <CardShop
                      key={sale.id}
                      shopName={sale.retailerName}
                      {...formatSalePrice(sale)}
                      addressName={sale.retailerAddress ?? sale.retailerName}
                      mapAddress={sale.retailerAddress ?? undefined}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CommentSection />
    </>
  );
}
