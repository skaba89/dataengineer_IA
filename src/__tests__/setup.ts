/**
 * Test Setup File
 * Configures test environment with mocks and utilities
 */

import { beforeAll, afterAll, afterEach, vi } from 'vitest'

// Mock environment variables
process.env.AUTH_SECRET = 'test-secret-key-for-testing'
process.env.DATABASE_URL = 'file:./test.db'
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
  cookies: vi.fn(() => Promise.resolve({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

// Mock NextAuth
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: vi.fn(),
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

// Mock Prisma client for unit tests
vi.mock('@/lib/db', () => ({
  db: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    organization: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    subscription: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    securityEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    secret: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    ipRule: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

// Mock console methods in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Setup before all tests
beforeAll(async () => {
  // Any global setup
})

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Cleanup after all tests
afterAll(async () => {
  // Any global cleanup
  vi.restoreAllMocks()
})

// Custom matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const pass = uuidRegex.test(received)
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be a valid UUID`
        : `expected ${received} to be a valid UUID`,
    }
  },
  toBeValidApiKey(received: string) {
    const pass = /^dsi_[a-z0-9_]+$/.test(received)
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be a valid API key`
        : `expected ${received} to be a valid API key (format: dsi_xxx)`,
    }
  },
})

declare global {
  namespace Vi {
    interface Assertion {
      toBeValidUUID(): void
      toBeValidApiKey(): void
    }
  }
}
