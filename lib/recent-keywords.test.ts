import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  addRecentKeyword,
  getRecentKeywords,
  MAX_RECENT_KEYWORDS,
  removeRecentKeyword,
  subscribeRecentKeywords,
} from '@/lib/recent-keywords';

describe('recent-keywords', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('새 검색어를 맨 앞에 추가하고 앞뒤 공백을 제거한다', () => {
    addRecentKeyword('야마자키');
    addRecentKeyword('  히비키  ');

    expect(getRecentKeywords()).toEqual(['히비키', '야마자키']);
  });

  it('이미 있는 검색어는 중복 없이 맨 앞으로 옮긴다', () => {
    addRecentKeyword('야마자키');
    addRecentKeyword('히비키');
    addRecentKeyword('야마자키');

    expect(getRecentKeywords()).toEqual(['야마자키', '히비키']);
  });

  it('빈 검색어는 저장하지 않는다', () => {
    addRecentKeyword('   ');

    expect(getRecentKeywords()).toEqual([]);
  });

  it('최대 개수를 넘으면 가장 오래된 검색어부터 버린다', () => {
    for (let i = 0; i <= MAX_RECENT_KEYWORDS; i += 1) {
      addRecentKeyword(`keyword ${i}`);
    }

    const keywords = getRecentKeywords();
    expect(keywords).toHaveLength(MAX_RECENT_KEYWORDS);
    expect(keywords[0]).toBe(`keyword ${MAX_RECENT_KEYWORDS}`);
    expect(keywords).not.toContain('keyword 0');
  });

  it('검색어를 삭제한다', () => {
    addRecentKeyword('야마자키');
    addRecentKeyword('히비키');
    removeRecentKeyword('야마자키');

    expect(getRecentKeywords()).toEqual(['히비키']);
  });

  it('저장된 값이 깨져 있으면 빈 목록으로 취급한다', () => {
    window.localStorage.setItem('recentKeywords', '{not json');

    expect(getRecentKeywords()).toEqual([]);
  });

  it('값이 바뀌지 않으면 같은 배열 참조를 돌려준다', () => {
    addRecentKeyword('야마자키');

    expect(getRecentKeywords()).toBe(getRecentKeywords());
  });

  it('추가/삭제 시 구독자에게 알린다', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeRecentKeywords(listener);

    addRecentKeyword('야마자키');
    removeRecentKeyword('야마자키');
    unsubscribe();
    addRecentKeyword('히비키');

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
