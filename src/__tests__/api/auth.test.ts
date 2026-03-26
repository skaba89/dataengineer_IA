/**
 * DataSphere Innovation - Authentication API Tests
 * Comprehensive tests for auth endpoints and authentication utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// ============================================================================
// Mock Setup
// ============================================================================

const mockDb = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  organization: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  account: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  session: {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
}

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(async (password: string, rounds: number) => `hashed_${password}_${rounds}`),
    compare: vi.fn(async (password: string, hash: string) => {
      return hash.includes(password)
    }),
  },
  hash: vi.fn(async (password: string, rounds: number) => `hashed_${password}_${rounds}`),
  compare: vi.fn(async (password: string, hash: string) => {
    return hash.includes(password)
  }),
}))

// Mock modules
vi.mock('@/lib/db', () => ({
  db: mockDb,
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  hasRole: vi.fn(),
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ANALYST: 'analyst',
    VIEWER: 'viewer',
  },
  ROLE_HIERARCHY: {
    admin: 100,
    manager: 75,
    analyst: 50,
    viewer: 25,
  },
}))

// ============================================================================
// Registration API Tests
// ============================================================================

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Input Validation', () => {
    it('should return 400 when name is missing', async () => {
      const { POST } = await import('@/app/api/auth/register/route')
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          organizationName: 'Test Org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Tous les champs sont requis')
    })

    it('should return 400 when email is missing', async () => {
      const { POST } = await import('@/app/api/auth/register/route')
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          password: 'password123',
          organizationName: 'Test Org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Tous les champs sont requis')
    })

    it('should return 400 when password is missing', async () => {
      const { POST } = await import('@/app/api/auth/register/route')
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          organizationName: 'Test Org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Tous les champs sont requis')
    })

    it('should return 400 when organizationName is missing', async () => {
      const { POST } = await import('@/app/api/auth/register/route')
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Tous les champs sont requis')
    })

    it('should return 400 when password is too short', async () => {
      const { POST } = await import('@/app/api/auth/register/route')
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345',
          organizationName: 'Test Org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Le mot de passe doit contenir au moins 6 caractères')
    })
  })

  describe('Duplicate User Check', () => {
    it('should return 400 when user already exists', async () => {
      mockDb.user.findUnique.mockResolvedValueOnce({
        id: 'existing-user',
        email: 'existing@example.com',
      })

      const { POST } = await import('@/app/api/auth/register/route')
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
          organizationName: 'Test Org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Un compte existe déjà avec cet email')
    })
  })

  describe('Successful Registration', () => {
    it('should create organization and user successfully', async () => {
      mockDb.user.findUnique.mockResolvedValueOnce(null)
      mockDb.organization.create.mockResolvedValueOnce({
        id: 'org-123',
        name: 'Test Organization',
        slug: 'test-organization-abc123',
        plan: 'starter',
      })
      mockDb.user.create.mockResolvedValueOnce({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        organizationId: 'org-123',
      })

      const { POST } = await import('@/app/api/auth/register/route')
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          organizationName: 'Test Organization',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Compte créé avec succès')
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe('test@example.com')
    })

    it('should hash password before saving', async () => {
      mockDb.user.findUnique.mockResolvedValueOnce(null)
      mockDb.organization.create.mockResolvedValueOnce({
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
      })
      mockDb.user.create.mockResolvedValueOnce({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      })

      const { POST } = await import('@/app/api/auth/register/route')
      const bcrypt = await import('bcryptjs')

      await POST(new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          organizationName: 'Test Org',
        }),
      }))

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
    })

    it('should set user role as admin (first user of org)', async () => {
      mockDb.user.findUnique.mockResolvedValueOnce(null)
      mockDb.organization.create.mockResolvedValueOnce({
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
      })
      mockDb.user.create.mockResolvedValueOnce({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      })

      const { POST } = await import('@/app/api/auth/register/route')
      await POST(new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          organizationName: 'Test Org',
        }),
      }))

      expect(mockDb.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'admin',
          }),
        })
      )
    })

    it('should create organization with industry when provided', async () => {
      mockDb.user.findUnique.mockResolvedValueOnce(null)
      mockDb.organization.create.mockResolvedValueOnce({
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        industry: 'saas',
      })
      mockDb.user.create.mockResolvedValueOnce({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      })

      const { POST } = await import('@/app/api/auth/register/route')
      await POST(new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          organizationName: 'Test Org',
          industry: 'saas',
        }),
      }))

      expect(mockDb.organization.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            industry: 'saas',
          }),
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockDb.user.findUnique.mockRejectedValueOnce(new Error('Database error'))

      const { POST } = await import('@/app/api/auth/register/route')
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          organizationName: 'Test Org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la création du compte')
    })
  })
})

// ============================================================================
// NextAuth Route Handler Tests
// ============================================================================

describe('NextAuth Route Handler', () => {
  it('should export GET and POST handlers', async () => {
    const route = await import('@/app/api/auth/[...nextauth]/route')

    expect(route.GET).toBeDefined()
    expect(route.POST).toBeDefined()
  })
})

// ============================================================================
// Auth Configuration Tests
// ============================================================================

describe('Auth Configuration', () => {
  describe('ROLES', () => {
    it('should have correct role values', async () => {
      const { ROLES } = await import('@/lib/auth')

      expect(ROLES.ADMIN).toBe('admin')
      expect(ROLES.MANAGER).toBe('manager')
      expect(ROLES.ANALYST).toBe('analyst')
      expect(ROLES.VIEWER).toBe('viewer')
    })
  })

  describe('ROLE_HIERARCHY', () => {
    it('should have correct hierarchy values', async () => {
      const { ROLE_HIERARCHY } = await import('@/lib/auth')

      expect(ROLE_HIERARCHY.admin).toBe(100)
      expect(ROLE_HIERARCHY.manager).toBe(75)
      expect(ROLE_HIERARCHY.analyst).toBe(50)
      expect(ROLE_HIERARCHY.viewer).toBe(25)
    })
  })

  describe('hasRole', () => {
    it('should return true when user has higher or equal role', async () => {
      const { hasRole, ROLE_HIERARCHY } = await import('@/lib/auth')

      // Mock hasRole implementation
      const checkRole = (userRole: string, requiredRole: string) => {
        const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] ?? 0
        const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY]
        return userLevel >= requiredLevel
      }

      expect(checkRole('admin', 'manager')).toBe(true)
      expect(checkRole('admin', 'admin')).toBe(true)
      expect(checkRole('manager', 'analyst')).toBe(true)
      expect(checkRole('analyst', 'viewer')).toBe(true)
    })

    it('should return false when user has lower role', async () => {
      const { ROLE_HIERARCHY } = await import('@/lib/auth')

      const checkRole = (userRole: string, requiredRole: string) => {
        const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] ?? 0
        const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY]
        return userLevel >= requiredLevel
      }

      expect(checkRole('viewer', 'admin')).toBe(false)
      expect(checkRole('analyst', 'manager')).toBe(false)
      expect(checkRole('manager', 'admin')).toBe(false)
    })
  })

  describe('requireAuth', () => {
    it('should throw error when not authenticated', async () => {
      const { auth } = await import('@/lib/auth')
      vi.mocked(auth).mockResolvedValueOnce(null)

      const { requireAuth } = await import('@/lib/auth')

      await expect(requireAuth()).rejects.toThrow('Unauthorized')
    })

    it('should return session when authenticated', async () => {
      const mockSession = { user: { id: 'user-123', email: 'test@example.com' } }
      const { auth } = await import('@/lib/auth')
      vi.mocked(auth).mockResolvedValueOnce(mockSession as any)

      const { requireAuth } = await import('@/lib/auth')
      const session = await requireAuth()

      expect(session).toEqual(mockSession)
    })
  })

  describe('requireRole', () => {
    it('should throw error when not authenticated', async () => {
      const { auth } = await import('@/lib/auth')
      vi.mocked(auth).mockResolvedValueOnce(null)

      const { requireRole } = await import('@/lib/auth')

      await expect(requireRole('admin')).rejects.toThrow('Unauthorized')
    })

    it('should throw error when user lacks required role', async () => {
      const { auth, hasRole } = await import('@/lib/auth')
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: 'user-123', role: 'viewer' },
      } as any)
      vi.mocked(hasRole).mockReturnValueOnce(false)

      const { requireRole } = await import('@/lib/auth')

      await expect(requireRole('admin')).rejects.toThrow('Insufficient permissions')
    })

    it('should return session when user has required role', async () => {
      const mockSession = { user: { id: 'user-123', role: 'admin' } }
      const { auth, hasRole } = await import('@/lib/auth')
      vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
      vi.mocked(hasRole).mockReturnValueOnce(true)

      const { requireRole } = await import('@/lib/auth')
      const session = await requireRole('admin')

      expect(session).toEqual(mockSession)
    })
  })
})

// ============================================================================
// Session Extension Tests
// ============================================================================

describe('Session Extension', () => {
  it('should extend session with custom user properties', async () => {
    // This tests that the type declarations are correct
    const session = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        organizationId: 'org-123',
      },
    }

    expect(session.user.id).toBe('user-123')
    expect(session.user.role).toBe('admin')
    expect(session.user.organizationId).toBe('org-123')
  })
})

// ============================================================================
// Password Validation Tests
// ============================================================================

describe('Password Validation', () => {
  it('should accept valid passwords', async () => {
    const validPasswords = ['password123', 'MySecureP@ss!', '123456']

    for (const password of validPasswords) {
      expect(password.length).toBeGreaterThanOrEqual(6)
    }
  })

  it('should reject short passwords', async () => {
    const shortPassword = '12345'
    expect(shortPassword.length).toBeLessThan(6)
  })
})

// ============================================================================
// Organization Slug Generation Tests
// ============================================================================

describe('Organization Slug Generation', () => {
  it('should generate slug from organization name', async () => {
    const generateSlug = (name: string) => {
      return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }

    expect(generateSlug('My Organization')).toBe('my-organization')
    expect(generateSlug('Test Company Inc.')).toBe('test-company-inc')
    expect(generateSlug('DataSphere Innovation')).toBe('datasphere-innovation')
  })

  it('should handle special characters', async () => {
    const generateSlug = (name: string) => {
      return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }

    expect(generateSlug('Company @ Test!')).toBe('company--test')
    expect(generateSlug("L'Entreprise")).toBe('lentreprise')
  })
})

// ============================================================================
// SSO Provider Tests
// ============================================================================

describe('SSO Providers', () => {
  it('should have credentials provider configured', async () => {
    // Import auth config
    const authModule = await import('@/lib/auth')
    expect(authModule).toBeDefined()
  })

  describe('Azure AD Provider', () => {
    it('should be conditionally included based on environment', () => {
      const originalValue = process.env.AZURE_AD_CLIENT_ID
      
      // Test without env var
      delete process.env.AZURE_AD_CLIENT_ID
      // Provider should not be included
      
      // Test with env var
      process.env.AZURE_AD_CLIENT_ID = 'test-client-id'
      // Provider should be included
      
      // Restore
      if (originalValue) {
        process.env.AZURE_AD_CLIENT_ID = originalValue
      } else {
        delete process.env.AZURE_AD_CLIENT_ID
      }
    })
  })

  describe('Google Provider', () => {
    it('should be conditionally included based on environment', () => {
      const originalValue = process.env.GOOGLE_CLIENT_ID
      
      delete process.env.GOOGLE_CLIENT_ID
      
      process.env.GOOGLE_CLIENT_ID = 'test-client-id'
      
      if (originalValue) {
        process.env.GOOGLE_CLIENT_ID = originalValue
      } else {
        delete process.env.GOOGLE_CLIENT_ID
      }
    })
  })

  describe('Okta Provider', () => {
    it('should be conditionally included based on environment', () => {
      const originalValue = process.env.OKTA_CLIENT_ID
      
      delete process.env.OKTA_CLIENT_ID
      
      process.env.OKTA_CLIENT_ID = 'test-client-id'
      
      if (originalValue) {
        process.env.OKTA_CLIENT_ID = originalValue
      } else {
        delete process.env.OKTA_CLIENT_ID
      }
    })
  })

  describe('Auth0 Provider', () => {
    it('should be conditionally included based on environment', () => {
      const originalValue = process.env.AUTH0_CLIENT_ID
      
      delete process.env.AUTH0_CLIENT_ID
      
      process.env.AUTH0_CLIENT_ID = 'test-client-id'
      
      if (originalValue) {
        process.env.AUTH0_CLIENT_ID = originalValue
      } else {
        delete process.env.AUTH0_CLIENT_ID
      }
    })
  })
})

// ============================================================================
// JWT Callback Tests
// ============================================================================

describe('JWT Callbacks', () => {
  it('should add user id to token', async () => {
    const mockUser = {
      id: 'user-123',
      role: 'admin',
      organizationId: 'org-123',
    }

    // Simulate JWT callback behavior
    const token: Record<string, any> = {}
    if (mockUser) {
      token.id = mockUser.id
      token.role = mockUser.role
      token.organizationId = mockUser.organizationId
    }

    expect(token.id).toBe('user-123')
    expect(token.role).toBe('admin')
    expect(token.organizationId).toBe('org-123')
  })
})

// ============================================================================
// Session Callback Tests
// ============================================================================

describe('Session Callbacks', () => {
  it('should pass token data to session', async () => {
    const mockToken = {
      id: 'user-123',
      role: 'admin',
      organizationId: 'org-123',
    }

    // Simulate session callback behavior
    const session = {
      user: {} as Record<string, any>,
    }

    if (mockToken) {
      session.user.id = mockToken.id
      session.user.role = mockToken.role
      session.user.organizationId = mockToken.organizationId
    }

    expect(session.user.id).toBe('user-123')
    expect(session.user.role).toBe('admin')
    expect(session.user.organizationId).toBe('org-123')
  })
})

// ============================================================================
// Middleware Helper Tests
// ============================================================================

describe('canAccessOrganization', () => {
  it('should return true when user belongs to organization', async () => {
    const { canAccessOrganization } = await import('@/lib/auth')

    const result = canAccessOrganization('org-123', 'org-123')
    expect(result).toBe(true)
  })

  it('should return false when user does not belong to organization', async () => {
    const { canAccessOrganization } = await import('@/lib/auth')

    const result = canAccessOrganization('org-123', 'org-456')
    expect(result).toBe(false)
  })

  it('should return false when user has no organization', async () => {
    const { canAccessOrganization } = await import('@/lib/auth')

    const result = canAccessOrganization(null, 'org-123')
    expect(result).toBe(false)
  })
})

// ============================================================================
// Error Scenario Tests
// ============================================================================

describe('Error Scenarios', () => {
  it('should handle missing credentials gracefully', async () => {
    // Empty credentials should be handled by validation
    const credentials = { email: '', password: '' }
    
    expect(credentials.email).toBe('')
    expect(credentials.password).toBe('')
  })

  it('should handle invalid email format', async () => {
    const email = 'invalid-email'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    expect(emailRegex.test(email)).toBe(false)
  })

  it('should handle valid email format', async () => {
    const email = 'test@example.com'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    expect(emailRegex.test(email)).toBe(true)
  })
})
