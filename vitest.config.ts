import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [], // Disable all PostCSS plugins for tests
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      exclude: [
        'node_modules/',
        '.next/',
        'src/components/ui/', // shadcn/ui components - tested by library
        '**/*.d.ts',
        '**/*.config.*',
        'prisma/',
        'scripts/',
        'src/__tests__/',
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
      watermarks: {
        statements: [70, 90],
        branches: [60, 80],
        functions: [70, 90],
        lines: [70, 90],
      },
    },
    setupFiles: ['./src/__tests__/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 15000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    reporters: ['verbose', 'html'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.AUTH_SECRET': JSON.stringify('test-secret-key-for-testing'),
    'process.env.DATABASE_URL': JSON.stringify('file:./test.db'),
    'process.env.NODE_ENV': JSON.stringify('test'),
    'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify('http://localhost:3000'),
    'process.env.STRIPE_SECRET_KEY': JSON.stringify('sk_test_fake'),
    'process.env.STRIPE_WEBHOOK_SECRET': JSON.stringify('whsec_test'),
  },
})
