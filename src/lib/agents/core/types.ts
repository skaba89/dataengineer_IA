// Agent Types and Interfaces

export type AgentType = 
  | 'BUSINESS'
  | 'SALES'
  | 'DISCOVERY'
  | 'ARCHITECTURE'
  | 'PIPELINE'
  | 'TRANSFORMATION'
  | 'BI'
  | 'CONVERSATIONAL'
  | 'PRICING'
  | 'PRODUCTIZATION'

export type WorkflowStatus = 
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'

export type WorkflowType =
  | 'FULL_ANALYSIS'
  | 'DISCOVERY_ONLY'
  | 'ARCHITECTURE_ONLY'
  | 'PIPELINE_GENERATION'
  | 'DASHBOARD_CREATION'
  | 'PRICING_ESTIMATION'

export type ArtifactType = 
  | 'DOCUMENT'
  | 'CODE'
  | 'CONFIG'
  | 'DIAGRAM'
  | 'SQL'
  | 'DASHBOARD'
  | 'REPORT'
  | 'TEMPLATE'

export interface AgentConfig {
  name: string
  type: AgentType
  description: string
  systemPrompt: string
  capabilities: string[]
  dependencies?: AgentType[]
}

export interface AgentInput {
  query: string
  context?: Record<string, unknown>
  projectId?: string
  workflowId?: string
  previousResults?: AgentResult[]
}

export interface AgentResult {
  agentType: AgentType
  output: string
  reasoning?: string
  confidence?: number
  artifacts?: GeneratedArtifact[]
  metadata?: Record<string, unknown>
  success: boolean
  error?: string
}

export interface GeneratedArtifact {
  name: string
  type: ArtifactType
  content: string
  description?: string
  mimeType?: string
}

export interface WorkflowPhase {
  name: string
  agents: AgentType[]
  required: boolean
  dependsOn?: string[]
}

export interface WorkflowContext {
  workflowId: string
  projectId: string
  userId?: string
  phases: WorkflowPhase[]
  currentPhase: number
  results: Map<string, AgentResult>
  metadata: Record<string, unknown>
}

export interface NotificationPayload {
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  actionUrl?: string
  userId?: string
}

