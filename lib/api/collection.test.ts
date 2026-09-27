import { describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/lib/api/client';
import { addCollectionItem, removeCollectionItem } from '@/lib/api/collection';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

describe('관심 그룹 위스키 추가/제거', () => {
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

  it('DELETE /collections/{collectionId}/whiskies/{whiskyId}로 제거한다', async () => {
    const del = vi.spyOn(apiClient, 'delete').mockResolvedValue({
      data: { data: { collectionId: 1, whiskyId: 101, saved: false } },
    });

    await removeCollectionItem(1, 101);

    expect(del).toHaveBeenCalledWith('/collections/1/whiskies/101');
  });
});
