import { defineConfig } from 'vitest/config';

export default defineConfig({
   test: {
      setupFiles: ['src/test-setup.ts'],
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
   },
});
