import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { guestAdapter, rememberWhiskyDetail } from '@/lib/api/guest-adapter';
import type { WhiskyDetail } from '@/types/whisky';

const whisky = {
  id: 7,
  name: '야마자키 12년',
  volumeMl: 700,
  abv: 43,
  category: { id: 1, name: '싱글몰트' },
  kr: null,
  jp: null,
  comparison: null,
  origin: null,
  region: null,
  saleProducts: [
    {
      id: 70,
      retailerName: '돈키호테',
      countryCode: 'JP',
      isDutyFree: false,
      productUrl: '',
      isSoldOut: false,
      price: null,
    },
  ],
} as WhiskyDetail;

async function call(
  method: string,
  url: string,
  data?: unknown,
  params?: unknown
) {
  const res = await guestAdapter({
    method,
    url,
    data: data && JSON.stringify(data),
    params,
  } as InternalAxiosRequestConfig);
  return res.data as { data: never };
}

describe('guestAdapter', () => {
  beforeEach(() => window.localStorage.clear());

  it('플래너 추가/이동/삭제가 localStorage에 남는다', async () => {
    rememberWhiskyDetail(whisky);
    await call('post', '/planners/items', {
      items: [{ saleProductId: 70, quantity: 2 }],
    });
    await call('patch', '/planners/move', {
      fromListType: 'CANDIDATE',
      toListType: 'PURCHASE',
      saleProductId: 70,
    });

    let { data } = await call('get', '/planners');
    expect(data).toMatchObject({
      items: [{ listType: 'PURCHASE', whiskyId: 7 }, {}],
    });

    await call('delete', '/planners/items', undefined, {
      listType: 'PURCHASE',
    });
    ({ data } = await call('get', '/planners'));
    expect(data).toEqual({ items: [] });
  });

  it('콜렉션 생성 후 담기/이동', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: whisky } });

    const { data: created } = await call('post', '/collections', {
      name: '여행',
    });
    const newId = (created as { id: number }).id;
    await call('post', '/collections/1/whiskies', { whiskyId: 7 });
    await call('post', '/collections/1/whiskies/move', {
      targetCollectionId: newId,
      whiskyIds: [7],
    });

    const from = await call('get', '/collections/1/whiskies');
    const to = await call('get', `/collections/${newId}/whiskies`);
    expect(from.data).toMatchObject({ items: [] });
    expect(to.data).toMatchObject({
      items: [{ id: 7, name: '야마자키 12년' }],
    });
    expect(to.data).not.toHaveProperty('items.0.saleProducts');
  });
});
