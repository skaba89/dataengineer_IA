// OpenAPI Specification Generator for AI Data Engineering System
// Generates comprehensive API documentation with Swagger UI

export interface OpenAPISpec {
  openapi: string
  info: APIInfo
  servers: Server[]
  paths: Record<string, PathItem>
  components: Components
  tags: Tag[]
  security?: SecurityRequirement[]
}

export interface APIInfo {
  title: string
  description: string
  version: string
  contact?: Contact
  license?: License
  termsOfService?: string
}

export interface Contact {
  name: string
  email: string
  url?: string
}

export interface License {
  name: string
  url?: string
}

export interface Server {
  url: string
  description: string
  variables?: Record<string, ServerVariable>
}

export interface ServerVariable {
  default: string
  enum?: string[]
  description?: string
}

export interface PathItem {
  get?: Operation
  post?: Operation
  put?: Operation
  delete?: Operation
  patch?: Operation
  parameters?: Parameter[]
}

export interface Operation {
  summary: string
  description?: string
  operationId: string
  tags?: string[]
  parameters?: Parameter[]
  requestBody?: RequestBody
  responses: Record<string, Response>
  security?: SecurityRequirement[]
  deprecated?: boolean
}

export interface Parameter {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  description?: string
  required?: boolean
  deprecated?: boolean
  schema: Schema
  example?: unknown
}

export interface RequestBody {
  description?: string
  content: Record<string, MediaType>
  required?: boolean
}

export interface MediaType {
  schema: Schema | Reference
  example?: unknown
  examples?: Record<string, Example>
}

export interface Response {
  description: string
  headers?: Record<string, Header>
  content?: Record<string, MediaType>
}

export interface Header {
  description?: string
  schema: Schema
}

export interface Schema {
  type?: string
  format?: string
  title?: string
  description?: string
  default?: unknown
  enum?: unknown[]
  example?: unknown
  properties?: Record<string, Schema | Reference>
  required?: string[]
  items?: Schema | Reference
  additionalProperties?: Schema | Reference | boolean
  minItems?: number
  maxItems?: number
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  nullable?: boolean
  oneOf?: (Schema | Reference)[]
  allOf?: (Schema | Reference)[]
  anyOf?: (Schema | Reference)[]
  $ref?: string
}

export interface Reference {
  $ref: string
}

export interface Components {
  schemas?: Record<string, Schema>
  securitySchemes?: Record<string, SecurityScheme>
  parameters?: Record<string, Parameter>
  requestBodies?: Record<string, RequestBody>
  responses?: Record<string, Response>
}

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'
  description?: string
  name?: string
  in?: 'query' | 'header' | 'cookie'
  scheme?: string
  bearerFormat?: string
  flows?: OAuthFlows
  openIdConnectUrl?: string
}

export interface OAuthFlows {
  implicit?: OAuthFlow
  password?: OAuthFlow
  clientCredentials?: OAuthFlow
  authorizationCode?: OAuthFlow
}

export interface OAuthFlow {
  authorizationUrl?: string
  tokenUrl?: string
  refreshUrl?: string
  scopes: Record<string, string>
}

export interface SecurityRequirement {
  [name: string]: string[]
}

export interface Tag {
  name: string
  description?: string
}

export interface Example {
  summary?: string
  description?: string
  value?: unknown
  externalValue?: string
}

