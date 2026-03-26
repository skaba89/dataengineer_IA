/**
 * DataSphere Innovation - Test Suite
 * Unit tests for critical modules: Security, Billing, Lineage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// ============================================================================
// Security Module Tests
// ============================================================================

describe('EncryptionService', () => {
  let EncryptionService: typeof import('@/lib/security').EncryptionService

  beforeEach(async () => {
    vi.resetModules()
    const security = await import('@/lib/security')
    EncryptionService = security.EncryptionService
    EncryptionService.initialize()
  })

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const plaintext = 'This is a secret message'
      const encrypted = EncryptionService.encrypt(plaintext)
      
      expect(encrypted.encrypted).toBeDefined()
      expect(encrypted.iv).toBeDefined()
      expect(encrypted.authTag).toBeDefined()
      expect(encrypted.encrypted).not.toBe(plaintext)
      
      const decrypted = EncryptionService.decrypt(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.authTag
      )
      
      expect(decrypted).toBe(plaintext)
    })

    it('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'Same message'
      const encrypted1 = EncryptionService.encrypt(plaintext)
      const encrypted2 = EncryptionService.encrypt(plaintext)
      
      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
    })

    it('should fail decryption with wrong auth tag', () => {
      const plaintext = 'Test message'
      const encrypted = EncryptionService.encrypt(plaintext)
      
      expect(() => {
        EncryptionService.decrypt(
          encrypted.encrypted,
          encrypted.iv,
          'wrong_auth_tag'
        )
      }).toThrow()
    })
  })

  describe('hash/verifyHash', () => {
    it('should hash and verify passwords correctly', () => {
      const password = 'securePassword123!'
      const hashed = EncryptionService.hash(password)
      
      expect(hashed).toBeDefined()
      expect(hashed).toContain(':')
      expect(hashed.split(':')[1].length).toBe(128) // SHA-512 hex length
      
      expect(EncryptionService.verifyHash(password, hashed)).toBe(true)
      expect(EncryptionService.verifyHash('wrongPassword', hashed)).toBe(false)
    })

    it('should produce different hashes for same password', () => {
      const password = 'samePassword'
      const hash1 = EncryptionService.hash(password)
      const hash2 = EncryptionService.hash(password)
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('generateApiKey', () => {
    it('should generate unique API keys', () => {
      const key1 = EncryptionService.generateApiKey()
      const key2 = EncryptionService.generateApiKey()
      
      expect(key1).toMatch(/^dsi_[a-z0-9_]+$/)
      expect(key1).not.toBe(key2)
    })

    it('should generate keys with custom prefix', () => {
      const key = EncryptionService.generateApiKey('custom')
      
      expect(key).toMatch(/^custom_[a-z0-9_]+$/)
    })
  })

  describe('generateSecureToken', () => {
    it('should generate secure random tokens', () => {
      const token = EncryptionService.generateSecureToken()
      
      expect(token).toBeDefined()
      expect(token.length).toBe(64) // 32 bytes = 64 hex chars
      
      const token2 = EncryptionService.generateSecureToken()
      expect(token).not.toBe(token2)
    })

    it('should generate tokens of custom length', () => {
      const token = EncryptionService.generateSecureToken(16)
      expect(token.length).toBe(32) // 16 bytes = 32 hex chars
    })
  })
})

// ============================================================================
// Billing Module Tests
// ============================================================================

describe('BillingService', () => {
  let BillingService: typeof import('@/lib/billing').BillingService
  let SUBSCRIPTION_PLANS: typeof import('@/lib/billing').SUBSCRIPTION_PLANS

  beforeEach(async () => {
    vi.resetModules()
    const billing = await import('@/lib/billing')
    BillingService = billing.BillingService
    SUBSCRIPTION_PLANS = billing.SUBSCRIPTION_PLANS
  })

  describe('SUBSCRIPTION_PLANS', () => {
    it('should have 4 plan tiers defined', () => {
      const plans = Object.keys(SUBSCRIPTION_PLANS)
      expect(plans).toContain('starter')
      expect(plans).toContain('professional')
      expect(plans).toContain('enterprise')
      expect(plans).toContain('agency')
    })

    it('should have correct starter plan pricing', () => {
      expect(SUBSCRIPTION_PLANS.starter.price).toBe(499)
      expect(SUBSCRIPTION_PLANS.starter.limits.projects).toBe(1)
      expect(SUBSCRIPTION_PLANS.starter.limits.dataSources).toBe(3)
    })

    it('should have correct enterprise plan features', () => {
      expect(SUBSCRIPTION_PLANS.enterprise.price).toBe(4999)
      expect(SUBSCRIPTION_PLANS.enterprise.limits.projects).toBe(-1) // unlimited
      expect(SUBSCRIPTION_PLANS.enterprise.limits.sso).toBe(true)
      expect(SUBSCRIPTION_PLANS.enterprise.limits.sla).toBe('99.9%')
    })

    it('should have yearly discount of 20%', () => {
      Object.values(SUBSCRIPTION_PLANS).forEach(plan => {
        const expectedYearly = Math.round(plan.price * 12 * 0.8)
        expect(plan.priceYearly).toBe(expectedYearly)
      })
    })
  })

  describe('formatPrice', () => {
    it('should format prices correctly', async () => {
      const { formatPrice } = await import('@/lib/billing')
      
      expect(formatPrice(499)).toBe('499 €')
      expect(formatPrice(1499)).toBe('1 499 €')
      expect(formatPrice(4999)).toBe('4 999 €')
    })
  })

  describe('calculateSavings', () => {
    it('should calculate yearly savings percentage', async () => {
      const { calculateSavings } = await import('@/lib/billing')
      
      const savings = calculateSavings(499, 4784)
      expect(savings).toBe(20) // 20% savings
    })
  })

  describe('hasFeature', () => {
    it('should return false for null subscription', async () => {
      const { hasFeature } = await import('@/lib/billing')
      
      expect(hasFeature(null, 'sso')).toBe(false)
    })

    it('should return true for enterprise features', async () => {
      const { hasFeature, SUBSCRIPTION_PLANS } = await import('@/lib/billing')
      
      const enterpriseSub = {
        plan: 'enterprise' as const,
        status: 'active' as const,
        limits: SUBSCRIPTION_PLANS.enterprise.limits,
      }
      
      expect(hasFeature(enterpriseSub, 'sso')).toBe(true)
    })
  })
})

// ============================================================================
// Lineage Module Tests
// ============================================================================

describe('DataLineageEngine', () => {
  let DataLineageEngine: typeof import('@/lib/lineage').DataLineageEngine
  let engine: InstanceType<typeof DataLineageEngine>

  beforeEach(async () => {
    vi.resetModules()
    const lineage = await import('@/lib/lineage')
    DataLineageEngine = lineage.DataLineageEngine
    engine = new DataLineageEngine()
  })

  describe('Node Management', () => {
    it('should add nodes correctly', () => {
      engine.addNode({
        id: 'test_node',
        name: 'Test Node',
        type: 'source',
        layer: 'raw',
        metadata: {},
      })
      
      const node = engine.getNode('test_node')
      expect(node).toBeDefined()
      expect(node?.name).toBe('Test Node')
    })

    it('should update nodes correctly', () => {
      engine.addNode({
        id: 'test_node',
        name: 'Original Name',
        type: 'source',
        layer: 'raw',
        metadata: {},
      })
      
      engine.updateNode('test_node', { name: 'Updated Name' })
      
      const node = engine.getNode('test_node')
      expect(node?.name).toBe('Updated Name')
    })

    it('should remove nodes and connected edges', () => {
      engine.addNode({
        id: 'node1',
        name: 'Node 1',
        type: 'source',
        layer: 'raw',
        metadata: {},
      })
      
      engine.addNode({
        id: 'node2',
        name: 'Node 2',
        type: 'staging',
        layer: 'staging',
        metadata: {},
      })
      
      engine.addEdge({
        id: 'edge1',
        sourceId: 'node1',
        targetId: 'node2',
        type: 'direct',
        metadata: {},
      })
      
      expect(engine.getNode('node1')).toBeDefined()
      expect(engine.getNode('node2')).toBeDefined()
      
      engine.removeNode('node1')
      
      expect(engine.getNode('node1')).toBeUndefined()
    })
  })

  describe('Edge Management', () => {
    beforeEach(() => {
      engine.addNode({
        id: 'source',
        name: 'Source',
        type: 'source',
        layer: 'raw',
        metadata: {},
      })
      
      engine.addNode({
        id: 'target',
        name: 'Target',
        type: 'staging',
        layer: 'staging',
        metadata: {},
      })
    })

    it('should add edges correctly', () => {
      engine.addEdge({
        id: 'test_edge',
        sourceId: 'source',
        targetId: 'target',
        type: 'direct',
        metadata: {},
      })
      
      const upstream = engine.getUpstreamLineage('target')
      expect(upstream.length).toBe(1)
      expect(upstream[0].id).toBe('source')
    })

    it('should remove edges correctly', () => {
      engine.addEdge({
        id: 'test_edge',
        sourceId: 'source',
        targetId: 'target',
        type: 'direct',
        metadata: {},
      })
      
      engine.removeEdge('test_edge')
      
      const upstream = engine.getUpstreamLineage('target')
      expect(upstream.length).toBe(0)
    })
  })

  describe('Lineage Queries', () => {
    beforeEach(() => {
      // Create a simple lineage graph
      engine.addNode({ id: 'raw.users', name: 'users', type: 'source', layer: 'raw', metadata: {} })
      engine.addNode({ id: 'raw.orders', name: 'orders', type: 'source', layer: 'raw', metadata: {} })
      engine.addNode({ id: 'stg.users', name: 'stg_users', type: 'staging', layer: 'staging', metadata: {} })
      engine.addNode({ id: 'stg.orders', name: 'stg_orders', type: 'staging', layer: 'staging', metadata: {} })
      engine.addNode({ id: 'int.user_orders', name: 'int_user_orders', type: 'intermediate', layer: 'intermediate', metadata: {} })
      engine.addNode({ id: 'mart.customer_360', name: 'dim_customer_360', type: 'mart', layer: 'marts', metadata: {} })
      
      engine.addEdge({ id: 'e1', sourceId: 'raw.users', targetId: 'stg.users', type: 'direct', metadata: {} })
      engine.addEdge({ id: 'e2', sourceId: 'raw.orders', targetId: 'stg.orders', type: 'direct', metadata: {} })
      engine.addEdge({ id: 'e3', sourceId: 'stg.users', targetId: 'int.user_orders', type: 'join', metadata: {} })
      engine.addEdge({ id: 'e4', sourceId: 'stg.orders', targetId: 'int.user_orders', type: 'join', metadata: {} })
      engine.addEdge({ id: 'e5', sourceId: 'int.user_orders', targetId: 'mart.customer_360', type: 'transformation', metadata: {} })
    })

    it('should return correct upstream lineage', () => {
      const upstream = engine.getUpstreamLineage('mart.customer_360')
      
      expect(upstream.length).toBe(4)
      const ids = upstream.map(n => n.id)
      expect(ids).toContain('int.user_orders')
      expect(ids).toContain('stg.users')
      expect(ids).toContain('stg.orders')
    })

    it('should return correct downstream lineage', () => {
      const downstream = engine.getDownstreamLineage('raw.users')
      
      expect(downstream.length).toBe(3)
      const ids = downstream.map(n => n.id)
      expect(ids).toContain('stg.users')
      expect(ids).toContain('int.user_orders')
      expect(ids).toContain('mart.customer_360')
    })

    it('should respect max depth parameter', () => {
      const downstream = engine.getDownstreamLineage('raw.users', 1)
      
      expect(downstream.length).toBe(1)
      expect(downstream[0].id).toBe('stg.users')
    })
  })

  describe('Impact Analysis', () => {
    beforeEach(() => {
      engine.addNode({ id: 'source', name: 'Source', type: 'source', layer: 'raw', metadata: {} })
      engine.addNode({ id: 'staging', name: 'Staging', type: 'staging', layer: 'staging', metadata: {} })
      engine.addNode({ id: 'mart', name: 'Mart', type: 'mart', layer: 'marts', metadata: {} })
      engine.addNode({ id: 'dashboard', name: 'Dashboard', type: 'dashboard', layer: 'reporting', metadata: {} })
      
      engine.addEdge({ id: 'e1', sourceId: 'source', targetId: 'staging', type: 'direct', metadata: {} })
      engine.addEdge({ id: 'e2', sourceId: 'staging', targetId: 'mart', type: 'transformation', metadata: {} })
      engine.addEdge({ id: 'e3', sourceId: 'mart', targetId: 'dashboard', type: 'direct', metadata: {} })
    })

    it('should analyze impact correctly', () => {
      const impact = engine.analyzeImpact('source')
      
      expect(impact.nodeId).toBe('source')
      expect(impact.affectedNodes.length).toBe(2) // staging and mart
      expect(impact.affectedDashboards.length).toBe(1)
      expect(impact.totalImpact).toBe(3)
    })

    it('should calculate risk level', () => {
      const impact = engine.analyzeImpact('source')
      
      expect(['low', 'medium', 'high', 'critical']).toContain(impact.riskLevel)
    })

    it('should provide recommendations', () => {
      const impact = engine.analyzeImpact('source')
      
      expect(impact.recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('Statistics', () => {
    beforeEach(() => {
      engine.addNode({ id: 'node1', name: 'Node 1', type: 'source', layer: 'raw', metadata: {} })
      engine.addNode({ id: 'node2', name: 'Node 2', type: 'staging', layer: 'staging', metadata: {} })
      engine.addEdge({ id: 'e1', sourceId: 'node1', targetId: 'node2', type: 'direct', metadata: {} })
    })

    it('should return correct statistics', () => {
      const stats = engine.getStatistics()
      
      expect(stats.totalNodes).toBe(2)
      expect(stats.totalEdges).toBe(1)
      expect(stats.nodesByType['source']).toBe(1)
      expect(stats.nodesByType['staging']).toBe(1)
    })
  })
})

// ============================================================================
// Error Handler Tests
// ============================================================================

describe('ErrorHandler', () => {
  let ErrorHandler: typeof import('@/lib/error-handler').ErrorHandler
  let AppError: typeof import('@/lib/error-handler').AppError
  let ErrorSeverity: typeof import('@/lib/error-handler').ErrorSeverity
  let ErrorCategory: typeof import('@/lib/error-handler').ErrorCategory

  beforeEach(async () => {
    vi.resetModules()
    const errorHandler = await import('@/lib/error-handler')
    ErrorHandler = errorHandler.ErrorHandler
    AppError = errorHandler.AppError
    ErrorSeverity = errorHandler.ErrorSeverity
    ErrorCategory = errorHandler.ErrorCategory
  })

  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError({
        code: 'ERR_1000' as any,
        message: 'Test error',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.VALIDATION,
        httpStatus: 400,
      })
      
      expect(error.message).toBe('Test error')
      expect(error.severity).toBe(ErrorSeverity.HIGH)
      expect(error.httpStatus).toBe(400)
      expect(error.timestamp).toBeDefined()
    })

    it('should serialize to JSON correctly', () => {
      const error = new AppError({
        code: 'ERR_1000' as any,
        message: 'Test error',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.VALIDATION,
        httpStatus: 400,
        details: { field: 'email' },
      })
      
      const json = error.toJSON()
      
      expect(json.code).toBe('ERR_1000')
      expect(json.message).toBe('Test error')
      expect(json.details).toEqual({ field: 'email' })
    })
  })

  describe('ErrorHandler.handle', () => {
    it('should wrap unknown errors', async () => {
      const unknownError = new Error('Unknown error occurred')
      const handled = await ErrorHandler.handle(unknownError)
      
      expect(handled).toBeInstanceOf(AppError)
      expect(handled.message).toBe('Unknown error occurred')
    })

    it('should preserve AppError instances', async () => {
      const appError = new AppError({
        code: 'ERR_1000' as any,
        message: 'App error',
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.VALIDATION,
        httpStatus: 400,
      })
      
      const handled = await ErrorHandler.handle(appError)
      
      expect(handled).toBe(appError)
    })
  })
})
