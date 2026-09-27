import { beforeEach, describe, expect, it } from 'vitest';

import {
  peekLoginReturn,
  rememberCurrentPath,
  saveLoginReturn,
  takeLoginReturn,
} from '@/lib/login-return';

function setPath(path: string) {
  window.history.replaceState({}, '', path);
}

describe('login-return', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    setPath('/');
  });

  it('저장한 복귀 지점을 그대로 돌려준다', () => {
    saveLoginReturn({ path: '/detail/1', saveItem: { id: 1, name: '위스키' } });

    expect(peekLoginReturn()).toEqual({
      path: '/detail/1',
      saveItem: { id: 1, name: '위스키' },
    });
  });

  // 한 번 쓴 복귀 지점이 남아 있으면 다음 로그인이 엉뚱한 곳으로 간다.
  it('take는 한 번만 돌려주고 지운다', () => {
    saveLoginReturn({ path: '/detail/1' });

    expect(takeLoginReturn()?.path).toBe('/detail/1');
    expect(takeLoginReturn()).toBeNull();
  });

  it('peek는 지우지 않는다', () => {
    saveLoginReturn({ path: '/detail/1' });

    expect(peekLoginReturn()?.path).toBe('/detail/1');
    expect(peekLoginReturn()?.path).toBe('/detail/1');
  });

  // sessionStorage는 외부에서 심을 수 있으므로 외부 URL로 튕기면 안 된다.
  it.each(['//evil.com', 'https://evil.com', 'detail/1'])(
    '자체 출처가 아닌 경로(%s)는 무시한다',
    (path) => {
      window.sessionStorage.setItem('loginReturn', JSON.stringify({ path }));

      expect(peekLoginReturn()).toBeNull();
    }
  );

  it('깨진 JSON이어도 터지지 않는다', () => {
    window.sessionStorage.setItem('loginReturn', '{nope');

    expect(peekLoginReturn()).toBeNull();
  });

  it('쿼리스트링까지 포함해 현재 경로를 기억한다', () => {
    setPath('/search?query=macallan&page=2');
    rememberCurrentPath();

    expect(peekLoginReturn()?.path).toBe('/search?query=macallan&page=2');
  });

  // /login을 복귀 지점으로 저장하면 로그인 후 다시 로그인 페이지로 돌아간다.
  it.each(['/login', '/signup/terms'])(
    '%s는 복귀 지점으로 저장하지 않는다',
    (path) => {
      setPath(path);
      rememberCurrentPath();

      expect(peekLoginReturn()).toBeNull();
    }
  );
});