// Generate the complete OpenAPI specification
export function generateOpenAPISpec(baseUrl: string = 'https://api.aidataengineering.com'): OpenAPISpec {
  return {
    openapi: '3.1.0',
    info: {
      title: 'AI Data Engineering System API',
      description: `
# AI Data Engineering System API

Enterprise-grade data engineering platform with AI-powered automation.

## Features
- **Multi-Source Connectivity**: Connect to 30+ data sources
- **AI-Powered Discovery**: Automatic schema discovery and profiling
- **Intelligent Pipelines**: Generate optimized ETL/ELT pipelines
- **Multi-Framework Support**: dbt, Airflow, Dagster, Spark
- **Data Quality**: Automated testing and validation
- **Visual Builder**: No-code pipeline design

## Authentication
This API uses API Keys for authentication. Include your API key in the \`X-API-Key\` header.

## Rate Limits
- **Starter**: 100 requests/minute
- **Professional**: 1,000 requests/minute
- **Enterprise**: 10,000 requests/minute
- **Agency**: 5,000 requests/minute
      `,
      version: '2.0.0',
      contact: {
        name: 'AI Data Engineering Support',
        email: 'support@aidataengineering.com',
        url: 'https://aidataengineering.com/support',
      },
      license: {
        name: 'Proprietary',
        url: 'https://aidataengineering.com/terms',
      },
      termsOfService: 'https://aidataengineering.com/terms',
    },
    servers: [
      { url: baseUrl, description: 'Production Server' },
      { url: 'https://staging-api.aidataengineering.com', description: 'Staging Server' },
      { url: 'http://localhost:3000/api', description: 'Development Server' },
    ],
    security: [{ ApiKeyAuth: [] }],
    tags: [
      { name: 'Authentication', description: 'User authentication and session management' },
      { name: 'Projects', description: 'Project management operations' },
      { name: 'Data Sources', description: 'Data source connectivity and discovery' },
      { name: 'Pipelines', description: 'Pipeline generation and management' },
      { name: 'Agents', description: 'AI agent execution and monitoring' },
      { name: 'Quality', description: 'Data quality testing and validation' },
      { name: 'Export', description: 'Export and deliverable generation' },
      { name: 'Billing', description: 'Subscription and billing management' },
      { name: 'API Keys', description: 'API key management' },
      { name: 'Organizations', description: 'Organization and team management' },
    ],
    paths: generatePaths(),
    components: generateComponents(),
  }
}

