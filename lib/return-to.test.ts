import { beforeEach, describe, expect, it } from 'vitest';

import { rememberReturnTo, takeReturnTo } from './return-to';

describe('returnTo', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('기록한 경로로 복귀하고, 한 번 쓰면 사라진다', () => {
    rememberReturnTo('/detail/123?tab=review');

    expect(takeReturnTo()).toBe('/detail/123?tab=review');
    // 소비 후에는 메인으로
    expect(takeReturnTo()).toBe('/');
  });

  it('기록이 없으면 메인으로 보낸다', () => {
    expect(takeReturnTo()).toBe('/');
  });

  it.each([
    ['https://evil.com', '외부 절대 URL'],
    ['//evil.com', '프로토콜 상대 URL'],
    ['/\\evil.com', '역슬래시 우회'],
    ['/login', '로그인 페이지'],
    ['/signup/terms', '가입 페이지'],
  ])('%s 는 기록하지 않는다 (%s)', (path) => {
    rememberReturnTo(path);

    expect(takeReturnTo()).toBe('/');
  });
});
