/**
 * DataSphere Innovation - Connectors Tests
 * Unit tests for data connectors
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// ============================================================================
// Connector Types Tests
// ============================================================================

describe('Connector Types', () => {
  it('should define all required connector types', async () => {
    const { ConnectorType } = await import('../../lib/connectors/types')
    
    expect(ConnectorType).toBeDefined()
  })
})

// ============================================================================
// Enhanced Connectors Tests
// ============================================================================

describe('Enhanced Connectors', () => {
  describe('Connector Registry', () => {
    it('should have multiple connector categories', async () => {
      const { enhancedConnectors } = await import('../../lib/connectors/enhanced-connectors')
      
      expect(Array.isArray(enhancedConnectors)).toBe(true)
      expect(enhancedConnectors.length).toBeGreaterThan(0)
    })

    it('should have required connector properties', async () => {
      const { enhancedConnectors } = await import('../../lib/connectors/enhanced-connectors')
      
      enhancedConnectors.forEach(connector => {
        expect(connector.id).toBeDefined()
        expect(connector.name).toBeDefined()
        expect(connector.type).toBeDefined()
        expect(connector.category).toBeDefined()
        expect(connector.config).toBeDefined()
      })
    })

    it('should have valid authentication types', async () => {
      const { enhancedConnectors } = await import('../../lib/connectors/enhanced-connectors')
      
      const validAuthTypes = ['oauth2', 'api_key', 'basic', 'bearer', 'custom']
      
      enhancedConnectors.forEach(connector => {
        expect(validAuthTypes).toContain(connector.config.authType)
      })
    })
  })
})

// ============================================================================
// Enterprise Connectors Tests
// ============================================================================

describe('Enterprise Connectors', () => {
  describe('SSO Connectors', () => {
    it('should support multiple SSO providers', async () => {
      const { enterpriseConnectors } = await import('../../lib/connectors/enterprise-connectors')
      
      const ssoConnectors = enterpriseConnectors.filter(c => c.category === 'sso')
      expect(ssoConnectors.length).toBeGreaterThan(0)
    })

    it('should have SAML and OIDC support', async () => {
      const { enterpriseConnectors } = await import('../../lib/connectors/enterprise-connectors')
      
      const ssoConnectors = enterpriseConnectors.filter(c => c.category === 'sso')
      const types = ssoConnectors.map(c => c.config.protocol)
      
      expect(types).toContain('saml')
      expect(types).toContain('oidc')
    })
  })

  describe('Database Connectors', () => {
    it('should support major databases', async () => {
      const { enterpriseConnectors } = await import('../../lib/connectors/enterprise-connectors')
      
      const dbConnectors = enterpriseConnectors.filter(c => c.category === 'database')
      const dbTypes = dbConnectors.map(c => c.type)
      
      expect(dbTypes.length).toBeGreaterThan(0)
    })
  })
})

// ============================================================================
// Multi-Sector Connectors Tests
// ============================================================================

describe('Multi-Sector Connectors', () => {
  describe('E-commerce Connectors', () => {
    it('should have e-commerce platform connectors', async () => {
      const { multiSectorConnectors } = await import('../../lib/connectors/multi-sector-connectors')
      
      const ecommerceConnectors = multiSectorConnectors.filter(c => c.category === 'ecommerce')
      expect(ecommerceConnectors.length).toBeGreaterThan(0)
    })
  })

  describe('CRM Connectors', () => {
    it('should have CRM platform connectors', async () => {
      const { multiSectorConnectors } = await import('../../lib/connectors/multi-sector-connectors')
      
      const crmConnectors = multiSectorConnectors.filter(c => c.category === 'crm')
      expect(crmConnectors.length).toBeGreaterThan(0)
    })
  })

  describe('Analytics Connectors', () => {
    it('should have analytics platform connectors', async () => {
      const { multiSectorConnectors } = await import('../../lib/connectors/multi-sector-connectors')
      
      const analyticsConnectors = multiSectorConnectors.filter(c => c.category === 'analytics')
      expect(analyticsConnectors.length).toBeGreaterThan(0)
    })
  })

  describe('Finance Connectors', () => {
    it('should have financial service connectors', async () => {
      const { multiSectorConnectors } = await import('../../lib/connectors/multi-sector-connectors')
      
      const financeConnectors = multiSectorConnectors.filter(c => c.category === 'finance')
      expect(financeConnectors.length).toBeGreaterThan(0)
    })
  })
})

// ============================================================================
// Connector Database Tests
// ============================================================================

describe('Connector Database', () => {
  describe('Connection Management', () => {
    it('should validate connection configs', async () => {
      const { validateConnectionConfig } = await import('../../lib/connectors/database')
      
      const validConfig = {
        host: 'localhost',
        port: 5432,
        database: 'test',
        username: 'user',
        password: 'pass',
      }
      
      const result = validateConnectionConfig(validConfig)
      expect(result.valid).toBe(true)
    })

    it('should reject invalid connection configs', async () => {
      const { validateConnectionConfig } = await import('../../lib/connectors/database')
      
      const invalidConfig = {
        host: '', // Missing host
        port: -1, // Invalid port
      }
      
      const result = validateConnectionConfig(invalidConfig)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})

// ============================================================================
// Connector Index Tests
// ============================================================================

describe('Connector Index', () => {
  it('should export all connector types', async () => {
    const connectors = await import('../../lib/connectors/index')
    
    expect(connectors.enhancedConnectors).toBeDefined()
    expect(connectors.enterpriseConnectors).toBeDefined()
    expect(connectors.multiSectorConnectors).toBeDefined()
  })

  it('should provide connector lookup function', async () => {
    const { getConnectorById } = await import('../../lib/connectors/index')
    
    expect(typeof getConnectorById).toBe('function')
  })

  it('should provide connector filtering function', async () => {
    const { getConnectorsByCategory } = await import('../../lib/connectors/index')
    
    expect(typeof getConnectorsByCategory).toBe('function')
  })
})
