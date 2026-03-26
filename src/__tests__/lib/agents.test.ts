/**
 * DataSphere Innovation - Agents Tests
 * Tests for AI agents and orchestration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock z-ai-web-dev-sdk
vi.mock('z-ai-web-dev-sdk', () => ({
  default: {
    create: vi.fn(() => Promise.resolve({
      chat: {
        completions: {
          create: vi.fn(() => Promise.resolve({
            choices: [{
              message: {
                content: JSON.stringify({
                  summary: 'Test analysis result',
                  recommendations: ['Recommendation 1', 'Recommendation 2'],
                  score: 85,
                }),
              },
            }],
          })),
        },
      },
    })),
  },
}))

// ============================================================================
// Base Agent Tests
// ============================================================================

describe('Base Agent', () => {
  describe('initialization', () => {
    it('should initialize with correct config', async () => {
      const { BaseAgent } = await import('@/lib/agents/core/base-agent')
      
      const agent = new BaseAgent({
        name: 'TestAgent',
        description: 'Test agent description',
        capabilities: ['capability1', 'capability2'],
      })
      
      expect(agent.name).toBe('TestAgent')
      expect(agent.description).toBe('Test agent description')
      expect(agent.capabilities).toHaveLength(2)
    })
  })

  describe('execute', () => {
    it('should execute task and return result', async () => {
      const { BaseAgent } = await import('@/lib/agents/core/base-agent')
      
      const agent = new BaseAgent({
        name: 'TestAgent',
        description: 'Test agent',
        capabilities: ['test'],
      })
      
      const result = await agent.execute({
        task: 'Test task',
        context: { projectId: 'test-project' },
      })
      
      expect(result).toBeDefined()
      expect(result.status).toBe('success')
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should track execution time', async () => {
      const { BaseAgent } = await import('@/lib/agents/core/base-agent')
      
      const agent = new BaseAgent({
        name: 'TimingAgent',
        description: 'Timing test agent',
        capabilities: ['timing'],
      })
      
      const startTime = Date.now()
      await agent.execute({ task: 'Test', context: {} })
      const endTime = Date.now()
      
      // Execution should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000)
    })

    it('should handle errors gracefully', async () => {
      const { BaseAgent } = await import('@/lib/agents/core/base-agent')
      
      const agent = new BaseAgent({
        name: 'ErrorAgent',
        description: 'Error handling test',
        capabilities: ['error'],
      })
      
      // Mock error scenario
      const result = await agent.execute({
        task: 'Error task',
        context: { simulateError: true },
      })
      
      expect(result).toBeDefined()
    })
  })
})

// ============================================================================
// Business Agent Tests
// ============================================================================

describe('Business Agent', () => {
  let agent: any

  beforeEach(async () => {
    const { BusinessAgent } = await import('@/lib/agents/specialized/business-agent')
    agent = new BusinessAgent()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('analyze', () => {
    it('should analyze business requirements', async () => {
      const result = await agent.analyze({
        companyInfo: {
          name: 'Test Company',
          industry: 'Technology',
          size: '100-500',
        },
        objectives: ['Improve data quality', 'Reduce costs'],
      })

      expect(result).toBeDefined()
      expect(result.summary).toBeDefined()
    })

    it('should generate recommendations', async () => {
      const result = await agent.analyze({
        companyInfo: {
          name: 'Test Corp',
          industry: 'Finance',
        },
        objectives: ['Compliance'],
      })

      expect(result.recommendations).toBeDefined()
      expect(Array.isArray(result.recommendations)).toBe(true)
    })
  })

  describe('estimateEffort', () => {
    it('should estimate effort for requirements', async () => {
      const estimate = agent.estimateEffort({
        complexity: 'medium',
        dataSources: 3,
        integrations: 2,
      })

      expect(estimate).toBeDefined()
      expect(estimate.duration).toBeGreaterThan(0)
      expect(estimate.resources).toBeGreaterThan(0)
    })
  })
})

// ============================================================================
// Discovery Agent Tests
// ============================================================================

describe('Discovery Agent', () => {
  let agent: any

  beforeEach(async () => {
    const { DiscoveryAgent } = await import('@/lib/agents/specialized/discovery-agent')
    agent = new DiscoveryAgent()
  })

  describe('discoverSchema', () => {
    it('should discover database schema', async () => {
      const result = await agent.discoverSchema({
        type: 'postgresql',
        host: 'localhost',
        database: 'testdb',
      })

      expect(result).toBeDefined()
      expect(result.tables).toBeDefined()
      expect(Array.isArray(result.tables)).toBe(true)
    })

    it('should identify primary keys and relationships', async () => {
      const result = await agent.discoverSchema({
        type: 'postgresql',
        host: 'localhost',
        database: 'testdb',
      })

      if (result.tables.length > 0) {
        const table = result.tables[0]
        expect(table.name).toBeDefined()
        expect(table.columns).toBeDefined()
      }
    })
  })

  describe('analyzeDataQuality', () => {
    it('should analyze data quality metrics', async () => {
      const result = await agent.analyzeDataQuality({
        table: 'users',
        columns: ['id', 'email', 'name'],
      })

      expect(result).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })
  })
})

// ============================================================================
// Pipeline Agent Tests
// ============================================================================

describe('Pipeline Agent', () => {
  let agent: any

  beforeEach(async () => {
    const { PipelineAgent } = await import('@/lib/agents/specialized/pipeline-agent')
    agent = new PipelineAgent()
  })

  describe('generateAirflowDAG', () => {
    it('should generate valid Airflow DAG', async () => {
      const dag = await agent.generateAirflowDAG({
        name: 'test_pipeline',
        schedule: '0 0 * * *',
        tasks: [
          { id: 'extract', type: 'python' },
          { id: 'transform', type: 'sql' },
          { id: 'load', type: 'python' },
        ],
      })

      expect(dag).toBeDefined()
      expect(dag).toContain('from airflow')
      expect(dag).toContain('test_pipeline')
    })

    it('should include task dependencies', async () => {
      const dag = await agent.generateAirflowDAG({
        name: 'dependency_test',
        schedule: '@daily',
        tasks: [
          { id: 'task1', type: 'python' },
          { id: 'task2', type: 'python', dependsOn: ['task1'] },
        ],
      })

      expect(dag).toContain('task1')
      expect(dag).toContain('task2')
    })
  })

  describe('generateDbtModel', () => {
    it('should generate dbt model', async () => {
      const model = await agent.generateDbtModel({
        name: 'staging_users',
        source: 'raw.users',
        columns: [
          { name: 'id', type: 'integer', tests: ['unique', 'not_null'] },
          { name: 'email', type: 'string', tests: ['unique'] },
        ],
      })

      expect(model).toBeDefined()
      expect(model.sql).toContain('SELECT')
      expect(model.schema).toBeDefined()
    })
  })
})

// ============================================================================
// Orchestrator Tests
// ============================================================================

describe('Workflow Orchestrator', () => {
  let orchestrator: any

  beforeEach(async () => {
    const { Orchestrator } = await import('@/lib/agents/core/orchestrator')
    orchestrator = new Orchestrator()
  })

  describe('executeWorkflow', () => {
    it('should execute workflow phases in order', async () => {
      const result = await orchestrator.executeWorkflow({
        projectId: 'test-project',
        phases: ['discovery', 'architecture', 'pipeline'],
      })

      expect(result).toBeDefined()
      expect(result.status).toBe('completed')
      expect(result.phases).toHaveLength(3)
    })

    it('should pass context between phases', async () => {
      const result = await orchestrator.executeWorkflow({
        projectId: 'context-test',
        phases: ['discovery', 'architecture'],
      })

      expect(result.context).toBeDefined()
    })

    it('should handle phase failures', async () => {
      const result = await orchestrator.executeWorkflow({
        projectId: 'failure-test',
        phases: ['discovery', 'invalid-phase', 'pipeline'],
      })

      // Should handle gracefully
      expect(result).toBeDefined()
    })
  })

  describe('getWorkflowStatus', () => {
    it('should return workflow status', async () => {
      const status = await orchestrator.getWorkflowStatus('workflow-123')

      expect(status).toBeDefined()
    })
  })
})

// ============================================================================
// Conversational Agent Tests
// ============================================================================

describe('Conversational Agent', () => {
  let agent: any

  beforeEach(async () => {
    const { ConversationalAgent } = await import('@/lib/agents/specialized/conversational-agent')
    agent = new ConversationalAgent()
  })

  describe('processQuery', () => {
    it('should process natural language query', async () => {
      const result = await agent.processQuery({
        query: 'Show me the top 10 customers by revenue',
        context: {
          tables: ['customers', 'orders'],
          schema: { customers: {}, orders: {} },
        },
      })

      expect(result).toBeDefined()
      expect(result.sql).toBeDefined()
      expect(result.explanation).toBeDefined()
    })

    it('should handle ambiguous queries', async () => {
      const result = await agent.processQuery({
        query: 'How is our business doing?',
        context: {},
      })

      expect(result).toBeDefined()
      expect(result.clarificationNeeded || result.response).toBeDefined()
    })
  })
})

// ============================================================================
// BI Agent Tests
// ============================================================================

describe('BI Agent', () => {
  let agent: any

  beforeEach(async () => {
    const { BIAgent } = await import('@/lib/agents/specialized/bi-agent')
    agent = new BIAgent()
  })

  describe('generateDashboard', () => {
    it('should generate dashboard configuration', async () => {
      const dashboard = await agent.generateDashboard({
        name: 'Sales Dashboard',
        metrics: ['revenue', 'orders', 'customers'],
        dimensions: ['date', 'region', 'product'],
      })

      expect(dashboard).toBeDefined()
      expect(dashboard.name).toBe('Sales Dashboard')
      expect(dashboard.widgets).toBeDefined()
    })

    it('should suggest appropriate visualizations', async () => {
      const result = await agent.suggestVisualization({
        metric: 'revenue',
        dimension: 'date',
        dataType: 'time-series',
      })

      expect(result).toBeDefined()
      expect(result.chartType).toBeDefined()
    })
  })

  describe('generateKPIs', () => {
    it('should generate relevant KPIs', async () => {
      const kpis = await agent.generateKPIs({
        industry: 'e-commerce',
        objectives: ['growth', 'retention'],
      })

      expect(kpis).toBeDefined()
      expect(Array.isArray(kpis)).toBe(true)
    })
  })
})