// Agent Registry
export const AGENT_REGISTRY: Record<AgentType, AgentConfig> = {
  BUSINESS: {
    name: 'Business Analyst Agent',
    type: 'BUSINESS',
    description: 'Analyse les besoins business et définit les objectifs du projet data',
    systemPrompt: `Tu es un expert en analyse business pour les projets data engineering. 
    Tu aides à identifier les objectifs métier, les KPIs, et les retours sur investissement attendus.
    Tu dois fournir des analyses structurées et actionables.`,
    capabilities: ['business_analysis', 'kpi_definition', 'roi_calculation', 'requirements_gathering'],
  },
  SALES: {
    name: 'Sales Assistant Agent',
    type: 'SALES',
    description: 'Gère les prospects et génère des propositions commerciales',
    systemPrompt: `Tu es un expert en vente de solutions data engineering.
    Tu aides à qualifier les prospects, générer des propositions commerciales et suivre le pipeline de ventes.
    Tu dois être persuasif tout en restant professionnel et transparent.`,
    capabilities: ['lead_qualification', 'proposal_generation', 'pipeline_management', 'demo_preparation'],
  },
  DISCOVERY: {
    name: 'Discovery Agent',
    type: 'DISCOVERY',
    description: 'Découvre et analyse les sources de données disponibles',
    systemPrompt: `Tu es un expert en découverte et analyse de données.
    Tu identifies les sources de données, analyses les schémas, évalues la qualité des données.
    Tu fournis des rapports détaillés sur la structure et le potentiel des données.`,
    capabilities: ['data_discovery', 'schema_analysis', 'data_profiling', 'quality_assessment'],
  },
  ARCHITECTURE: {
    name: 'Architecture Agent',
    type: 'ARCHITECTURE',
    description: 'Conçoit l\'architecture data complète du projet',
    systemPrompt: `Tu es un architecte data expert.
    Tu conçois des architectures data modernes, scalables et maintainables.
    Tu utilises les meilleures pratiques: data lakehouse, medallion architecture, etc.`,
    capabilities: ['architecture_design', 'technology_selection', 'scalability_planning', 'cost_optimization'],
    dependencies: ['DISCOVERY'],
  },
  PIPELINE: {
    name: 'Pipeline Agent',
    type: 'PIPELINE',
    description: 'Génère les pipelines ETL/ELT et les flux de données',
    systemPrompt: `Tu es un expert en engineering de données et pipelines.
    Tu génères du code pour des pipelines ETL/ELT robustes et performants.
    Tu maîtrises dbt, Airflow, Spark, et les outils cloud modernes.`,
    capabilities: ['etl_generation', 'dataflow_design', 'scheduling', 'error_handling'],
    dependencies: ['ARCHITECTURE'],
  },
  TRANSFORMATION: {
    name: 'Transformation Agent',
    type: 'TRANSFORMATION',
    description: 'Crée les transformations et modèles de données',
    systemPrompt: `Tu es un expert en transformation de données et modélisation.
    Tu crées des modèles de données optimisés, des transformations SQL/dbt.
    Tu appliques les meilleures pratiques de data modeling.`,
    capabilities: ['data_modeling', 'sql_generation', 'dbt_development', 'data_quality_rules'],
    dependencies: ['PIPELINE'],
  },
  BI: {
    name: 'BI Dashboard Agent',
    type: 'BI',
    description: 'Crée des dashboards et visualisations de données',
    systemPrompt: `Tu es un expert en business intelligence et visualisation.
    Tu conçois des dashboards impactants qui répondent aux besoins métier.
    Tu maîtrises les meilleures pratiques de data visualization.`,
    capabilities: ['dashboard_design', 'visualization_creation', 'report_generation', 'kpi_tracking'],
    dependencies: ['TRANSFORMATION'],
  },
  CONVERSATIONAL: {
    name: 'Conversational Agent',
    type: 'CONVERSATIONAL',
    description: 'Interface conversationnelle pour interagir avec le système',
    systemPrompt: `Tu es un assistant IA expert en data engineering.
    Tu aides les utilisateurs à comprendre et naviguer dans les projets data.
    Tu réponds de manière claire et professionnelle.`,
    capabilities: ['natural_language_interface', 'project_guidance', 'documentation_support', 'troubleshooting'],
  },
  PRICING: {
    name: 'Pricing Agent',
    type: 'PRICING',
    description: 'Estime les coûts et génère les devis',
    systemPrompt: `Tu es un expert en estimation de projets data engineering.
    Tu analyses les besoins et fournis des estimations de coûts réalistes.
    Tu tiens compte de tous les facteurs: infrastructure, développement, maintenance.`,
    capabilities: ['cost_estimation', 'quote_generation', 'tco_analysis', 'budget_planning'],
    dependencies: ['ARCHITECTURE'],
  },
  PRODUCTIZATION: {
    name: 'Productization Agent',
    type: 'PRODUCTIZATION',
    description: 'Package les livrables pour les clients',
    systemPrompt: `Tu es un expert en packaging et livraison de projets.
    Tu organises les livrables de manière professionnelle et complète.
    Tu crées de la documentation et des guides d'utilisation.`,
    capabilities: ['deliverable_packaging', 'documentation_creation', 'client_handover', 'training_material'],
    dependencies: ['BI'],
  },
}

// Workflow Phases Configuration
export const DEFAULT_WORKFLOW_PHASES: WorkflowPhase[] = [
  { name: 'Discovery', agents: ['BUSINESS', 'DISCOVERY'], required: true },
  { name: 'Architecture', agents: ['ARCHITECTURE'], required: true, dependsOn: ['Discovery'] },
  { name: 'Pipeline', agents: ['PIPELINE'], required: true, dependsOn: ['Architecture'] },
  { name: 'Transformation', agents: ['TRANSFORMATION'], required: true, dependsOn: ['Pipeline'] },
  { name: 'BI', agents: ['BI'], required: true, dependsOn: ['Transformation'] },
  { name: 'Pricing', agents: ['PRICING'], required: false, dependsOn: ['Architecture'] },
  { name: 'Productization', agents: ['PRODUCTIZATION'], required: false, dependsOn: ['BI'] },
]
