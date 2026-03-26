/**
 * DataSphere Innovation - API Routes Tests
 * Integration tests for critical API endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock NextAuth session
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user', email: 'test@example.com' },
    expires: new Date(Date.now() + 86400000).toISOString(),
  })),
}))

// Mock Prisma
vi.mock('@/lib/db', () => ({
  db: {
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    execution: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    apiKey: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// ============================================================================
// Health API Tests
// ============================================================================

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const { GET } = await import('../../app/api/health/route')
      
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.status).toBe('healthy')
      expect(data.timestamp).toBeDefined()
      expect(data.version).toBeDefined()
      expect(data.checks).toBeDefined()
    })

    it('should include system checks', async () => {
      const { GET } = await import('../../app/api/health/route')
      
      const response = await GET()
      const data = await response.json()
      
      expect(data.checks.database).toBeDefined()
      expect(data.checks.memory).toBeDefined()
      expect(data.checks.uptime).toBeDefined()
    })
  })
})

// ============================================================================
// Metrics API Tests
// ============================================================================

describe('Metrics API', () => {
  describe('GET /api/metrics', () => {
    it('should return Prometheus-format metrics', async () => {
      const { GET } = await import('../../app/api/metrics/route')
      
      const response = await GET()
      const text = await response.text()
      
      expect(response.status).toBe(200)
      expect(text).toContain('# HELP')
      expect(text).toContain('# TYPE')
    })

    it('should include application metrics', async () => {
      const { GET } = await import('../../app/api/metrics/route')
      
      const response = await GET()
      const text = await response.text()
      
      expect(text).toContain('datasphere_')
    })
  })
})

// ============================================================================
// Projects API Tests
// ============================================================================

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/projects', () => {
    it('should return list of projects', async () => {
      const { db } = await import('@/lib/db')
      const mockProjects = [
        { id: '1', name: 'Project 1', status: 'active', createdAt: new Date() },
        { id: '2', name: 'Project 2', status: 'completed', createdAt: new Date() },
      ]
      
      vi.mocked(db.project.findMany).mockResolvedValue(mockProjects as any)
      
      const { GET } = await import('../../app/api/projects/route')
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.projects).toHaveLength(2)
    })

    it('should handle empty project list', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.project.findMany).mockResolvedValue([])
      
      const { GET } = await import('../../app/api/projects/route')
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(0)
    })
  })

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const { db } = await import('@/lib/db')
      const newProject = {
        id: 'new-project',
        name: 'New Project',
        description: 'Test project',
        status: 'active',
        createdAt: new Date(),
      }
      
      vi.mocked(db.project.create).mockResolvedValue(newProject as any)
      
      const { POST } = await import('../../app/api/projects/route')
      const request = new NextRequest('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Project', description: 'Test project' }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.project.name).toBe('New Project')
    })

    it('should reject invalid project data', async () => {
      const { POST } = await import('../../app/api/projects/route')
      const request = new NextRequest('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify({}), // Missing required name
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })
  })
})

// ============================================================================
// Connectors API Tests
// ============================================================================

describe('Connectors API', () => {
  describe('GET /api/connectors', () => {
    it('should return available connectors', async () => {
      const { GET } = await import('../../app/api/connectors/route')
      
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.connectors)).toBe(true)
    })

    it('should include connector categories', async () => {
      const { GET } = await import('../../app/api/connectors/route')
      
      const response = await GET()
      const data = await response.json()
      
      const categories = new Set(data.connectors.map((c: any) => c.category))
      expect(categories.size).toBeGreaterThan(0)
    })
  })
})

// ============================================================================
// Workflow API Tests
// ============================================================================

describe('Workflow API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/workflow', () => {
    it('should validate project ID', async () => {
      const { POST } = await import('../../app/api/workflow/route')
      const request = new NextRequest('http://localhost/api/workflow', {
        method: 'POST',
        body: JSON.stringify({}), // Missing projectId
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })
  })
})

// ============================================================================
// Notifications API Tests
// ============================================================================

describe('Notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/notifications', () => {
    it('should return user notifications', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.notification.findMany).mockResolvedValue([
        { id: '1', type: 'info', title: 'Test', message: 'Test notification', read: false },
      ] as any)
      
      const { GET } = await import('../../app/api/notifications/route')
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.notifications).toBeDefined()
    })

    it('should support limit parameter', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.notification.findMany).mockResolvedValue([])
      
      const { GET } = await import('../../app/api/notifications/route')
      const request = new NextRequest('http://localhost/api/notifications?limit=5')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
    })
  })
})
