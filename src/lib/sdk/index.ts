/**
 * AI Data Engineering SDK
 * Official TypeScript/JavaScript client for the AI Data Engineering Platform
 */

// Types
export interface Project {
  id: string
  name: string
  description: string | null
  status: string
  industry: string | null
  artifacts_count: number
  workflows_count: number
  created_at: string
  updated_at: string
}

export interface Workflow {
  id: string
  project_id: string
  type: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: number
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export interface Artifact {
  id: string
  name: string
  type: string
  description: string | null
  content: string
  created_at: string
}

export interface Template {
  id: string
  industry: string
  name: string
  description: string
  use_cases: string[]
  estimated_duration: string
  estimated_cost: { min: number; max: number }
}

export interface ROIAnalysis {
  summary: {
    total_investment: number
    yearly_benefit: number
    roi: number
    payback_period: number
    recommendation: string
  }
  costs: {
    development: { total_days: number; total_cost: number }
    infrastructure: { monthly: number; yearly: number }
    software: { yearly: number }
    maintenance: { yearly: number }
    totals: { first_year: number; three_years: number }
  }
  benefits: {
    efficiency: { hours_saved_per_week: number; yearly_savings: number }
    revenue: { yearly_increase: number }
    risk: { yearly_savings: number }
  }
  metrics: {
    payback_period: number
    roi: number
    npv: number
    irr: number
    break_even_point: string
  }
  recommendations: string[]
  risks: string[]
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
}

export interface ClientOptions {
  apiKey: string
  baseUrl?: string
  timeout?: number
}

export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Main Client
export class AIDataEngineering {
  private apiKey: string
  private baseUrl: string
  private timeout: number

  public projects: ProjectsAPI
  public workflows: WorkflowsAPI
  public templates: TemplatesAPI
  public roi: ROIAPI

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl || '/api/v1'
    this.timeout = options.timeout || 30000

    this.projects = new ProjectsAPI(this)
    this.workflows = new WorkflowsAPI(this)
    this.templates = new TemplatesAPI(this)
    this.roi = new ROIAPI(this)
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new APIError(
          data.code || 'UNKNOWN_ERROR',
          data.error || 'An error occurred',
          response.status
        )
      }

      return data
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

// Projects API
class ProjectsAPI {
  constructor(private client: AIDataEngineering) {}

  async list(options?: {
    limit?: number
    offset?: number
    status?: string
  }): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams()
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))
    if (options?.status) params.set('status', options.status)

    return this.client.request('GET', `/projects?${params}`)
  }

  async get(id: string): Promise<{ success: boolean; data: Project }> {
    return this.client.request('GET', `/projects/${id}`)
  }

  async create(data: {
    name: string
    description?: string
    industry?: string
    organization_id?: string
  }): Promise<{ success: boolean; data: Project }> {
    return this.client.request('POST', '/projects', data)
  }

  async update(id: string, data: Partial<{
    name: string
    description: string
    status: string
  }>): Promise<{ success: boolean; data: Project }> {
    return this.client.request('PATCH', `/projects/${id}`, data)
  }

  async delete(id: string): Promise<{ success: boolean }> {
    return this.client.request('DELETE', `/projects/${id}`)
  }
}

// Workflows API
class WorkflowsAPI {
  constructor(private client: AIDataEngineering) {}

  async list(options?: {
    project_id?: string
    status?: string
    limit?: number
  }): Promise<{ success: boolean; data: Workflow[] }> {
    const params = new URLSearchParams()
    if (options?.project_id) params.set('project_id', options.project_id)
    if (options?.status) params.set('status', options.status)
    if (options?.limit) params.set('limit', String(options.limit))

    return this.client.request('GET', `/workflows?${params}`)
  }

  async start(data: {
    project_id: string
    input: string
    type?: string
  }): Promise<{ success: boolean; data: Workflow }> {
    return this.client.request('POST', '/workflows', data)
  }

  async getStatus(id: string): Promise<{ success: boolean; workflow: Workflow }> {
    return this.client.request('GET', `/workflows/${id}`)
  }

  async cancel(id: string): Promise<{ success: boolean }> {
    return this.client.request('POST', `/workflows/${id}/cancel`)
  }
}

// Templates API
class TemplatesAPI {
  constructor(private client: AIDataEngineering) {}

  async list(): Promise<{ success: boolean; templates: Template[] }> {
    return this.client.request('GET', '/templates')
  }

  async get(industry: string): Promise<{ success: boolean; template: Template }> {
    return this.client.request('GET', `/templates?industry=${industry}`)
  }

  async generate(data: {
    industry: string
    project_name: string
  }): Promise<{ success: boolean; project_config: unknown }> {
    return this.client.request('POST', '/templates', data)
  }
}

// ROI API
class ROIAPI {
  constructor(private client: AIDataEngineering) {}

  async calculate(params: {
    project_name: string
    industry: string
    data_volume_gb: number
    data_sources: number
    users: number
    complexity: 'low' | 'medium' | 'high'
    timeline: number
    team_size: number
    cloud_provider: 'aws' | 'gcp' | 'azure' | 'multi'
    features: string[]
  }): Promise<{ success: boolean; analysis: ROIAnalysis }> {
    return this.client.request('POST', '/roi', params)
  }

  async quickEstimate(industry: string, budget: number): Promise<{
    success: boolean
    quick_estimate: { expected_roi: number; payback_months: number }
  }> {
    return this.client.request('GET', `/roi?industry=${industry}&budget=${budget}`)
  }
}

// Default export
export default AIDataEngineering