function generatePaths(): Record<string, PathItem> {
  return {
    '/auth/login': {
      post: {
        summary: 'Authenticate user',
        description: 'Login with email and password to obtain a session token',
        operationId: 'login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: { email: 'user@example.com', password: 'securePassword123' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful authentication',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
        security: [],
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new user',
        operationId: 'register',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '400': { description: 'Invalid request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
        security: [],
      },
    },
    '/projects': {
      get: {
        summary: 'List all projects',
        description: 'Retrieve a paginated list of projects',
        operationId: 'listProjects',
        tags: ['Projects'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 }, description: 'Items per page' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'discovery', 'architecture', 'development', 'deployed', 'completed'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'List of projects', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectList' } } } },
        },
      },
      post: {
        summary: 'Create a new project',
        operationId: 'createProject',
        tags: ['Projects'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProjectRequest' } } },
        },
        responses: {
          '201': { description: 'Project created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          '400': { description: 'Invalid request' },
          '403': { description: 'Project limit reached' },
        },
      },
    },
    '/projects/{id}': {
      get: {
        summary: 'Get project by ID',
        operationId: 'getProject',
        tags: ['Projects'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Project details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          '404': { description: 'Project not found' },
        },
      },
      put: {
        summary: 'Update project',
        operationId: 'updateProject',
        tags: ['Projects'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProjectRequest' } } },
        },
        responses: {
          '200': { description: 'Project updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          '404': { description: 'Project not found' },
        },
      },
      delete: {
        summary: 'Delete project',
        operationId: 'deleteProject',
        tags: ['Projects'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Project deleted' }, '404': { description: 'Project not found' } },
      },
    },
    '/data-sources': {
      get: {
        summary: 'List data sources',
        operationId: 'listDataSources',
        tags: ['Data Sources'],
        parameters: [
          { name: 'projectId', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'List of data sources', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/DataSource' } } } } },
        },
      },
      post: {
        summary: 'Add a new data source',
        operationId: 'createDataSource',
        tags: ['Data Sources'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDataSourceRequest' } } },
        },
        responses: {
          '201': { description: 'Data source created', content: { 'application/json': { schema: { $ref: '#/components/schemas/DataSource' } } } },
          '400': { description: 'Invalid connection parameters' },
        },
      },
    },
    '/data-sources/{id}/discover': {
      post: {
        summary: 'Discover data source schema',
        operationId: 'discoverDataSource',
        tags: ['Data Sources'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Discovery results', content: { 'application/json': { schema: { $ref: '#/components/schemas/DiscoveryResult' } } } },
        },
      },
    },
    '/pipelines': {
      get: {
        summary: 'List pipelines',
        operationId: 'listPipelines',
        tags: ['Pipelines'],
        parameters: [{ name: 'projectId', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'List of pipelines', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Pipeline' } } } } },
        },
      },
      post: {
        summary: 'Generate a new pipeline',
        operationId: 'generatePipeline',
        tags: ['Pipelines'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/GeneratePipelineRequest' } } },
        },
        responses: {
          '201': { description: 'Pipeline generated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pipeline' } } } },
        },
      },
    },
    '/agents/execute': {
      post: {
        summary: 'Execute AI agent',
        operationId: 'executeAgent',
        tags: ['Agents'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AgentExecutionRequest' } } },
        },
        responses: {
          '200': { description: 'Agent execution started', content: { 'application/json': { schema: { $ref: '#/components/schemas/AgentExecution' } } } },
          '429': { description: 'Rate limit exceeded' },
        },
      },
    },
    '/quality/tests': {
      get: {
        summary: 'List quality tests',
        operationId: 'listQualityTests',
        tags: ['Quality'],
        parameters: [{ name: 'projectId', in: 'query', schema: { type: 'string' } }],
        responses: {
          '200': { description: 'List of quality tests', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/QualityTest' } } } } },
        },
      },
      post: {
        summary: 'Create quality test',
        operationId: 'createQualityTest',
        tags: ['Quality'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateQualityTestRequest' } } },
        },
        responses: {
          '201': { description: 'Quality test created', content: { 'application/json': { schema: { $ref: '#/components/schemas/QualityTest' } } } },
        },
      },
    },
    '/export': {
      post: {
        summary: 'Export project deliverables',
        operationId: 'exportProject',
        tags: ['Export'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ExportRequest' } } },
        },
        responses: {
          '200': { description: 'Export created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ExportResult' } } } },
        },
      },
    },
    '/api-keys': {
      get: {
        summary: 'List API keys',
        operationId: 'listApiKeys',
        tags: ['API Keys'],
        responses: {
          '200': { description: 'List of API keys', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ApiKey' } } } } },
        },
      },
      post: {
        summary: 'Create new API key',
        operationId: 'createApiKey',
        tags: ['API Keys'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateApiKeyRequest' } } },
        },
        responses: {
          '201': { description: 'API key created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiKeyWithSecret' } } } },
          '403': { description: 'API key limit reached' },
        },
      },
    },
    '/billing/subscription': {
      get: {
        summary: 'Get subscription details',
        operationId: 'getSubscription',
        tags: ['Billing'],
        responses: {
          '200': { description: 'Subscription details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Subscription' } } } },
        },
      },
    },
    '/billing/checkout': {
      post: {
        summary: 'Create checkout session',
        operationId: 'createCheckout',
        tags: ['Billing'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  plan: { type: 'string', enum: ['starter', 'professional', 'enterprise', 'agency'] },
                  seats: { type: 'integer', minimum: 1 },
                },
                required: ['plan'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Checkout session created', content: { 'application/json': { schema: { type: 'object', properties: { checkoutUrl: { type: 'string' }, sessionId: { type: 'string' } } } } } },
        },
      },
    },
    '/public/v1/query': {
      post: {
        summary: 'Execute data query',
        operationId: 'publicQuery',
        tags: ['Public API'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/QueryRequest' } } },
        },
        responses: {
          '200': { description: 'Query results', content: { 'application/json': { schema: { $ref: '#/components/schemas/QueryResult' } } } },
          '400': { description: 'Invalid query' },
          '429': { description: 'Rate limit exceeded' },
        },
      },
    },
  }
}

