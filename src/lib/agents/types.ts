// AI Data Engineering System - Types

// Agent types
export type AgentType =
  | 'business'
  | 'sales'
  | 'discovery'
  | 'architecture'
  | 'pipeline'
  | 'transformation'
  | 'bi'
  | 'conversational'
  | 'pricing'
  | 'productization';

// Execution status
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

// Project status
export type ProjectStatus =
  | 'draft'
  | 'discovery'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'deployed'
  | 'completed';

// Data source types
export type DataSourceType =
  | 'postgresql'
  | 'mysql'
  | 'mongodb'
  | 'bigquery'
  | 'snowflake'
  | 'redshift'
  | 's3'
  | 'api'
  | 'kafka'
  | 'salesforce'
  | 'hubspot'
  | 'stripe';

// Warehouse types
export type WarehouseType =
  | 'bigquery'
  | 'snowflake'
  | 'redshift'
  | 'databricks'
  | 'postgres'
  | 'duckdb';

// Agent configuration
export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  systemPrompt: string;
  tools?: AgentTool[];
  capabilities?: string[];
}

// Agent context
export interface AgentContext {
  projectId: string;
  userId?: string;
  conversationHistory: ConversationMessage[];
  projectData: ProjectData;
  metadata: Record<string, unknown>;
}

// Agent result
export interface AgentResult {
  success: boolean;
  output: Record<string, unknown>;
  artifacts?: GeneratedArtifact[];
  recommendations?: string[];
  nextSteps?: string[];
  error?: string;
}

// Generated artifact
export interface GeneratedArtifact {
  type: 'code' | 'document' | 'config' | 'diagram' | 'sql';
  name: string;
  content: string;
  language?: string;
  path?: string;
}

// Conversation message
export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// Agent tool
export interface AgentTool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (params: Record<string, unknown>, context: AgentContext) => Promise<unknown>;
}

// JSON Schema
export interface JSONSchema {
  type: string;
  properties?: Record<string, { type: string; description?: string; enum?: string[] }>;
  required?: string[];
}

// Project data
export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  industry?: string;
  organization?: {
    id: string;
    name: string;
    industry?: string;
  };
  dataSources?: DataSourceConfig[];
  schemas?: DatabaseSchema[];
  dataQuality?: DataQualityReport;
  architecture?: ArchitectureDecision;
  pipelines?: PipelineConfig[];
  transformations?: TransformationConfig[];
  dashboards?: DashboardConfig[];
  businessGoals?: string[];
  kpis?: KPI[];
  budget?: ProjectBudget;
}

// Data source configuration
export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  credentials?: {
    type: 'none' | 'basic' | 'oauth' | 'apikey';
    username?: string;
    password?: string;
    token?: string;
  };
  metadata?: {
    tableCount?: number;
    rowCount?: number;
    lastSync?: Date;
  };
}

// Database schema
export interface DatabaseSchema {
  sourceId: string;
  database: string;
  schema: string;
  tables: TableSchema[];
}

// Table schema
export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primaryKey?: string[];
  foreignKeys?: ForeignKey[];
  indexes?: IndexInfo[];
  rowCount?: number;
}

// Column schema
export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  description?: string;
}

// Foreign key
export interface ForeignKey {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
}

// Index info
export interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
}

// Data quality report
export interface DataQualityReport {
  overallScore: number;
  issues: DataQualityIssue[];
  recommendations: string[];
}

// Data quality issue
export interface DataQualityIssue {
  table: string;
  column?: string;
  type: 'missing_values' | 'duplicates' | 'inconsistency' | 'type_mismatch' | 'outdated';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedRows?: number;
}

// Architecture decision
export interface ArchitectureDecision {
  warehouseType: WarehouseType;
  orchestrationTool: 'airflow' | 'dagster' | 'prefect' | 'dbt_cloud';
  transformationFramework: 'dbt' | 'spark' | 'pandas';
  biTool?: 'looker' | 'tableau' | 'powerbi' | 'metabase' | 'superset';
  architecturePattern: 'data_vault' | 'star_schema' | 'data_mesh' | 'lakehouse';
  deploymentTarget: 'gcp' | 'aws' | 'azure' | 'snowflake' | 'databricks';
  diagrams?: ArchitectureDiagram[];
  rationale?: string;
  estimatedCost?: CostEstimate;
}

// Architecture diagram
export interface ArchitectureDiagram {
  name: string;
  type: 'flow' | 'architecture' | 'er_diagram';
  format: 'mermaid' | 'drawio' | 'plantuml';
  content: string;
}

// Cost estimate
export interface CostEstimate {
  monthly: number;
  breakdown: {
    compute: number;
    storage: number;
    networking: number;
    licensing: number;
  };
  currency: string;
}

// Pipeline configuration
export interface PipelineConfig {
  id: string;
  name: string;
  type: 'extract' | 'transform' | 'load' | 'full_etl';
  source?: string;
  target?: string;
  schedule?: string;
  code: string;
  language: 'python' | 'sql' | 'yaml';
  dependencies?: string[];
}

// Transformation config
export interface TransformationConfig {
  id: string;
  name: string;
  type: 'staging' | 'intermediate' | 'marts';
  sourceTables: string[];
  targetTable: string;
  sql: string;
  tests?: DataTest[];
  documentation?: string;
}

// Data test
export interface DataTest {
  name: string;
  type: 'not_null' | 'unique' | 'accepted_values' | 'relationship' | 'custom';
  config: Record<string, unknown>;
}

// Dashboard config
export interface DashboardConfig {
  id: string;
  name: string;
  tool: string;
  url?: string;
  charts: ChartConfig[];
  filters?: DashboardFilter[];
}

// Chart config
export interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'table' | 'kpi' | 'scatter' | 'heatmap';
  dataSource: string;
  query?: string;
  config: Record<string, unknown>;
}

// Dashboard filter
export interface DashboardFilter {
  name: string;
  type: 'date' | 'dropdown' | 'multiselect' | 'text';
  defaultValue?: string | string[];
  options?: string[];
}

// KPI
export interface KPI {
  id: string;
  name: string;
  description: string;
  formula: string;
  target?: number;
  unit?: string;
  dataSource?: string;
}

// Project budget
export interface ProjectBudget {
  min: number;
  max: number;
  currency: string;
  timeline: number;
}
