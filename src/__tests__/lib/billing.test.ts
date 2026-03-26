/**
 * DataSphere Innovation - Billing Tests
 * Tests for Stripe integration and subscription management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    customers: {
      create: vi.fn(() => Promise.resolve({ id: 'cus_test123' })),
      retrieve: vi.fn(() => Promise.resolve({ id: 'cus_test123' })),
    },
    checkout: {
      sessions: {
        create: vi.fn(() => Promise.resolve({
          id: 'cs_test123',
          url: 'https://checkout.stripe.com/test',
        })),
      },
    },
    subscriptions: {
      create: vi.fn(() => Promise.resolve({ id: 'sub_test123', status: 'active' })),
      retrieve: vi.fn(() => Promise.resolve({ id: 'sub_test123', status: 'active' })),
      update: vi.fn(() => Promise.resolve({ id: 'sub_test123', status: 'active' })),
      del: vi.fn(() => Promise.resolve({ id: 'sub_test123', status: 'canceled' })),
    },
    billingPortal: {
      sessions: {
        create: vi.fn(() => Promise.resolve({
          url: 'https://billing.stripe.com/test',
        })),
      },
    },
    webhooks: {
      constructEvent: vi.fn(() => ({
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_test123',
            subscription: 'sub_test123',
            metadata: { userId: 'user-123' },
          },
        },
      })),
    },
    prices: {
      list: vi.fn(() => Promise.resolve({
        data: [
          { id: 'price_1', unit_amount: 49900, recurring: { interval: 'month' } },
        ],
      })),
    },
  })),
}))

// Mock Prisma
vi.mock('@/lib/db', () => ({
  db: {
    subscription: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    invoice: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(() => Promise.resolve({
        id: 'user-123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      })),
      update: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(() => Promise.resolve({
        id: 'org-123',
        name: 'Test Org',
        subscription: null,
      })),
      update: vi.fn(),
    },
  },
}))

// ============================================================================
// Checkout API Tests
// ============================================================================

describe('Checkout API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/billing/checkout', () => {
    it('should create checkout session', async () => {
      const { POST } = await import('../../app/api/billing/checkout/route')
      
      const request = new NextRequest('http://localhost/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_professional_monthly',
          successUrl: 'http://localhost/success',
          cancelUrl: 'http://localhost/cancel',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sessionUrl).toBeDefined()
    })

    it('should validate price ID', async () => {
      const { POST } = await import('../../app/api/billing/checkout/route')
      
      const request = new NextRequest('http://localhost/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'invalid_price',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should support annual billing with discount', async () => {
      const { POST } = await import('../../app/api/billing/checkout/route')
      
      const request = new NextRequest('http://localhost/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_professional_annual',
          billingCycle: 'annual',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })
  })
})

// ============================================================================
// Subscription API Tests
// ============================================================================

describe('Subscription API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/billing/subscription', () => {
    it('should return subscription details', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.subscription.findFirst).mockResolvedValue({
        id: 'sub-123',
        stripeSubscriptionId: 'sub_test123',
        status: 'active',
        plan: 'professional',
        currentPeriodEnd: new Date(Date.now() + 86400000 * 30),
      } as any)

      const { GET } = await import('../../app/api/billing/subscription/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.subscription).toBeDefined()
    })

    it('should return null if no subscription', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.subscription.findFirst).mockResolvedValue(null)

      const { GET } = await import('../../app/api/billing/subscription/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.subscription).toBeNull()
    })
  })

  describe('POST /api/billing/subscription', () => {
    it('should cancel subscription', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.subscription.findFirst).mockResolvedValue({
        id: 'sub-123',
        stripeSubscriptionId: 'sub_test123',
        status: 'active',
      } as any)
      vi.mocked(db.subscription.update).mockResolvedValue({
        id: 'sub-123',
        status: 'canceled',
      } as any)

      const { POST } = await import('../../app/api/billing/subscription/route')
      const request = new NextRequest('http://localhost/api/billing/subscription', {
        method: 'POST',
        body: JSON.stringify({ action: 'cancel' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should upgrade subscription plan', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.subscription.findFirst).mockResolvedValue({
        id: 'sub-123',
        stripeSubscriptionId: 'sub_test123',
        plan: 'starter',
        status: 'active',
      } as any)
      vi.mocked(db.subscription.update).mockResolvedValue({
        id: 'sub-123',
        plan: 'professional',
      } as any)

      const { POST } = await import('../../app/api/billing/subscription/route')
      const request = new NextRequest('http://localhost/api/billing/subscription', {
        method: 'POST',
        body: JSON.stringify({
          action: 'upgrade',
          newPlan: 'professional',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })
  })
})

// ============================================================================
// Webhook API Tests
// ============================================================================

describe('Webhook API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/billing/webhook', () => {
    it('should handle checkout.session.completed', async () => {
      const { POST } = await import('../../app/api/billing/webhook/route')
      
      const request = new NextRequest('http://localhost/api/billing/webhook', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test_signature',
        },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              customer: 'cus_test123',
              subscription: 'sub_test123',
              metadata: { userId: 'user-123' },
            },
          },
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should handle invoice.paid', async () => {
      const { POST } = await import('../../app/api/billing/webhook/route')
      
      const request = new NextRequest('http://localhost/api/billing/webhook', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test_signature',
        },
        body: JSON.stringify({
          type: 'invoice.paid',
          data: {
            object: {
              customer: 'cus_test123',
              subscription: 'sub_test123',
              amount_paid: 49900,
            },
          },
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should handle customer.subscription.deleted', async () => {
      const { POST } = await import('../../app/api/billing/webhook/route')
      
      const request = new NextRequest('http://localhost/api/billing/webhook', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test_signature',
        },
        body: JSON.stringify({
          type: 'customer.subscription.deleted',
          data: {
            object: {
              customer: 'cus_test123',
              id: 'sub_test123',
            },
          },
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should reject invalid signature', async () => {
      // Override mock to throw on invalid signature
      const Stripe = (await import('stripe')).default
      const stripeMock = new Stripe('test_key')
      vi.mocked(stripeMock.webhooks.constructEvent).mockImplementationOnce(() => {
        throw new Error('Invalid signature')
      })

      const { POST } = await import('../../app/api/billing/webhook/route')
      
      const request = new NextRequest('http://localhost/api/billing/webhook', {
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid_signature',
        },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})

// ============================================================================
// Billing Limits API Tests
// ============================================================================

describe('Billing Limits API', () => {
  describe('GET /api/billing/limits', () => {
    it('should return plan limits', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.subscription.findFirst).mockResolvedValue({
        id: 'sub-123',
        plan: 'professional',
        status: 'active',
      } as any)
      vi.mocked(db.subscription.findMany).mockResolvedValue([])

      const { GET } = await import('../../app/api/billing/limits/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.limits).toBeDefined()
      expect(data.usage).toBeDefined()
    })

    it('should return default limits for free tier', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.subscription.findFirst).mockResolvedValue(null)

      const { GET } = await import('../../app/api/billing/limits/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.limits).toBeDefined()
    })

    it('should check feature availability', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.subscription.findFirst).mockResolvedValue({
        id: 'sub-123',
        plan: 'starter',
        status: 'active',
      } as any)

      const { GET } = await import('../../app/api/billing/limits/route')
      const response = await GET()
      const data = await response.json()

      expect(data.limits.maxProjects).toBeDefined()
      expect(data.limits.maxUsers).toBeDefined()
    })
  })
})

// ============================================================================
// Pricing Service Tests
// ============================================================================

describe('Pricing Service', () => {
  describe('calculateProration', () => {
    it('should calculate proration for upgrade', async () => {
      const { BillingService } = await import('@/lib/billing/index')
      const service = new BillingService()

      const proration = service.calculateProration({
        currentPlan: 'starter',
        newPlan: 'professional',
        daysRemaining: 15,
        billingCycleDays: 30,
      })

      expect(proration).toBeDefined()
      expect(proration.credit).toBeGreaterThan(0)
      expect(proration.charge).toBeGreaterThan(0)
    })
  })

  describe('getPlanFeatures', () => {
    it('should return features for each plan', async () => {
      const { BillingService } = await import('@/lib/billing/index')
      const service = new BillingService()

      const features = service.getPlanFeatures('professional')

      expect(features).toBeDefined()
      expect(features.maxProjects).toBeGreaterThan(0)
      expect(features.maxUsers).toBeGreaterThan(0)
      expect(features.features).toBeDefined()
    })
  })

  describe('validatePlanChange', () => {
    it('should allow upgrade from starter to professional', async () => {
      const { BillingService } = await import('@/lib/billing/index')
      const service = new BillingService()

      const validation = service.validatePlanChange({
        currentPlan: 'starter',
        newPlan: 'professional',
      })

      expect(validation.valid).toBe(true)
    })

    it('should warn about downgrade impacts', async () => {
      const { BillingService } = await import('@/lib/billing/index')
      const service = new BillingService()

      const validation = service.validatePlanChange({
        currentPlan: 'enterprise',
        newPlan: 'starter',
      })

      expect(validation.warnings).toBeDefined()
    })
  })
})
