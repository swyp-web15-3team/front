import { describe, expect, it } from 'vitest';

import { diffCollectionIds } from '@/components/common/SaveItemModal';

describe('diffCollectionIds', () => {
  it('새로 체크한 컬렉션만 추가 대상이다', () => {
    const { toAdd, toRemove } = diffCollectionIds(
      new Set([1]),
      new Set([1, 2, 3])
    );

    expect(toAdd).toEqual([2, 3]);
    expect(toRemove).toEqual([]);
  });

  it('체크 해제한 컬렉션은 제거 대상이다', () => {
    const { toAdd, toRemove } = diffCollectionIds(
      new Set([1, 2]),
      new Set([2])
    );

    expect(toAdd).toEqual([]);
    expect(toRemove).toEqual([1]);
  });

  it('추가와 제거가 동시에 일어날 수 있다', () => {
    const { toAdd, toRemove } = diffCollectionIds(
      new Set([1, 2]),
      new Set([2, 3])
    );

    expect(toAdd).toEqual([3]);
    expect(toRemove).toEqual([1]);
  });

  // 변경이 없으면 '적용하기'가 비활성화되어야 하므로 양쪽 모두 비어야 한다.
  it('서버 상태와 같으면 보낼 것이 없다', () => {
    const { toAdd, toRemove } = diffCollectionIds(
      new Set([1, 2]),
      new Set([2, 1])
    );

    expect(toAdd).toEqual([]);
    expect(toRemove).toEqual([]);
  });
});
