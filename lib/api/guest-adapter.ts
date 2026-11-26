import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { Collection } from '@/types/collection';
import type { PlannerItem, PlannerListType } from '@/types/planner';
import type { User } from '@/types/user';
import type { WhiskyDetail, WhiskyListItem } from '@/types/whisky';

/**
 * 비로그인(포트폴리오 체험) 사용자를 위한 가짜 백엔드.
 * 로그인 전용 API(플래너/콜렉션/내 정보)를 서버 대신 localStorage로 처리한다.
 * client.ts가 토큰이 없을 때 이 경로들만 이 어댑터로 보내므로, 화면/훅 코드는
 * 로그인 여부를 몰라도 그대로 동작한다.
 * ponytail: 로그인해도 게스트 데이터를 서버로 옮기지 않는다. 필요해지면 로그인 직후 일괄 업로드.
 */

const STORAGE_KEY = 'guestData';

const GUEST_ROUTE = /^\/(planners|collections|users\/me)(\/|$)/;

export function isGuestRoute(url = '') {
  return GUEST_ROUTE.test(url);
}

interface GuestData {
  nextId: number;
  nickname: string;
  planner: PlannerItem[];
  collections: Collection[];
  collectionItems: Record<number, WhiskyListItem[]>;
}

function initialData(): GuestData {
  return {
    nextId: 2,
    nickname: '게스트',
    planner: [],
    collections: [{ id: 1, name: '기본 콜렉션', isDefault: true }],
    collectionItems: { 1: [] },
  };
}

function load(): GuestData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GuestData;
  } catch {
    // 손상됐거나 접근이 막히면 새로 시작한다.
  }
  return initialData();
}

function save(data: GuestData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 시크릿 모드 등에서 저장이 막혀도 이번 요청은 응답한다.
  }
}

// 플래너 추가 요청엔 saleProductId만 오는데 행에는 위스키 정보가 필요하다.
// 화면은 항상 위스키 상세를 받아 판매처를 고르므로, 상세 응답에서 미리 모아둔다.
const saleProductWhisky = new Map<number, WhiskyDetail>();

export function rememberWhiskyDetail(detail: WhiskyDetail) {
  for (const sp of detail.saleProducts) saleProductWhisky.set(sp.id, detail);
}

