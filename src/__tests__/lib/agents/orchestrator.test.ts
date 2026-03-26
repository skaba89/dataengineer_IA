/**
 * DataSphere Innovation - Agent Orchestrator Tests
 * Comprehensive tests for the agent orchestration system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ============================================================================
// Type Imports
// ============================================================================

type AgentType = 
  | 'business'
  | 'sales'
  | 'discovery'
  | 'architecture'
  | 'pipeline'
  | 'transformation'
  | 'bi'
  | 'conversational'
  | 'pricing'
  | 'productization'

type WorkflowPhase = 
  | 'initiated'
  | 'qualifying'
  | 'discovering'
  | 'designing'
  | 'building'
  | 'deploying'
  | 'completed'

interface WorkflowStep {
  agent: AgentType
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  duration?: number
  error?: string
}

interface OrchestrationPlan {
  projectId: string
  currentPhase: WorkflowPhase
  steps: WorkflowStep[]
  estimatedDuration: number
  estimatedCost: number
}

interface AgentContext {
  projectId: string
  userId?: string
  conversationHistory: any[]
  projectData: any
  metadata: Record<string, unknown>
}

interface AgentResult {
  success: boolean
  output: Record<string, unknown>
  artifacts?: any[]
  recommendations?: string[]
  nextSteps?: string[]
  error?: string
}

// ============================================================================
// Mock Agents
// ============================================================================

const createMockAgent = (name: string) => ({
  name,
  description: `Mock ${name} agent`,
  execute: vi.fn(async (_context: AgentContext, _message: string): Promise<AgentResult> => ({
    success: true,
    output: { result: `${name} executed successfully` },
    recommendations: [],
    nextSteps: [],
  })),
  chat: vi.fn(async (_context: AgentContext, _message: string) => ({
    response: `Response from ${name}`,
  })),
}))

// ============================================================================
// Orchestrator Tests
// ============================================================================

describe('AgentOrchestrator', () => {
  let orchestrator: any
  let mockAgents: Map<AgentType, any>

  beforeEach(async () => {
    vi.clearAllMocks()

    // Create mock agents
    mockAgents = new Map([
      ['business', createMockAgent('Business')],
      ['sales', createMockAgent('Sales')],
      ['discovery', createMockAgent('Discovery')],
      ['architecture', createMockAgent('Architecture')],
      ['pipeline', createMockAgent('Pipeline')],
      ['transformation', createMockAgent('Transformation')],
      ['bi', createMockAgent('BI')],
      ['conversational', createMockAgent('Conversational')],
      ['pricing', createMockAgent('Pricing')],
      ['productization', createMockAgent('Productization')],
    ])

    // Create orchestrator with mocked dependencies
    const { AgentOrchestrator } = await import('@/lib/agents/core/orchestrator')
    orchestrator = new AgentOrchestrator()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================================
  // Initialization Tests
  // ============================================================================

  describe('Initialization', () => {
    it('should create an orchestrator instance', () => {
      expect(orchestrator).toBeDefined()
    })

    it('should have all agent types initialized', () => {
      const agentTypes = orchestrator.getAgentsInfo()
      expect(agentTypes.length).toBe(10)
    })

    it('should have correct agent types', () => {
      const agentTypes = orchestrator.getAgentsInfo()
      const types = agentTypes.map((a: any) => a.type)

      expect(types).toContain('business')
      expect(types).toContain('sales')
      expect(types).toContain('discovery')
      expect(types).toContain('architecture')
      expect(types).toContain('pipeline')
      expect(types).toContain('transformation')
      expect(types).toContain('bi')
      expect(types).toContain('conversational')
      expect(types).toContain('pricing')
      expect(types).toContain('productization')
    })
  })

  // ============================================================================
  // Agent Management Tests
  // ============================================================================

  describe('getAgent', () => {
    it('should return agent by type', () => {
      const agent = orchestrator.getAgent('business')
      expect(agent).toBeDefined()
    })

    it('should throw error for non-existent agent type', () => {
      expect(() => orchestrator.getAgent('nonexistent' as AgentType)).toThrow("Agent 'nonexistent' not found")
    })
  })

  describe('getAgentsInfo', () => {
    it('should return array of agent info', () => {
      const info = orchestrator.getAgentsInfo()

      expect(Array.isArray(info)).toBe(true)
      expect(info.length).toBe(10)
    })

    it('should include type, name, and description for each agent', () => {
      const info = orchestrator.getAgentsInfo()

      info.forEach((agent: any) => {
        expect(agent).toHaveProperty('type')
        expect(agent).toHaveProperty('name')
        expect(agent).toHaveProperty('description')
      })
    })
  })

  // ============================================================================
  // Plan Creation Tests
  // ============================================================================

  describe('createPlan', () => {
    it('should create orchestration plan for draft project', async () => {
      const projectData = {
        id: 'proj-123',
        name: 'Test Project',
        status: 'draft',
      }

      const plan = await orchestrator.createPlan(projectData)

      expect(plan).toHaveProperty('projectId')
      expect(plan).toHaveProperty('currentPhase')
      expect(plan).toHaveProperty('steps')
      expect(plan).toHaveProperty('estimatedDuration')
      expect(plan).toHaveProperty('estimatedCost')
    })

    it('should return correct workflow for draft status', async () => {
      const projectData = {
        id: 'proj-123',
        name: 'Test Project',
        status: 'draft',
      }

      const plan = await orchestrator.createPlan(projectData)

      expect(plan.currentPhase).toBe('initiated')
      expect(plan.steps.length).toBe(4) // business, discovery, architecture, pricing
      expect(plan.steps[0].agent).toBe('business')
    })

    it('should return correct workflow for discovery status', async () => {
      const projectData = {
        id: 'proj-123',
        name: 'Test Project',
        status: 'discovery',
      }

      const plan = await orchestrator.createPlan(projectData)

      expect(plan.currentPhase).toBe('discovering')
      expect(plan.steps.length).toBe(2) // discovery, architecture
    })

    it('should return correct workflow for architecture status', async () => {
      const projectData = {
        id: 'proj-123',
        name: 'Test Project',
        status: 'architecture',
      }

      const plan = await orchestrator.createPlan(projectData)

      expect(plan.currentPhase).toBe('designing')
      expect(plan.steps.length).toBe(2) // architecture, pipeline
    })

    it('should return correct workflow for development status', async () => {
      const projectData = {
        id: 'proj-123',
        name: 'Test Project',
        status: 'development',
      }

      const plan = await orchestrator.createPlan(projectData)

      expect(plan.currentPhase).toBe('building')
      expect(plan.steps.length).toBe(3) // pipeline, transformation, bi
    })

    it('should return correct workflow for deployed status', async () => {
      const projectData = {
        id: 'proj-123',
        name: 'Test Project',
        status: 'deployed',
      }

      const plan = await orchestrator.createPlan(projectData)

      expect(plan.currentPhase).toBe('deploying')
      expect(plan.steps.length).toBe(3) // bi, conversational, productization
    })

    it('should calculate estimated duration', async () => {
      const projectData = {
        id: 'proj-123',
        name: 'Test Project',
        status: 'draft',
      }

      const plan = await orchestrator.createPlan(projectData)

      expect(plan.estimatedDuration).toBeGreaterThan(0)
    })

    it('should calculate estimated cost', async () => {
      const projectData = {
        id: 'proj-123',
        name: 'Test Project',
        status: 'draft',
      }

      const plan = await orchestrator.createPlan(projectData)

      expect(plan.estimatedCost).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // Workflow Execution Tests
  // ============================================================================

  describe('executeAgent', () => {
    it('should execute a single agent', async () => {
      const context: AgentContext = {
        projectId: 'proj-123',
        conversationHistory: [],
        projectData: {
          id: 'proj-123',
          name: 'Test Project',
          status: 'draft',
        },
        metadata: {},
      }

      const result = await orchestrator.executeAgent('business', context, 'Test message')

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('output')
    })

    it('should throw error for invalid agent type', async () => {
      const context: AgentContext = {
        projectId: 'proj-123',
        conversationHistory: [],
        projectData: {
          id: 'proj-123',
          name: 'Test Project',
        },
        metadata: {},
      }

      await expect(
        orchestrator.executeAgent('invalid' as AgentType, context, 'Test')
      ).toThrow()
    })
  })

  describe('executeWorkflow', () => {
    it('should execute full workflow', async () => {
      const context: AgentContext = {
        projectId: 'proj-123',
        conversationHistory: [],
        projectData: {
          id: 'proj-123',
          name: 'Test Project',
          status: 'draft',
        },
        metadata: {},
      }

      const results = await orchestrator.executeWorkflow(context)

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should track progress with callback', async () => {
      const context: AgentContext = {
        projectId: 'proj-123',
        conversationHistory: [],
        projectData: {
          id: 'proj-123',
          name: 'Test Project',
          status: 'draft',
        },
        metadata: {},
      }

      const progressCallback = vi.fn()
      await orchestrator.executeWorkflow(context, progressCallback)

      expect(progressCallback).toHaveBeenCalled()
    })

    it('should stop on agent failure', async () => {
      // Mock a failing agent
      const failingAgent = {
        name: 'Failing Business Agent',
        description: 'Test agent that fails',
        execute: vi.fn(async (): Promise<AgentResult> => ({
          success: false,
          output: {},
          error: 'Simulated failure',
        })),
      }

      orchestrator.agents.set('business', failingAgent)

      const context: AgentContext = {
        projectId: 'proj-123',
        conversationHistory: [],
        projectData: {
          id: 'proj-123',
          name: 'Test Project',
          status: 'draft',
        },
        metadata: {},
      }

      const results = await orchestrator.executeWorkflow(context)

      // Should have at least one failed step
      const failedStep = results.find((r: WorkflowStep) => r.status === 'failed')
      expect(failedStep).toBeDefined()
    })

    it('should include duration in step results', async () => {
      const context: AgentContext = {
        projectId: 'proj-123',
        conversationHistory: [],
        projectData: {
          id: 'proj-123',
          name: 'Test Project',
          status: 'draft',
        },
        metadata: {},
      }

      const results = await orchestrator.executeWorkflow(context)

      results.forEach((step: WorkflowStep) => {
        expect(step.duration).toBeDefined()
        expect(step.duration).toBeGreaterThanOrEqual(0)
      })
    })
  })

  // ============================================================================
  // Chat Tests
  // ============================================================================

  describe('chat', () => {
    it('should return response from conversational agent', async () => {
      const context: AgentContext = {
        projectId: 'proj-123',
        conversationHistory: [],
        projectData: {
          id: 'proj-123',
          name: 'Test Project',
        },
        metadata: {},
      }

      const response = await orchestrator.chat(context, 'What is the project status?')

      expect(response).toHaveProperty('response')
    })
  })

  // ============================================================================
  // Workflow Determination Tests
  // ============================================================================

  describe('determineWorkflow', () => {
    it('should return correct steps for draft status', async () => {
      const projectData = {
        id: 'proj-123',
        status: 'draft',
      }

      const plan = await orchestrator.createPlan(projectData)
      const agentTypes = plan.steps.map((s: WorkflowStep) => s.agent)

      expect(agentTypes).toContain('business')
      expect(agentTypes).toContain('discovery')
      expect(agentTypes).toContain('architecture')
      expect(agentTypes).toContain('pricing')
    })

    it('should return correct steps for deployed status', async () => {
      const projectData = {
        id: 'proj-123',
        status: 'deployed',
      }

      const plan = await orchestrator.createPlan(projectData)
      const agentTypes = plan.steps.map((s: WorkflowStep) => s.agent)

      expect(agentTypes).toContain('bi')
      expect(agentTypes).toContain('conversational')
      expect(agentTypes).toContain('productization')
    })
  })

  // ============================================================================
  // Duration and Cost Calculation Tests
  // ============================================================================

  describe('calculateDuration', () => {
    it('should calculate correct total duration', async () => {
      const projectData = {
        id: 'proj-123',
        status: 'draft',
      }

      const plan = await orchestrator.createPlan(projectData)

      // Draft: business(15) + discovery(45) + architecture(30) + pricing(15) = 105
      expect(plan.estimatedDuration).toBe(105)
    })
  })

  describe('calculateCost', () => {
    it('should calculate correct total cost', async () => {
      const projectData = {
        id: 'proj-123',
        status: 'draft',
      }

      const plan = await orchestrator.createPlan(projectData)

      // Draft: business(2) + discovery(4) + architecture(3) + pricing(1) = 10
      expect(plan.estimatedCost).toBe(10)
    })
  })
})

// ============================================================================
// Singleton Instance Tests
// ============================================================================

describe('getOrchestrator Singleton', () => {
  it('should return the same instance', async () => {
    const { getOrchestrator } = await import('@/lib/agents/core/orchestrator')

    const instance1 = getOrchestrator()
    const instance2 = getOrchestrator()

    expect(instance1).toBe(instance2)
  })

  it('should return a valid orchestrator', async () => {
    const { getOrchestrator } = await import('@/lib/agents/core/orchestrator')

    const orchestrator = getOrchestrator()

    expect(orchestrator).toBeDefined()
    expect(orchestrator.getAgentsInfo).toBeDefined()
    expect(orchestrator.createPlan).toBeDefined()
    expect(orchestrator.executeAgent).toBeDefined()
    expect(orchestrator.executeWorkflow).toBeDefined()
  })
})

// ============================================================================
// Workflow Phase Tests
// ============================================================================

describe('Workflow Phases', () => {
  let orchestrator: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { AgentOrchestrator } = await import('@/lib/agents/core/orchestrator')
    orchestrator = new AgentOrchestrator()
  })

  it('should map draft to initiated phase', async () => {
    const plan = await orchestrator.createPlan({ id: 'test', status: 'draft' })
    expect(plan.currentPhase).toBe('initiated')
  })

  it('should map discovery to discovering phase', async () => {
    const plan = await orchestrator.createPlan({ id: 'test', status: 'discovery' })
    expect(plan.currentPhase).toBe('discovering')
  })

  it('should map architecture to designing phase', async () => {
    const plan = await orchestrator.createPlan({ id: 'test', status: 'architecture' })
    expect(plan.currentPhase).toBe('designing')
  })

  it('should map development to building phase', async () => {
    const plan = await orchestrator.createPlan({ id: 'test', status: 'development' })
    expect(plan.currentPhase).toBe('building')
  })

  it('should map deployed to deploying phase', async () => {
    const plan = await orchestrator.createPlan({ id: 'test', status: 'deployed' })
    expect(plan.currentPhase).toBe('deploying')
  })

  it('should map completed to completed phase', async () => {
    const plan = await orchestrator.createPlan({ id: 'test', status: 'completed' })
    expect(plan.currentPhase).toBe('completed')
  })

  it('should default to initiated for unknown status', async () => {
    const plan = await orchestrator.createPlan({ id: 'test', status: 'unknown' })
    expect(plan.currentPhase).toBe('initiated')
  })
})

// ============================================================================
// Agent Message Generation Tests
// ============================================================================

describe('Agent Message Generation', () => {
  let orchestrator: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { AgentOrchestrator } = await import('@/lib/agents/core/orchestrator')
    orchestrator = new AgentOrchestrator()
  })

  it('should generate appropriate message for business agent', async () => {
    const context: AgentContext = {
      projectId: 'proj-123',
      conversationHistory: [],
      projectData: {
        id: 'proj-123',
        name: 'My Project',
        industry: 'Retail',
        businessGoals: ['Increase sales', 'Improve customer experience'],
      },
      metadata: {},
    }

    // executeAgent internally generates message
    const result = await orchestrator.executeAgent('business', context, 'test')
    expect(result).toBeDefined()
  })

  it('should generate appropriate message for discovery agent', async () => {
    const context: AgentContext = {
      projectId: 'proj-123',
      conversationHistory: [],
      projectData: {
        id: 'proj-123',
        name: 'My Project',
        dataSources: [{ name: 'PostgreSQL' }, { name: 'MongoDB' }],
      },
      metadata: {},
    }

    const result = await orchestrator.executeAgent('discovery', context, 'test')
    expect(result).toBeDefined()
  })

  it('should generate appropriate message for architecture agent', async () => {
    const context: AgentContext = {
      projectId: 'proj-123',
      conversationHistory: [],
      projectData: {
        id: 'proj-123',
        name: 'My Project',
        dataSources: [{ id: '1' }, { id: '2' }, { id: '3' }],
        architecture: {
          architecturePattern: 'data_vault',
        },
      },
      metadata: {},
    }

    const result = await orchestrator.executeAgent('architecture', context, 'test')
    expect(result).toBeDefined()
  })

  it('should generate appropriate message for pricing agent', async () => {
    const context: AgentContext = {
      projectId: 'proj-123',
      conversationHistory: [],
      projectData: {
        id: 'proj-123',
        name: 'My Project',
        dataSources: [{ id: '1' }],
        budget: { min: 10000, max: 50000 },
      },
      metadata: {},
    }

    const result = await orchestrator.executeAgent('pricing', context, 'test')
    expect(result).toBeDefined()
  })
})

// ============================================================================
// Context Propagation Tests
// // ============================================================================

describe('Context Propagation', () => {
  let orchestrator: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { AgentOrchestrator } = await import('@/lib/agents/core/orchestrator')
    orchestrator = new AgentOrchestrator()
  })

  it('should propagate project data through workflow', async () => {
    const context: AgentContext = {
      projectId: 'proj-123',
      conversationHistory: [],
      projectData: {
        id: 'proj-123',
        name: 'Context Test Project',
        status: 'draft',
        industry: 'Finance',
      },
      metadata: {},
    }

    const results = await orchestrator.executeWorkflow(context)

    expect(results.length).toBeGreaterThan(0)
  })

  it('should update metadata after each step', async () => {
    const context: AgentContext = {
      projectId: 'proj-123',
      conversationHistory: [],
      projectData: {
        id: 'proj-123',
        name: 'Test Project',
        status: 'draft',
      },
      metadata: { initial: true },
    }

    await orchestrator.executeWorkflow(context)

    // Metadata should be updated with lastResult
    expect(context.metadata.lastResult).toBeDefined()
  })
})

// ============================================================================
// Error Handling Tests
// // ============================================================================

describe('Error Handling', () => {
  let orchestrator: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { AgentOrchestrator } = await import('@/lib/agents/core/orchestrator')
    orchestrator = new AgentOrchestrator()
  })

  it('should handle agent execution errors gracefully', async () => {
    // Create a failing agent
    const failingAgent = {
      name: 'Failing Agent',
      description: 'Test agent',
      execute: vi.fn(async () => {
        throw new Error('Agent execution failed')
      }),
    }

    orchestrator.agents.set('business', failingAgent)

    const context: AgentContext = {
      projectId: 'proj-123',
      conversationHistory: [],
      projectData: { id: 'proj-123', name: 'Test' },
      metadata: {},
    }

    const results = await orchestrator.executeWorkflow(context)

    // Should have a failed step with error message
    const failedStep = results.find((r: WorkflowStep) => r.status === 'failed')
    expect(failedStep).toBeDefined()
    expect(failedStep.error).toBe('Agent execution failed')
  })

  it('should handle missing project data gracefully', async () => {
    const context: AgentContext = {
      projectId: 'proj-123',
      conversationHistory: [],
      projectData: {
        id: 'proj-123',
        // Missing name and other fields
      },
      metadata: {},
    }

    // Should not throw
    const plan = await orchestrator.createPlan(context.projectData)
    expect(plan).toBeDefined()
  })
})
