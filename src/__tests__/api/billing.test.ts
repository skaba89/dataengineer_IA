/**
 * DataSphere Innovation - Billing API Tests
 * Comprehensive tests for Stripe billing endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// ============================================================================
// Mock Setup
// ============================================================================

const mockAuth = vi.fn()
const mockDb = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  organization: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
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
  notification: {
    create: vi.fn(),
  },
  project: {
    count: vi.fn(),
  },
  dataSource: {
    count: vi.fn(),
  },
  agentExecution: {
    count: vi.fn(),
  },
  deliverable: {
    count: vi.fn(),
  },
}

// Mock modules
vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}))

vi.mock('@/lib/db', () => ({
  db: mockDb,
}))

vi.mock('@/lib/billing', () => ({
  BillingService: {
    createSubscription: vi.fn().mockResolvedValue({
      subscription: { id: 'sub-123', plan: 'starter' },
      checkoutUrl: 'https://checkout.stripe.com/test',
    }),
    getSubscription: vi.fn().mockResolvedValue({
      id: 'sub-123',
      plan: 'professional',
      status: 'active',
    }),
    getUsageMetrics: vi.fn().mockResolvedValue({
      projects: 2,
      dataSources: 5,
      executions: 100,
    }),
    changePlan: vi.fn().mockResolvedValue({
      id: 'sub-123',
      plan: 'enterprise',
    }),
    cancelSubscription: vi.fn().mockResolvedValue({
      id: 'sub-123',
      status: 'canceled',
    }),
    reactivateSubscription: vi.fn().mockResolvedValue({
      id: 'sub-123',
      status: 'active',
    }),
    handleWebhookEvent: vi.fn(),
    checkLimit: vi.fn().mockResolvedValue({
      allowed: true,
      current: 2,
      limit: 5,
      remaining: 3,
    }),
  },
  SUBSCRIPTION_PLANS: {
    starter: {
      name: 'Starter',
      price: 499,
      priceYearly: 4784,
      limits: { projects: 1, dataSources: 3, features: ['basic'] },
      features: ['Basic features'],
    },
    professional: {
      name: 'Professional',
      price: 1499,
      priceYearly: 14390,
      limits: { projects: 5, dataSources: 10, features: ['all_connectors'] },
      features: ['All features'],
      recommended: true,
    },
    enterprise: {
      name: 'Enterprise',
      price: 4999,
      priceYearly: 47990,
      limits: { projects: -1, dataSources: -1, features: ['all'] },
      features: ['All features', 'SSO', 'SLA'],
    },
    agency: {
      name: 'Agency',
      price: 2999,
      priceYearly: 28790,
      limits: { projects: -1, dataSources: -1, features: ['all'] },
      features: ['Multi-client', 'White-label'],
    },
  },
  STRIPE_PRODUCTS: {
    starter: {
      productId: 'prod_starter',
      priceIds: { monthly: 'price_starter_monthly', yearly: 'price_starter_yearly' },
    },
    professional: {
      productId: 'prod_professional',
      priceIds: { monthly: 'price_professional_monthly', yearly: 'price_professional_yearly' },
    },
    enterprise: {
      productId: 'prod_enterprise',
      priceIds: { monthly: 'price_enterprise_monthly', yearly: 'price_enterprise_yearly' },
    },
    agency: {
      productId: 'prod_agency',
      priceIds: { monthly: 'price_agency_monthly', yearly: 'price_agency_yearly' },
    },
  },
  formatPrice: vi.fn((amount, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }),
  calculateSavings: vi.fn((monthlyPrice, yearlyPrice) => {
    const monthlyYearly = monthlyPrice * 12
    return Math.round(((monthlyYearly - yearlyPrice) / monthlyYearly) * 100)
  }),
  hasFeature: vi.fn((subscription, feature) => {
    if (!subscription) return false
    if (subscription.limits?.features?.includes('all')) return true
    return subscription.limits?.features?.includes(feature) || false
  }),
  SubscriptionPlan: {} as any,
}))

// ============================================================================
// Checkout API Tests
// ============================================================================

describe('POST /api/billing/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null)

      const { POST } = await import('@/app/api/billing/checkout/route')
      const request = new NextRequest('http://localhost/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: 'professional', billingPeriod: 'monthly' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Non autorisé')
    })

    it('should return 401 when session has no user ID', async () => {
      mockAuth.mockResolvedValueOnce({ user: {} })

      const { POST } = await import('@/app/api/billing/checkout/route')
      const request = new NextRequest('http://localhost/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: 'professional', billingPeriod: 'monthly' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })
  })

  describe('Input Validation', () => {
    it('should return 400 for invalid plan', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      })

      const { POST } = await import('@/app/api/billing/checkout/route')
      const request = new NextRequest('http://localhost/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: 'invalid-plan', billingPeriod: 'monthly' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Plan invalide')
    })
  })

  describe('User Management', () => {
    it('should return 404 when user not found', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'nonexistent' } })
      mockDb.user.findUnique.mockResolvedValueOnce(null)

      const { POST } = await import('@/app/api/billing/checkout/route')
      const request = new NextRequest('http://localhost/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: 'starter', billingPeriod: 'monthly' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Utilisateur non trouvé')
    })
  })

  describe('Organization Creation', () => {
    it('should create organization when user has none', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        organization: null,
      })
      mockDb.organization.create.mockResolvedValueOnce({
        id: 'org-123',
        name: "Test User's Organization",
        slug: 'org-user-123',
        plan: 'starter',
      })
      
      const { BillingService } = await import('@/lib/billing')
      vi.mocked(BillingService.createSubscription).mockResolvedValueOnce({
        subscription: { id: 'sub-123', plan: 'starter' } as any,
        checkoutUrl: 'https://checkout.stripe.com/test',
      })

      const { POST } = await import('@/app/api/billing/checkout/route')
      const request = new NextRequest('http://localhost/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: 'starter', billingPeriod: 'monthly' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockDb.organization.create).toHaveBeenCalled()
    })
  })

  describe('Subscription Creation', () => {
    it('should create subscription successfully', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        organization: {
          id: 'org-123',
          name: 'Test Org',
        },
      })
      
      const { BillingService } = await import('@/lib/billing')
      vi.mocked(BillingService.createSubscription).mockResolvedValueOnce({
        subscription: { id: 'sub-123', plan: 'professional' } as any,
        checkoutUrl: 'https://checkout.stripe.com/test',
      })

      const { POST } = await import('@/app/api/billing/checkout/route')
      const request = new NextRequest('http://localhost/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: 'professional', billingPeriod: 'yearly' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.checkoutUrl).toBe('https://checkout.stripe.com/test')
    })
  })

  describe('Error Handling', () => {
    it('should handle internal errors', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockRejectedValueOnce(new Error('Database error'))

      const { POST } = await import('@/app/api/billing/checkout/route')
      const request = new NextRequest('http://localhost/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: 'starter', billingPeriod: 'monthly' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })
})

// ============================================================================
// Subscription API Tests
// ============================================================================

describe('GET /api/billing/subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null)

      const { GET } = await import('@/app/api/billing/subscription/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('Subscription Retrieval', () => {
    it('should return null subscription when user has no organization', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        organizationId: null,
      })

      const { GET } = await import('@/app/api/billing/subscription/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscription).toBeNull()
    })

    it('should return subscription and usage data', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        organizationId: 'org-123',
        organization: { id: 'org-123', name: 'Test Org' },
      })
      
      const { BillingService } = await import('@/lib/billing')
      vi.mocked(BillingService.getSubscription).mockResolvedValueOnce({
        id: 'sub-123',
        plan: 'professional',
        status: 'active',
      } as any)
      vi.mocked(BillingService.getUsageMetrics).mockResolvedValueOnce({
        projects: 2,
        dataSources: 5,
        executions: 100,
      } as any)
      mockDb.invoice.findMany.mockResolvedValueOnce([])

      const { GET } = await import('@/app/api/billing/subscription/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscription).toBeDefined()
      expect(data.usage).toBeDefined()
    })
  })

  describe('Invoice Retrieval', () => {
    it('should return invoices for subscription', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        organizationId: 'org-123',
        organization: { id: 'org-123' },
      })
      
      const { BillingService } = await import('@/lib/billing')
      vi.mocked(BillingService.getSubscription).mockResolvedValueOnce({
        id: 'sub-123',
      } as any)
      vi.mocked(BillingService.getUsageMetrics).mockResolvedValueOnce({} as any)
      mockDb.invoice.findMany.mockResolvedValueOnce([
        { id: 'inv-1', amount: 1499, status: 'paid' },
        { id: 'inv-2', amount: 1499, status: 'paid' },
      ])

      const { GET } = await import('@/app/api/billing/subscription/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.invoices).toHaveLength(2)
    })
  })
})

describe('PATCH /api/billing/subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Plan Change', () => {
    it('should change plan successfully', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        organizationId: 'org-123',
      })
      
      const { BillingService } = await import('@/lib/billing')
      vi.mocked(BillingService.changePlan).mockResolvedValueOnce({
        id: 'sub-123',
        plan: 'enterprise',
      } as any)

      const { PATCH } = await import('@/app/api/billing/subscription/route')
      const request = new NextRequest('http://localhost/api/billing/subscription', {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'change_plan',
          newPlan: 'enterprise',
          billingPeriod: 'monthly',
        }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(BillingService.changePlan).toHaveBeenCalledWith({
        organizationId: 'org-123',
        newPlan: 'enterprise',
        billingPeriod: 'monthly',
      })
    })
  })

  describe('Subscription Cancellation', () => {
    it('should cancel subscription successfully', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        organizationId: 'org-123',
      })
      
      const { BillingService } = await import('@/lib/billing')
      vi.mocked(BillingService.cancelSubscription).mockResolvedValueOnce({
        id: 'sub-123',
        status: 'canceled',
      } as any)

      const { PATCH } = await import('@/app/api/billing/subscription/route')
      const request = new NextRequest('http://localhost/api/billing/subscription', {
        method: 'PATCH',
        body: JSON.stringify({ action: 'cancel' }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(BillingService.cancelSubscription).toHaveBeenCalledWith({
        organizationId: 'org-123',
        immediately: false,
      })
    })
  })

  describe('Subscription Reactivation', () => {
    it('should reactivate subscription successfully', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        organizationId: 'org-123',
      })
      
      const { BillingService } = await import('@/lib/billing')
      vi.mocked(BillingService.reactivateSubscription).mockResolvedValueOnce({
        id: 'sub-123',
        status: 'active',
      } as any)

      const { PATCH } = await import('@/app/api/billing/subscription/route')
      const request = new NextRequest('http://localhost/api/billing/subscription', {
        method: 'PATCH',
        body: JSON.stringify({ action: 'reactivate' }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(BillingService.reactivateSubscription).toHaveBeenCalledWith('org-123')
    })
  })

  describe('Error Handling', () => {
    it('should return 400 for invalid action', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        organizationId: 'org-123',
      })

      const { PATCH } = await import('@/app/api/billing/subscription/route')
      const request = new NextRequest('http://localhost/api/billing/subscription', {
        method: 'PATCH',
        body: JSON.stringify({ action: 'invalid_action' }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Action invalide')
    })

    it('should return 404 when user has no organization', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-123' } })
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        organizationId: null,
      })

      const { PATCH } = await import('@/app/api/billing/subscription/route')
      const request = new NextRequest('http://localhost/api/billing/subscription', {
        method: 'PATCH',
        body: JSON.stringify({ action: 'change_plan', newPlan: 'enterprise' }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })
})

// ============================================================================
// Webhook API Tests
// ============================================================================

describe('POST /api/billing/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Configuration Check', () => {
    it('should return 500 when Stripe is not configured', async () => {
      // Mock Stripe as not configured
      vi.doMock('stripe', () => ({
        default: vi.fn(() => null),
      }))

      const { POST } = await import('@/app/api/billing/webhook/route')
      const request = new NextRequest('http://localhost/api/billing/webhook', {
        method: 'POST',
        body: '{}',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Stripe not configured')
    })
  })

  describe('Signature Validation', () => {
    it('should return 400 when signature is missing', async () => {
      // Set environment variables for Stripe
      process.env.STRIPE_SECRET_KEY = 'sk_test_fake'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

      const { POST } = await import('@/app/api/billing/webhook/route')
      const request = new NextRequest('http://localhost/api/billing/webhook', {
        method: 'POST',
        body: '{}',
        headers: {},
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing signature')
    })
  })
})

// ============================================================================
// Billing Service Unit Tests
// ============================================================================

describe('BillingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Subscription Plans', () => {
    it('should have correct plan configurations', async () => {
      const { SUBSCRIPTION_PLANS } = await import('@/lib/billing')

      expect(SUBSCRIPTION_PLANS.starter).toBeDefined()
      expect(SUBSCRIPTION_PLANS.professional).toBeDefined()
      expect(SUBSCRIPTION_PLANS.enterprise).toBeDefined()
      expect(SUBSCRIPTION_PLANS.agency).toBeDefined()
    })

    it('should have correct pricing', async () => {
      const { SUBSCRIPTION_PLANS } = await import('@/lib/billing')

      expect(SUBSCRIPTION_PLANS.starter.price).toBe(499)
      expect(SUBSCRIPTION_PLANS.professional.price).toBe(1499)
      expect(SUBSCRIPTION_PLANS.enterprise.price).toBe(4999)
      expect(SUBSCRIPTION_PLANS.agency.price).toBe(2999)
    })

    it('should have yearly discount', async () => {
      const { SUBSCRIPTION_PLANS } = await import('@/lib/billing')

      const starterMonthlyYearly = SUBSCRIPTION_PLANS.starter.price * 12
      expect(SUBSCRIPTION_PLANS.starter.priceYearly).toBeLessThan(starterMonthlyYearly)
    })

    it('should mark professional as recommended', async () => {
      const { SUBSCRIPTION_PLANS } = await import('@/lib/billing')

      expect(SUBSCRIPTION_PLANS.professional.recommended).toBe(true)
    })

    it('should have correct limits for each plan', async () => {
      const { SUBSCRIPTION_PLANS } = await import('@/lib/billing')

      expect(SUBSCRIPTION_PLANS.starter.limits.projects).toBe(1)
      expect(SUBSCRIPTION_PLANS.professional.limits.projects).toBe(5)
      expect(SUBSCRIPTION_PLANS.enterprise.limits.projects).toBe(-1) // Unlimited
    })
  })

  describe('createSubscription', () => {
    it('should create subscription in database', async () => {
      const { BillingService } = await import('@/lib/billing')
      
      mockDb.subscription.create.mockResolvedValueOnce({
        id: 'sub-123',
        organizationId: 'org-123',
        plan: 'professional',
        status: 'active',
      })

      const result = await BillingService.createSubscription({
        organizationId: 'org-123',
        plan: 'professional',
        billingPeriod: 'monthly',
        email: 'test@example.com',
        name: 'Test User',
      })

      expect(result.subscription).toBeDefined()
      expect(mockDb.subscription.create).toHaveBeenCalled()
    })
  })

  describe('getSubscription', () => {
    it('should return subscription for organization', async () => {
      const { BillingService } = await import('@/lib/billing')
      
      mockDb.subscription.findFirst.mockResolvedValueOnce({
        id: 'sub-123',
        organizationId: 'org-123',
        plan: 'professional',
      })

      const result = await BillingService.getSubscription('org-123')

      expect(result).toBeDefined()
      expect(mockDb.subscription.findFirst).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should return null when no subscription found', async () => {
      const { BillingService } = await import('@/lib/billing')
      
      mockDb.subscription.findFirst.mockResolvedValueOnce(null)

      const result = await BillingService.getSubscription('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getUsageMetrics', () => {
    it('should return usage metrics', async () => {
      const { BillingService } = await import('@/lib/billing')
      
      mockDb.project.count.mockResolvedValueOnce(5)
      mockDb.dataSource.count.mockResolvedValueOnce(10)
      mockDb.agentExecution.count.mockResolvedValueOnce(100)
      mockDb.deliverable.count.mockResolvedValueOnce(20)
      mockDb.user.count.mockResolvedValueOnce(3)

      const result = await BillingService.getUsageMetrics('org-123')

      expect(result.projects).toBe(5)
      expect(result.dataSources).toBe(10)
      expect(result.executions).toBe(100)
      expect(result.exports).toBe(20)
      expect(result.teamMembers).toBe(3)
    })
  })

  describe('checkLimit', () => {
    it('should allow when under limit', async () => {
      const { BillingService } = await import('@/lib/billing')
      
      mockDb.subscription.findFirst.mockResolvedValueOnce({
        id: 'sub-123',
        limits: { projects: 5 },
      })
      mockDb.project.count.mockResolvedValueOnce(3)

      const result = await BillingService.checkLimit('org-123', 'projects')

      expect(result.allowed).toBe(true)
      expect(result.current).toBe(3)
      expect(result.limit).toBe(5)
      expect(result.remaining).toBe(2)
    })

    it('should deny when at limit', async () => {
      const { BillingService } = await import('@/lib/billing')
      
      mockDb.subscription.findFirst.mockResolvedValueOnce({
        id: 'sub-123',
        limits: { projects: 5 },
      })
      mockDb.project.count.mockResolvedValueOnce(5)

      const result = await BillingService.checkLimit('org-123', 'projects')

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should always allow for unlimited (-1)', async () => {
      const { BillingService } = await import('@/lib/billing')
      
      mockDb.subscription.findFirst.mockResolvedValueOnce({
        id: 'sub-123',
        limits: { projects: -1 },
      })
      mockDb.project.count.mockResolvedValueOnce(100)

      const result = await BillingService.checkLimit('org-123', 'projects')

      expect(result.allowed).toBe(true)
      expect(result.limit).toBe(-1)
    })
  })
})

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('Billing Helper Functions', () => {
  describe('formatPrice', () => {
    it('should format price correctly', async () => {
      const { formatPrice } = await import('@/lib/billing')

      expect(formatPrice(499, 'EUR')).toBe('499 €')
      expect(formatPrice(1499, 'EUR')).toBe('1 499 €')
    })
  })

  describe('calculateSavings', () => {
    it('should calculate yearly savings percentage', async () => {
      const { calculateSavings } = await import('@/lib/billing')

      // Monthly: 499 * 12 = 5988, Yearly: 4784
      const savings = calculateSavings(499, 4784)
      expect(savings).toBe(20) // 20% savings
    })
  })

  describe('hasFeature', () => {
    it('should return true when feature is included', async () => {
      const { hasFeature, SUBSCRIPTION_PLANS } = await import('@/lib/billing')

      const subscription = {
        plan: 'professional',
        limits: SUBSCRIPTION_PLANS.professional.limits,
      } as any

      expect(hasFeature(subscription, 'all_connectors')).toBe(true)
    })

    it('should return false when subscription is null', async () => {
      const { hasFeature } = await import('@/lib/billing')

      expect(hasFeature(null, 'any_feature')).toBe(false)
    })

    it('should return true for "all" features', async () => {
      const { hasFeature } = await import('@/lib/billing')

      const subscription = {
        plan: 'enterprise',
        limits: { features: ['all'] },
      } as any

      expect(hasFeature(subscription, 'any_feature')).toBe(true)
    })
  })
})

// ============================================================================
// Stripe Integration Tests
// ============================================================================

describe('Stripe Products Configuration', () => {
  it('should have product IDs for all plans', async () => {
    const { STRIPE_PRODUCTS } = await import('@/lib/billing')

    expect(STRIPE_PRODUCTS.starter.productId).toBeDefined()
    expect(STRIPE_PRODUCTS.professional.productId).toBeDefined()
    expect(STRIPE_PRODUCTS.enterprise.productId).toBeDefined()
    expect(STRIPE_PRODUCTS.agency.productId).toBeDefined()
  })

  it('should have price IDs for monthly and yearly billing', async () => {
    const { STRIPE_PRODUCTS } = await import('@/lib/billing')

    Object.values(STRIPE_PRODUCTS).forEach(product => {
      expect(product.priceIds.monthly).toBeDefined()
      expect(product.priceIds.yearly).toBeDefined()
    })
  })
})
