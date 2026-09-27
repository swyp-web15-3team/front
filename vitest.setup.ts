import '@testing-library/jest-dom/vitest';

import { afterEach, vi } from 'vitest';

import { resetEscapeStack } from '@/lib/escape-stack';

// 테스트 환경엔 App Router가 마운트되지 않아 useRouter 등이 invariant 에러를 던지므로 mock한다
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  resetEscapeStack();
});
