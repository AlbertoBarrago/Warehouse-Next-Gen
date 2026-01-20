/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.spec.ts', 'tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/index.ts',
      ],
    },
    reporters: ['default'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@core': '/src/app/core',
      '@shared': '/src/app/shared',
      '@features': '/src/app/features',
      '@env': '/src/environments',
    },
  },
});
