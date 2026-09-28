import { describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/lib/api/client';
import {
  addCollectionItem,
  copyCollectionItems,
  moveCollectionItems,
  removeCollectionItems,
} from '@/lib/api/collection';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

describe('콜렉션 위스키 추가/제거', () => {
  // whiskyId는 경로가 아니라 body로 나간다.
  it('POST /collections/{collectionId}/whiskies에 whiskyId를 담아 추가한다', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { data: { collectionId: 1, whiskyId: 101, saved: true } },
    });

    const result = await addCollectionItem(1, 101);

    expect(post).toHaveBeenCalledWith('/collections/1/whiskies', {
      whiskyId: 101,
    });
    expect(result).toEqual({ collectionId: 1, whiskyId: 101, saved: true });
  });

  // 서버는 ?whiskyIds=4&whiskyIds=1 형태를 받는다. body도, whiskyIds[]도 아니다.
  it('DELETE /collections/{collectionId}/whiskies에 whiskyIds 쿼리로 제거한다', async () => {
    const del = vi.spyOn(apiClient, 'delete').mockResolvedValue({
      data: { data: { collectionId: 1, whiskyId: 101, saved: false } },
    });

    await removeCollectionItems(1, [101]);

    expect(del).toHaveBeenCalledWith('/collections/1/whiskies', {
      params: { whiskyIds: [101] },
      paramsSerializer: { indexes: null },
    });
  });

  it('다건도 같은 엔드포인트로 한 번에 제거한다', async () => {
    const del = vi.spyOn(apiClient, 'delete').mockResolvedValue({
      data: { data: { collectionId: 1, whiskyId: 101, saved: false } },
    });

    await removeCollectionItems(1, [101, 102, 103]);

    expect(del).toHaveBeenCalledWith('/collections/1/whiskies', {
      params: { whiskyIds: [101, 102, 103] },
      paramsSerializer: { indexes: null },
    });
  });
});

describe('콜렉션 위스키 이동', () => {
  it('POST /collections/{id}/whiskies/move에 대상 그룹과 whiskyIds를 담아 보낸다', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { data: { collectionId: 1, whiskyId: 101, saved: true } },
    });

    await moveCollectionItems(1, 2, [101, 102]);

    expect(post).toHaveBeenCalledWith('/collections/1/whiskies/move', {
      targetCollectionId: 2,
      whiskyIds: [101, 102],
    });
  });
});

describe('콜렉션 위스키 복사', () => {
  it('POST /collections/{id}/whiskies/copy에 대상 그룹과 whiskyIds를 담아 보낸다', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: '' });

    await copyCollectionItems(3, 7, [101, 102, 103]);

    expect(post).toHaveBeenCalledWith('/collections/3/whiskies/copy', {
      targetCollectionId: 7,
      whiskyIds: [101, 102, 103],
    });
  });
});
