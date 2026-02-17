import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend both the imported and global expect
// (Angular's @angular/build:unit-test builder may use a different expect instance)
expect.extend(matchers);
if (typeof globalThis !== 'undefined' && (globalThis as any).expect && (globalThis as any).expect !== expect) {
   (globalThis as any).expect.extend(matchers);
}