async function fetchWhiskyListItem(
  config: InternalAxiosRequestConfig,
  whiskyId: number
): Promise<WhiskyListItem> {
  // apiClient를 쓰면 client.ts와 순환 참조가 되므로 기본 axios로 공개 API를 부른다.
  const { data } = await axios.get<{ data: WhiskyDetail }>(
    `/whiskies/${whiskyId}`,
    { baseURL: config.baseURL }
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { saleProducts, ...item } = data.data;
  return item;
}

function toPlannerItem(
  id: number,
  saleProductId: number,
  listType: PlannerListType
): PlannerItem {
  const whisky = saleProductWhisky.get(saleProductId);
  const sp = whisky?.saleProducts.find((p) => p.id === saleProductId);
  if (!whisky || !sp) throw new Error('unknown saleProduct');

  return {
    plannerItemId: id,
    listType,
    saleProductId,
    whiskyId: whisky.id,
    whiskyName: whisky.name,
    category: whisky.category,
    volumeMl: whisky.volumeMl,
    abv: whisky.abv,
    retailerId: 0,
    retailerName: sp.retailerName,
    countryCode: sp.countryCode,
    isDutyFree: sp.isDutyFree,
    productUrl: sp.productUrl,
    isSoldOut: sp.isSoldOut,
    price: sp.price && {
      amount: sp.price.amount,
      currency: 'JPY',
      amountKrw: sp.price.amountKrw,
      collectedAt: sp.price.collectedAt,
      stale: sp.price.stale,
    },
    exchange: null,
    computable: sp.price?.amountKrw != null,
  };
}

function fail(
  config: InternalAxiosRequestConfig,
  status: number,
  detail: string
) {
  const response = {
    data: { detail },
    status,
    statusText: '',
    headers: {},
    config,
  } as AxiosResponse;
  return new AxiosError(
    detail,
    AxiosError.ERR_BAD_REQUEST,
    config,
    null,
    response
  );
}

async function handle(
  config: InternalAxiosRequestConfig,
  db: GuestData
): Promise<unknown> {
  const method = (config.method ?? 'get').toLowerCase();
  const path = config.url ?? '';
  const body =
    typeof config.data === 'string'
      ? JSON.parse(config.data)
      : (config.data ?? {});
  const params = config.params ?? {};
  const seg = path.split('/').filter(Boolean);
  const nextId = () => db.nextId++;

  // ── 내 정보 ──
  if (seg[0] === 'users') {
    if (method === 'put') db.nickname = body.nickname;
    const user: User = { id: 0, nickname: db.nickname, profileImageUrl: '' };
    return { data: user };
  }

  // ── 플래너 ──
  if (seg[0] === 'planners') {
    if (method === 'get') return { data: { items: db.planner } };

    if (method === 'post') {
      const added: PlannerItem[] = [];
      for (const item of body.items as {
        saleProductId: number;
        quantity?: number;
        listType?: PlannerListType;
      }[]) {
        for (let i = 0; i < (item.quantity ?? 1); i++) {
          try {
            added.push(
              toPlannerItem(
                nextId(),
                item.saleProductId,
                item.listType ?? 'CANDIDATE'
              )
            );
          } catch {
            throw fail(
              config,
              400,
              '상품 정보를 찾을 수 없어요. 다시 시도해주세요.'
            );
          }
        }
      }
      db.planner.push(...added);
      return { data: { items: added } };
    }

    if (method === 'delete' && seg[2]) {
      db.planner = db.planner.filter((i) => i.plannerItemId !== Number(seg[2]));
      return null;
    }

    const matches = (
      i: PlannerItem,
      listType?: string,
      saleProductId?: number
    ) =>
      (listType === undefined || i.listType === listType) &&
      (saleProductId === undefined ||
        i.saleProductId === Number(saleProductId));

    if (method === 'delete') {
      db.planner = db.planner.filter(
        (i) => !matches(i, params.listType, params.saleProductId)
      );
      return null;
    }

    if (method === 'patch') {
      db.planner = db.planner.map((i) =>
        matches(i, body.fromListType, body.saleProductId)
          ? { ...i, listType: body.toListType }
          : i
      );
      return null;
    }
  }

  // ── 콜렉션 ──
  if (seg[0] === 'collections') {
    const id = seg[1] ? Number(seg[1]) : undefined;
    const collection = db.collections.find((c) => c.id === id);
    if (id !== undefined && !collection)
      throw fail(config, 404, '콜렉션을 찾을 수 없어요.');

    if (id === undefined) {
      if (method === 'get') return { data: { collections: db.collections } };
      if (db.collections.some((c) => c.name === body.name)) {
        throw fail(config, 409, '이미 같은 이름의 콜렉션이 있어요.');
      }
      const created: Collection = {
        id: nextId(),
        name: body.name,
        isDefault: false,
      };
      db.collections.push(created);
      db.collectionItems[created.id] = [];
      return { data: created };
    }

    const items = (db.collectionItems[id] ??= []);

    if (seg.length === 2) {
      if (method === 'patch') {
        collection!.name = body.name;
        return { data: collection };
      }
      db.collections = db.collections.filter((c) => c.id !== id);
      delete db.collectionItems[id];
      return null;
    }

    if (seg[2] === 'whiskies' && seg.length === 3) {
      if (method === 'get') {
        return {
          data: {
            items,
            page: 0,
            size: items.length,
            totalElements: items.length,
            totalPages: 1,
          },
        };
      }
      if (method === 'post') {
        if (!items.some((w) => w.id === body.whiskyId)) {
          items.unshift(await fetchWhiskyListItem(config, body.whiskyId));
        }
        return {
          data: { collectionId: id, whiskyId: body.whiskyId, saved: true },
        };
      }
      // delete: ?whiskyIds=1&whiskyIds=2
      const ids = ([] as unknown[]).concat(params.whiskyIds).map(Number);
      db.collectionItems[id] = items.filter((w) => !ids.includes(w.id));
      return { data: { collectionId: id, whiskyId: ids[0], saved: false } };
    }

    // move / copy
    const target = (db.collectionItems[body.targetCollectionId] ??= []);
    const picked = items.filter((w) => body.whiskyIds.includes(w.id));
    target.unshift(...picked.filter((w) => !target.some((t) => t.id === w.id)));
    if (seg[3] === 'move') {
      db.collectionItems[id] = items.filter(
        (w) => !body.whiskyIds.includes(w.id)
      );
    }
    return null;
  }

  throw fail(config, 404, '지원하지 않는 요청이에요.');
}

export async function guestAdapter(
  config: InternalAxiosRequestConfig
): Promise<AxiosResponse> {
  const db = load();
  const data = await handle(config, db);
  save(db);
  return { data, status: 200, statusText: 'OK', headers: {}, config };
}