function generateComponents(): Components {
  return {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key authentication',
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token authentication',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'manager', 'analyst', 'viewer'] },
          organizationId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email', 'role'],
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
        required: ['email', 'password'],
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
          organizationName: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'discovery', 'architecture', 'development', 'deployed', 'completed'] },
          package: { type: 'string', enum: ['starter', 'professional', 'enterprise'] },
          budget: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'status'],
      },
      ProjectList: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      CreateProjectRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          industry: { type: 'string', enum: ['retail', 'finance', 'healthcare', 'saas', 'manufacturing', 'logistics'] },
          budget: { type: 'number', minimum: 0 },
        },
        required: ['name'],
      },
      UpdateProjectRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'discovery', 'architecture', 'development', 'deployed', 'completed'] },
          budget: { type: 'number' },
        },
      },
      DataSource: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['postgresql', 'mysql', 'mongodb', 'snowflake', 'bigquery', 'redshift', 'api', 'file'] },
          host: { type: 'string' },
          port: { type: 'integer' },
          database: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'connected', 'error'] },
          lastSync: { type: 'string', format: 'date-time' },
          tableCount: { type: 'integer' },
        },
        required: ['id', 'name', 'type', 'status'],
      },
      CreateDataSourceRequest: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          host: { type: 'string' },
          port: { type: 'integer' },
          database: { type: 'string' },
          username: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['projectId', 'name', 'type'],
      },
      DiscoveryResult: {
        type: 'object',
        properties: {
          dataSourceId: { type: 'string' },
          tables: { type: 'array', items: { type: 'object' } },
          relationships: { type: 'array', items: { type: 'object' } },
        },
      },
      Pipeline: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['etl', 'elt', 'streaming'] },
          framework: { type: 'string', enum: ['airflow', 'dbt', 'dagster', 'spark'] },
          status: { type: 'string', enum: ['generated', 'deployed', 'running', 'error'] },
          code: { type: 'string' },
          schedule: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'type', 'framework', 'status'],
      },
      GeneratePipelineRequest: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['etl', 'elt', 'streaming'] },
          framework: { type: 'string', enum: ['airflow', 'dbt', 'dagster', 'spark'] },
          sourceTables: { type: 'array', items: { type: 'string' } },
          schedule: { type: 'string' },
        },
        required: ['projectId', 'name', 'type', 'framework'],
      },
      AgentExecutionRequest: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          agentType: { type: 'string', enum: ['discovery', 'architecture', 'pipeline', 'transformation', 'bi', 'quality'] },
          input: { type: 'object' },
        },
        required: ['projectId', 'agentType'],
      },
      AgentExecution: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          agentType: { type: 'string' },
          status: { type: 'string', enum: ['running', 'completed', 'failed'] },
          input: { type: 'object' },
          output: { type: 'object' },
          error: { type: 'string' },
          duration: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'agentType', 'status'],
      },
      QualityTest: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['not_null', 'unique', 'range', 'regex', 'custom_sql'] },
          tableName: { type: 'string' },
          columnName: { type: 'string' },
          config: { type: 'object' },
          enabled: { type: 'boolean' },
        },
        required: ['id', 'name', 'type', 'tableName'],
      },
      CreateQualityTestRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          tableName: { type: 'string' },
          columnName: { type: 'string' },
          config: { type: 'object' },
        },
        required: ['name', 'type', 'tableName'],
      },
      ExportRequest: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          format: { type: 'string', enum: ['zip', 'pdf', 'markdown'] },
          includeCode: { type: 'boolean', default: true },
          includeDocs: { type: 'boolean', default: true },
        },
        required: ['projectId', 'format'],
      },
      ExportResult: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          format: { type: 'string' },
          downloadUrl: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
          fileSize: { type: 'integer' },
        },
      },
      ApiKey: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          key: { type: 'string' },
          permissions: { type: 'array', items: { type: 'string' } },
          lastUsed: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ApiKeyWithSecret: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          key: { type: 'string' },
          permissions: { type: 'array', items: { type: 'string' } },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateApiKeyRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          permissions: { type: 'array', items: { type: 'string', enum: ['read', 'write', 'admin'] } },
          expiresAt: { type: 'string', format: 'date-time' },
        },
        required: ['name'],
      },
      Subscription: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          plan: { type: 'string', enum: ['starter', 'professional', 'enterprise', 'agency'] },
          status: { type: 'string', enum: ['active', 'past_due', 'canceled', 'trialing'] },
          seats: { type: 'integer' },
          currentPeriodStart: { type: 'string', format: 'date-time' },
          currentPeriodEnd: { type: 'string', format: 'date-time' },
        },
      },
      QueryRequest: {
        type: 'object',
        properties: {
          dataSourceId: { type: 'string' },
          sql: { type: 'string' },
          limit: { type: 'integer', maximum: 10000, default: 1000 },
        },
        required: ['dataSourceId', 'sql'],
      },
      QueryResult: {
        type: 'object',
        properties: {
          columns: { type: 'array', items: { type: 'object' } },
          rows: { type: 'array', items: { type: 'object' } },
          rowCount: { type: 'integer' },
          executionTime: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object' },
          statusCode: { type: 'integer' },
        },
        required: ['error', 'message'],
      },
    },
  }
}

export function getOpenAPIJson(baseUrl?: string): string {
  return JSON.stringify(generateOpenAPISpec(baseUrl), null, 2)
}
