import { CursorPageResponse } from '@/types/common';
import { Product } from '@/types/product';

export interface ProductListParams {
  cursor?: number;
  pageSize?: number;
}

export const DEFAULT_PRODUCT_PAGE_SIZE = 20;

const MOCK_PRODUCT: Product = {
  imageUrl: 'https://placehold.co/200x150.png',
  name: '야마자키 12년',
  originalName: '山崎 | Yamazaki 12yo',
  discountRate: -42,
  krPrice: 298000,
  jpPrice: 168500,
  jpPriceYen: 18500,
};

const MOCK_TOTAL_COUNT = 237;
const MOCK_NETWORK_DELAY_MS = 400;

// TODO: 검색 API 명세 확정 후 이 파일을 product.ts로 옮기고 아래 목업 대신
// apiClient.get('/products', { params })으로 교체한다.
// 반환 형태(CursorPageResponse<Product>)만 유지하면 useProductListQuery 쪽 수정 없이 교체 가능하다.
export async function fetchProducts({
  cursor = 0,
  pageSize = DEFAULT_PRODUCT_PAGE_SIZE,
}: ProductListParams = {}): Promise<CursorPageResponse<Product>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  const start = cursor;
  const end = Math.min(start + pageSize, MOCK_TOTAL_COUNT);
  const items = Array.from({ length: Math.max(end - start, 0) }, (_, i) => ({
    ...MOCK_PRODUCT,
    name: `${start + i + 1} ${MOCK_PRODUCT.name}`,
  }));

  return {
    items,
    nextCursor: end < MOCK_TOTAL_COUNT ? end : null,
  };
}
