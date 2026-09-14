import '@testing-library/jest-dom/vitest';

import { afterEach } from 'vitest';

import { resetEscapeStack } from '@/lib/escape-stack';

afterEach(() => {
  resetEscapeStack();
});
