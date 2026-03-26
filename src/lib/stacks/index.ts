// @ts-nocheck
// Data Stack Configurations for AI Data Engineering System
// Supports: dbt, Airflow, Dagster, Spark, Kafka, Fivetran, Airbyte, Prefect, Great Expectations

// ============================================
// Types & Interfaces
// ============================================

export type StackType =
  | "dbt"
  | "dbt_cloud"
  | "airflow"
  | "dagster"
  | "prefect"
  | "spark"
  | "kafka"
  | "fivetran"
  | "airbyte"
  | "great_expectations"
  | "soda"
  | "monte_carlo"
  | "looker"
  | "tableau"
  | "powerbi"
  | "metabase"
  | "superset"
  | "grafana"

export type WarehouseType =
  | "bigquery"
  | "snowflake"
  | "redshift"
  | "databricks"
  | "postgres"
  | "duckdb"
  | "synapse"
  | "firebolt"

export type CloudProvider = "gcp" | "aws" | "azure" | "multi"

export interface StackConfig {
  type: StackType
  version?: string
  enabled: boolean
  config: Record<string, unknown>
}

export interface DataStack {
  name: string
  description: string
  warehouse: WarehouseType
  cloudProvider: CloudProvider
  orchestration: StackConfig
  transformation: StackConfig
  ingestion: StackConfig
  quality: StackConfig
  bi: StackConfig
  monitoring: StackConfig
  estimatedMonthlyCost: number
  setupComplexity: "low" | "medium" | "high"
  maintenanceLevel: "low" | "medium" | "high"
}

// ============================================
// dbt Configurations
// ============================================

export interface DbtConfig {
  project_name: string
  version: "1.5" | "1.6" | "1.7" | "1.8"
  adapter: WarehouseType
  profiles_dir?: string
  target?: string
  threads?: number
  models?: {
    materialized?: "table" | "view" | "incremental" | "ephemeral"
    schema?: string
    [key: string]: unknown
  }
  seeds?: {
    schema?: string
    [key: string]: unknown
  }
  snapshots?: {
    target_schema?: string
    strategy?: "timestamp" | "check"
    [key: string]: unknown
  }
  tests?: {
    schema?: string
    [key: string]: unknown
  }
  packages?: DbtPackage[]
  environment_vars?: Record<string, string>
}

export interface DbtPackage {
  package: string
  version?: string
  git?: string
  rev?: string
}

export const DBT_ADAPTERS: Record<WarehouseType, string> = {
  bigquery: "dbt-bigquery",
  snowflake: "dbt-snowflake",
  redshift: "dbt-redshift",
  databricks: "dbt-databricks",
  postgres: "dbt-postgres",
  duckdb: "dbt-duckdb",
  synapse: "dbt-synapse",
  firebolt: "dbt-firebolt",
}

export function generateDbtProject(config: DbtConfig): { "dbt_project.yml": string; "profiles.yml": string; "packages.yml": string } {
  const dbtProjectYml = `
name: '${config.project_name}'
version: '1.0.0'
config-version: 2

profile: '${config.project_name}'

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]

clean-targets:
  - "target"
  - "dbt_packages"

vars:
  ${Object.entries(config.environment_vars || {}).map(([k, v]) => `${k}: "${v}"`).join("\n  ")}

models:
  ${config.project_name}:
    ${Object.entries(config.models || {}).map(([k, v]) => `${k}: ${typeof v === "string" ? `"${v}"` : v}`).join("\n    ")}
`.trim()

  const profilesYml = generateDbtProfiles(config)

  const packagesYml = `
packages:
${(config.packages || []).map((p) => `  - package: ${p.package}${p.version ? `\n    version: "${p.version}"` : ""}`).join("\n")}
`.trim()

  return {
    "dbt_project.yml": dbtProjectYml,
    "profiles.yml": profilesYml,
    "packages.yml": packagesYml,
  }
}

function generateDbtProfiles(config: DbtConfig): string {
  const profiles: Record<WarehouseType, string> = {
    bigquery: `
${config.project_name}:
  target: ${config.target || "dev"}
  outputs:
    dev:
      type: bigquery
      project: "{{ env_var('GCP_PROJECT') }}"
      dataset: "{{ env_var('DBT_DATASET', 'dbt_dev') }}"
      threads: ${config.threads || 4}
      location: "{{ env_var('GCP_LOCATION', 'US') }}"
      method: oauth
`.trim(),
    snowflake: `
${config.project_name}:
  target: ${config.target || "dev"}
  outputs:
    dev:
      type: snowflake
      account: "{{ env_var('SNOWFLAKE_ACCOUNT') }}"
      user: "{{ env_var('SNOWFLAKE_USER') }}"
      password: "{{ env_var('SNOWFLAKE_PASSWORD') }}"
      role: "{{ env_var('SNOWFLAKE_ROLE', 'TRANSFORMER') }}"
      database: "{{ env_var('SNOWFLAKE_DATABASE') }}"
      warehouse: "{{ env_var('SNOWFLAKE_WAREHOUSE') }}"
      schema: "{{ env_var('DBT_SCHEMA', 'dbt_dev') }}"
      threads: ${config.threads || 4}
`.trim(),
    redshift: `
${config.project_name}:
  target: ${config.target || "dev"}
  outputs:
    dev:
      type: redshift
      host: "{{ env_var('REDSHIFT_HOST') }}"
      user: "{{ env_var('REDSHIFT_USER') }}"
      password: "{{ env_var('REDSHIFT_PASSWORD') }}"
      port: 5439
      dbname: "{{ env_var('REDSHIFT_DATABASE') }}"
      schema: "{{ env_var('DBT_SCHEMA', 'dbt_dev') }}"
      threads: ${config.threads || 4}
`.trim(),
    databricks: `
${config.project_name}:
  target: ${config.target || "dev"}
  outputs:
    dev:
      type: databricks
      catalog: "{{ env_var('DATABRICKS_CATALOG') }}"
      schema: "{{ env_var('DBT_SCHEMA', 'dbt_dev') }}"
      host: "{{ env_var('DATABRICKS_HOST') }}"
      http_path: "{{ env_var('DATABRICKS_HTTP_PATH') }}"
      token: "{{ env_var('DATABRICKS_TOKEN') }}"
      threads: ${config.threads || 4}
`.trim(),
    postgres: `
${config.project_name}:
  target: ${config.target || "dev"}
  outputs:
    dev:
      type: postgres
      host: "{{ env_var('PG_HOST') }}"
      user: "{{ env_var('PG_USER') }}"
      password: "{{ env_var('PG_PASSWORD') }}"
      port: 5432
      dbname: "{{ env_var('PG_DATABASE') }}"
      schema: "{{ env_var('DBT_SCHEMA', 'dbt_dev') }}"
      threads: ${config.threads || 4}
`.trim(),
    duckdb: `
${config.project_name}:
  target: ${config.target || "dev"}
  outputs:
    dev:
      type: duckdb
      path: "{{ env_var('DUCKDB_PATH', 'dev.duckdb') }}"
      schema: "{{ env_var('DBT_SCHEMA', 'main') }}"
      threads: ${config.threads || 4}
`.trim(),
    synapse: `
${config.project_name}:
  target: ${config.target || "dev"}
  outputs:
    dev:
      type: synapse
      driver: "ODBC Driver 18 for SQL Server"
      server: "{{ env_var('SYNAPSE_SERVER') }}"
      port: 1433
      database: "{{ env_var('SYNAPSE_DATABASE') }}"
      schema: "{{ env_var('DBT_SCHEMA', 'dbo') }}"
      user: "{{ env_var('SYNAPSE_USER') }}"
      password: "{{ env_var('SYNAPSE_PASSWORD') }}"
      threads: ${config.threads || 4}
`.trim(),
    firebolt: `
${config.project_name}:
  target: ${config.target || "dev"}
  outputs:
    dev:
      type: firebolt
      api_endpoint: "api.app.firebolt.io"
      engine_name: "{{ env_var('FIREBOLT_ENGINE') }}"
      database: "{{ env_var('FIREBOLT_DATABASE') }}"
      schema: "{{ env_var('DBT_SCHEMA', 'public') }}"
      threads: ${config.threads || 4}
`.trim(),
  }

  return profiles[config.adapter] || profiles.postgres
}

// ============================================
// Airflow Configurations
// ============================================

export interface AirflowConfig {
  version: "2.7" | "2.8" | "2.9"
  executor: "LocalExecutor" | "CeleryExecutor" | "KubernetesExecutor"
  dagBagImportTimeout?: number
  parallelism?: number
  dagConcurrentRuns?: number
  defaultArgs: {
    owner: string
    depends_on_past?: boolean
    email?: string[]
    emailOnFailure?: boolean
    emailOnRetry?: boolean
    retries?: number
    retryDelay?: string
    executionTimeout?: string
  }
  connections: AirflowConnection[]
  variables?: Record<string, string>
  pools?: { name: string; slots: number; description?: string }[]
}

export interface AirflowConnection {
  connId: string
  connType: string
  host?: string
  schema?: string
  login?: string
  password?: string
  port?: number
  extra?: Record<string, unknown>
}

export function generateAirflowDag(
  dagId: string,
  schedule: string,
  tasks: { taskId: string; operator: string; config: Record<string, unknown>; dependencies?: string[] }[],
  config: Partial<AirflowConfig>
): string {
  const taskDefinitions = tasks
    .map(
      (task) => `
${task.taskId} = ${task.operator}(
    task_id='${task.taskId}',
    ${Object.entries(task.config)
      .map(([k, v]) => `${k}=${typeof v === "string" ? `"${v}"` : JSON.stringify(v)}`)
      .join(",\n    ")}
)`
    )
    .join("\n\n")

  const dependencies = tasks
    .filter((t) => t.dependencies?.length)
    .map((t) => t.dependencies!.map((d) => `${d} >> ${t.taskId}`).join("\n"))
    .join("\n")

  return `
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.providers.dbt.operators.dbt import DbtRunOperator, DbtTestOperator

default_args = {
    'owner': '${config.defaultArgs?.owner || "airflow"}',
    'depends_on_past': ${config.defaultArgs?.depends_on_past || false},
    'email': ${JSON.stringify(config.defaultArgs?.email || [])},
    'email_on_failure': ${config.defaultArgs?.emailOnFailure ?? true},
    'email_on_retry': ${config.defaultArgs?.emailOnRetry ?? false},
    'retries': ${config.defaultArgs?.retries || 1},
    'retry_delay': timedelta(${config.defaultArgs?.retryDelay || "minutes=5"}),
}

with DAG(
    '${dagId}',
    default_args=default_args,
    description='Generated DAG for ${dagId}',
    schedule_interval='${schedule}',
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['generated', 'data-pipeline'],
) as dag:

${taskDefinitions}

${dependencies}
`.trim()
}

// ============================================
// Dagster Configurations
// ============================================

export interface DagsterConfig {
  version: "1.5" | "1.6" | "1.7"
  deployment: "oss" | "cloud"
  project_name: string
  resources: Record<string, { type: string; config: Record<string, unknown> }>
  schedules?: { name: string; cron: string; job: string }[]
  sensors?: { name: string; job: string; condition: string }[]
}

export function generateDagsterAsset(
  name: string,
  deps: string[],
  computeFn: string,
  config: Partial<DagsterConfig>
): string {
  return `
from dagster import asset, Output, MetadataValue
import pandas as pd

@asset(
    deps=[${deps.map((d) => `"${d}"`).join(", ")}],
    compute_kind="pandas",
)
def ${name}(context${deps.length > 0 ? ", " + deps.join(", ") : ""}):
    """
    Auto-generated asset: ${name}
    Dependencies: ${deps.join(", ") || "None"}
    """
    ${computeFn}
    
    return Output(
        value=result,
        metadata={
            "num_rows": len(result),
            "columns": MetadataValue.md(result.columns.tolist()),
        }
    )
`.trim()
}

export function generateDagsterJob(
  name: string,
  assets: string[],
  config: DagsterConfig
): string {
  return `
from dagster import define_asset_job, ScheduleDefinition

${name}_job = define_asset_job(
    name="${name}_job",
    selection=[${assets.map((a) => `"${a}"`).join(", ")}],
)

${name}_schedule = ScheduleDefinition(
    job=${name}_job,
    cron_schedule="0 6 * * *",  # Daily at 6am
)
`.trim()
}

// ============================================
// Spark Configurations
// ============================================

export interface SparkConfig {
  version: "3.4" | "3.5"
  deployMode: "local" | "cluster"
  master?: string
  appName: string
  executor: {
    cores: number
    memory: string
    instances: number
  }
  driver: {
    cores: number
    memory: string
  }
  conf: Record<string, string>
  packages?: string[]
}

export function generateSparkSession(config: SparkConfig): string {
  return `
from pyspark.sql import SparkSession

spark = SparkSession.builder \\
    .appName("${config.appName}") \\
    .master("${config.master || "local[*]"}") \\
    .config("spark.executor.cores", "${config.executor.cores}") \\
    .config("spark.executor.memory", "${config.executor.memory}") \\
    .config("spark.driver.cores", "${config.driver.cores}") \\
    .config("spark.driver.memory", "${config.driver.memory}") \\
    ${Object.entries(config.conf)
      .map(([k, v]) => `.config("${k}", "${v}")`)
      .join(" \\n    ")}
    ${(config.packages || [])
      .map((p) => `.config("spark.jars.packages", "${p}")`)
      .join(" \\n    ")}
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")
`.trim()
}

// ============================================
// Fivetran Configurations
// ============================================

export interface FivetranConfig {
  apiKey: string
  apiSecret: string
  groupId?: string
  connectors: FivetranConnector[]
}

export interface FivetranConnector {
  service: string
  name: string
  config: Record<string, unknown>
  destinationSchema: string
  syncFrequency?: number // minutes
  paused?: boolean
}

export const FIVETRAN_CONNECTORS = [
  "adaptive_insights",
  "adobe_analytics",
  "amazon_kinesis",
  "amazon_s3",
  "amplitude",
  "asana",
  "azure_blob_storage",
  "chargebee",
  "chargeover",
  "clickup",
  "courier",
  "discord",
  "dokan",
  "dropbox",
  "dynamics_365",
  "facebook_ad_account",
  "facebook_pages",
  "freshdesk",
  "github",
  "google_ad_manager",
  "google_ads",
  "google_analytics",
  "google_bigquery",
  "google_cloud_storage",
  "google_play",
  "google_sheets",
  "google_search_console",
  "greenhouse",
  "harvest",
  "heap",
  "hubspot",
  "intercom",
  "jira",
  "keen",
  "klaviyo",
  "linkedin_company_pages",
  "linkedin_pages",
  "looker",
  "mailchimp",
  "marketo",
  "marketo_bulksync",
  "microsoft_teams",
  "mixpanel",
  "monday",
  "mongodb",
  "mysql",
  "netsuite",
  "netsuite2",
  "notion",
  "oracle",
  "oracle_service_cloud",
  "outreach",
  "pipedrive",
  "postgresql",
  "quickbooks",
  "recruiterbox",
  "recurly",
  "redis",
  "recharge",
  "redshift",
  "salesforce",
  "salesforce_marketing_cloud",
  "servicenow",
  "sftp",
  "shopify",
  "slack",
  "snapchat_ads",
  "snowflake",
  "splunk",
  "square",
  "stripe",
  "surveymonkey",
  "teamwork",
  "twilio",
  "twitter_organic",
  "urban_airship",
  "xero",
  "zendesk",
  "zuora",
]

export function generateFivetranConnectorConfig(connector: FivetranConnector): Record<string, unknown> {
  return {
    service: connector.service,
    group_id: "${FIVETRAN_GROUP_ID}",
    config: {
      ...connector.config,
      schema: connector.destinationSchema,
    },
    sync_frequency: connector.syncFrequency || 60,
    paused: connector.paused || false,
  }
}

// ============================================
// Airbyte Configurations
// ============================================

export interface AirbyteConfig {
  workspaceId?: string
  sources: AirbyteSource[]
  destinations: AirbyteDestination[]
  connections: { source: string; destination: string; syncMode: "full_refresh" | "incremental"; schedule: string }[]
}

export interface AirbyteSource {
  name: string
  sourceDefinitionId: string
  config: Record<string, unknown>
}

export interface AirbyteDestination {
  name: string
  destinationDefinitionId: string
  config: Record<string, unknown>
}

export const AIRBYTE_SOURCE_DEFINITIONS: Record<string, string> = {
  postgres: "decd338e-5647-4c0b-adf4-da0e75f5a750",
  mysql: "435bb9a5-7887-4809-aa58-28c27df0d7ad",
  bigquery: "bfd1ddf8-ae8a-4620-b1d7-55597d2ba08c",
  snowflake: "f7dd9e6c-5f90-4df3-a6d5-3a589d01f73f",
  mongodb: "7f5f1f3f-9c4b-4f8d-9e2e-3a1f8b5c7d9e",
  salesforce: "9f2f3f3f-9c4b-4f8d-9e2e-3a1f8b5c7d9e",
  hubspot: "3f2f3f3f-9c4b-4f8d-9e2e-3a1f8b5c7d9e",
  stripe: "5f2f3f3f-9c4b-4f8d-9e2e-3a1f8b5c7d9e",
  shopify: "6f2f3f3f-9c4b-4f8d-9e2e-3a1f8b5c7d9e",
  google_analytics: "7f2f3f3f-9c4b-4f8d-9e2e-3a1f8b5c7d9e",
}

export const AIRBYTE_DESTINATION_DEFINITIONS: Record<string, string> = {
  bigquery: "22f6c74f-569a-4990-a5a3-5cf7e7448f31",
  snowflake: "2890c94a-64d2-4a41-8de8-5a1f6c7e7c0d",
  postgres: "25c72211-51a7-4df3-8c91-52a3d7e7c0d",
  redshift: "25c72211-51a7-4df3-8c91-52a3d7e7c0e",
  databricks: "3890c94a-64d2-4a41-8de8-5a1f6c7e7c0d",
}

// ============================================
// Data Quality Configurations
// ============================================

export interface GreatExpectationsConfig {
  datasourceName: string
  datastoreBackend: "local" | "s3" | "gcs" | "azure"
  expectationsStore: string
  validationsStore: string
  checkpointStore: string
  dataConnectors: { name: string; type: "inferred" | "configured"; tableNames: string[] }[]
}

export function generateGreatExpectationsCheckpoint(
  name: string,
  datasource: string,
  table: string,
  expectations: string[]
): string {
  return `
from great_expectations.checkpoint import SimpleCheckpoint

checkpoint = SimpleCheckpoint(
    name="${name}",
    config_version=1.0,
    run_name_template="%Y%m%d-%H%M%S-${name}",
    validations=[
        {
            "batch_request": {
                "datasource_name": "${datasource}",
                "data_connector_name": "default",
                "data_asset_name": "${table}",
            },
            "expectation_suite_name": "${table}_expectations",
        }
    ],
)
`.trim()
}

export interface SodaConfig {
  warehouse: WarehouseType
  dataSourceConfig: Record<string, unknown>
  scans: { name: string; tables: string[]; checks: string[] }[]
}

export function generateSodaChecks(tableName: string, columns: { name: string; type: string }[]): string {
  const checks: string[] = [
    `checks for ${tableName}:`,
    `  - row_count > 0`,
  ]

  for (const col of columns) {
    checks.push(`  - missing_count(${col.name}) < 100`)
    if (col.type.includes("int") || col.type.includes("float") || col.type.includes("decimal")) {
      checks.push(`  - min(${col.name}) >= 0`)
    }
    if (col.type.includes("varchar") || col.type.includes("text")) {
      checks.push(`  - length(${col.name}) < 1000`)
    }
  }

  return checks.join("\n")
}

// ============================================
// BI Tool Configurations
// ============================================

export interface LookerConfig {
  host: string
  clientId: string
  clientSecret: string
  projectId: string
  connectionName: string
  explores: { name: string; view: string; sqlTableName: string }[]
}

export function generateLookmlModel(config: LookerConfig): string {
  const explores = config.explores
    .map(
      (e) => `
explore: ${e.name} {
  view_name: ${e.view}
  sql_table_name: ${e.sqlTableName} ;;
}
`
    )
    .join("\n")

  return `
connection: "${config.connectionName}" {
  label: "${config.projectId}"
}

include: "views/*.view.lkml"

model: ${config.projectId} {
  ${explores}
}
`.trim()
}

export interface MetabaseConfig {
  databaseId?: number
  databaseName: string
  connectionType: WarehouseType
  collections: { name: string; dashboards: { name: string; questions: { name: string; query: string }[] }[] }[]
}

export function generateMetabaseDashboard(dashboard: { name: string; questions: { name: string; query: string }[] }): string {
  return JSON.stringify(
    {
      name: dashboard.name,
      cards: dashboard.questions.map((q) => ({
        name: q.name,
        display: "table",
        dataset_query: {
          type: "native",
          native: { query: q.query },
        },
      })),
    },
    null,
    2
  )
}

// ============================================
// Pre-built Stack Templates
// ============================================

export const STACK_TEMPLATES: Record<string, DataStack> = {
  modern_data_stack_snowflake: {
    name: "Modern Data Stack (Snowflake)",
    description: "Complete modern data stack with Snowflake, dbt, Fivetran, and Looker",
    warehouse: "snowflake",
    cloudProvider: "multi",
    orchestration: { type: "airflow", enabled: true, config: { executor: "KubernetesExecutor" } },
    transformation: { type: "dbt", enabled: true, config: { version: "1.7" } },
    ingestion: { type: "fivetran", enabled: true, config: {} },
    quality: { type: "great_expectations", enabled: true, config: {} },
    bi: { type: "looker", enabled: true, config: {} },
    monitoring: { type: "grafana", enabled: true, config: {} },
    estimatedMonthlyCost: 5000,
    setupComplexity: "high",
    maintenanceLevel: "medium",
  },
  modern_data_stack_bigquery: {
    name: "Modern Data Stack (BigQuery)",
    description: "Complete modern data stack with BigQuery, dbt, Airbyte, and Looker Studio",
    warehouse: "bigquery",
    cloudProvider: "gcp",
    orchestration: { type: "airflow", enabled: true, config: { executor: "KubernetesExecutor" } },
    transformation: { type: "dbt", enabled: true, config: { version: "1.7" } },
    ingestion: { type: "airbyte", enabled: true, config: {} },
    quality: { type: "great_expectations", enabled: true, config: {} },
    bi: { type: "metabase", enabled: true, config: {} },
    monitoring: { type: "grafana", enabled: true, config: {} },
    estimatedMonthlyCost: 3000,
    setupComplexity: "medium",
    maintenanceLevel: "low",
  },
  databricks_lakehouse: {
    name: "Databricks Lakehouse",
    description: "Databricks-based lakehouse with Unity Catalog, dbt, and Spark",
    warehouse: "databricks",
    cloudProvider: "multi",
    orchestration: { type: "airflow", enabled: true, config: { executor: "KubernetesExecutor" } },
    transformation: { type: "dbt", enabled: true, config: { version: "1.7", adapter: "databricks" } },
    ingestion: { type: "airbyte", enabled: true, config: {} },
    quality: { type: "great_expectations", enabled: true, config: {} },
    bi: { type: "powerbi", enabled: true, config: {} },
    monitoring: { type: "grafana", enabled: true, config: {} },
    estimatedMonthlyCost: 8000,
    setupComplexity: "high",
    maintenanceLevel: "high",
  },
  startup_minimal: {
    name: "Startup Minimal Stack",
    description: "Cost-effective stack for startups with PostgreSQL and Metabase",
    warehouse: "postgres",
    cloudProvider: "multi",
    orchestration: { type: "prefect", enabled: true, config: {} },
    transformation: { type: "dbt", enabled: true, config: { version: "1.7" } },
    ingestion: { type: "airbyte", enabled: true, config: {} },
    quality: { type: "soda", enabled: true, config: {} },
    bi: { type: "metabase", enabled: true, config: {} },
    monitoring: { type: "grafana", enabled: true, config: {} },
    estimatedMonthlyCost: 500,
    setupComplexity: "low",
    maintenanceLevel: "low",
  },
  real_time_streaming: {
    name: "Real-time Streaming Stack",
    description: "Real-time data processing with Kafka, Spark, and streaming analytics",
    warehouse: "databricks",
    cloudProvider: "multi",
    orchestration: { type: "airflow", enabled: true, config: { executor: "KubernetesExecutor" } },
    transformation: { type: "spark", enabled: true, config: { deployMode: "cluster" } },
    ingestion: { type: "kafka", enabled: true, config: {} },
    quality: { type: "great_expectations", enabled: true, config: {} },
    bi: { type: "grafana", enabled: true, config: {} },
    monitoring: { type: "grafana", enabled: true, config: {} },
    estimatedMonthlyCost: 10000,
    setupComplexity: "high",
    maintenanceLevel: "high",
  },
  redshift_aws: {
    name: "AWS Redshift Stack",
    description: "Complete AWS-native stack with Redshift, Glue, and QuickSight",
    warehouse: "redshift",
    cloudProvider: "aws",
    orchestration: { type: "airflow", enabled: true, config: { executor: "KubernetesExecutor" } },
    transformation: { type: "dbt", enabled: true, config: { version: "1.7", adapter: "redshift" } },
    ingestion: { type: "airbyte", enabled: true, config: {} },
    quality: { type: "great_expectations", enabled: true, config: {} },
    bi: { type: "tableau", enabled: true, config: {} },
    monitoring: { type: "grafana", enabled: true, config: {} },
    estimatedMonthlyCost: 4000,
    setupComplexity: "medium",
    maintenanceLevel: "medium",
  },
  duckdb_local: {
    name: "Local DuckDB Stack",
    description: "Zero-cloud-cost local stack with DuckDB, perfect for development and small projects",
    warehouse: "duckdb",
    cloudProvider: "multi",
    orchestration: { type: "prefect", enabled: true, config: {} },
    transformation: { type: "dbt", enabled: true, config: { version: "1.7", adapter: "duckdb" } },
    ingestion: { type: "airbyte", enabled: false, config: {} },
    quality: { type: "soda", enabled: true, config: {} },
    bi: { type: "metabase", enabled: true, config: {} },
    monitoring: { type: "grafana", enabled: false, config: {} },
    estimatedMonthlyCost: 0,
    setupComplexity: "low",
    maintenanceLevel: "low",
  },
}

// ============================================
// Stack Recommendation Engine
// ============================================

export interface StackRequirements {
  budget: "low" | "medium" | "high"
  dataVolume: "small" | "medium" | "large" | "very_large"
  realTimeRequired: boolean
  teamSize: number
  cloudPreference?: CloudProvider
  existingWarehouse?: WarehouseType
  technicalExpertise: "beginner" | "intermediate" | "advanced"
  complianceRequirements?: ("gdpr" | "hipaa" | "sox" | "pci")[]
}

export function recommendStack(requirements: StackRequirements): DataStack[] {
  const recommendations: DataStack[] = []

  // Filter by budget
  const maxCost = requirements.budget === "low" ? 1000 : requirements.budget === "medium" ? 5000 : Infinity

  for (const [key, stack] of Object.entries(STACK_TEMPLATES)) {
    if (stack.estimatedMonthlyCost > maxCost) continue

    // Check cloud preference
    if (requirements.cloudPreference && stack.cloudProvider !== requirements.cloudPreference && stack.cloudProvider !== "multi") {
      continue
    }

    // Check existing warehouse
    if (requirements.existingWarehouse && stack.warehouse !== requirements.existingWarehouse) {
      continue
    }

    // Check real-time requirements
    if (requirements.realTimeRequired && key !== "real_time_streaming") {
      continue
    }

    // Check complexity vs expertise
    if (requirements.technicalExpertise === "beginner" && stack.setupComplexity === "high") {
      continue
    }

    recommendations.push(stack)
  }

  return recommendations.slice(0, 3) // Return top 3 recommendations
}

// ============================================
// Cost Estimation
// ============================================

export interface CostBreakdown {
  warehouse: number
  orchestration: number
  transformation: number
  ingestion: number
  quality: number
  bi: number
  monitoring: number
  total: number
}

export function estimateStackCost(stack: DataStack, dataVolumeGB: number, queriesPerDay: number): CostBreakdown {
  const costs: CostBreakdown = {
    warehouse: 0,
    orchestration: 0,
    transformation: 0,
    ingestion: 0,
    quality: 0,
    bi: 0,
    monitoring: 0,
    total: 0,
  }

  // Warehouse costs
  switch (stack.warehouse) {
    case "snowflake":
      costs.warehouse = Math.max(200, dataVolumeGB * 3 + queriesPerDay * 0.01)
      break
    case "bigquery":
      costs.warehouse = Math.max(50, dataVolumeGB * 0.02 + queriesPerDay * 0.005)
      break
    case "databricks":
      costs.warehouse = Math.max(200, dataVolumeGB * 2 + queriesPerDay * 0.02)
      break
    case "postgres":
      costs.warehouse = Math.max(50, 100 + dataVolumeGB * 0.5)
      break
    case "redshift":
      costs.warehouse = Math.max(150, dataVolumeGB * 1.5)
      break
    default:
      costs.warehouse = 100
  }

  // Orchestration costs
  if (stack.orchestration.type === "airflow") {
    costs.orchestration = stack.orchestration.config?.executor === "KubernetesExecutor" ? 150 : 50
  } else if (stack.orchestration.type === "dagster") {
    costs.orchestration = stack.orchestration.deployment === "cloud" ? 200 : 50
  }

  // Transformation costs (dbt Cloud has pricing, OSS is free)
  costs.transformation = stack.transformation.type === "dbt_cloud" ? 100 : 0

  // Ingestion costs
  if (stack.ingestion.type === "fivetran") {
    costs.ingestion = 150 + dataVolumeGB * 0.1
  } else if (stack.ingestion.type === "airbyte") {
    costs.ingestion = 50
  }

  // Quality costs
  costs.quality = 50

  // BI costs
  if (stack.bi.type === "looker") {
    costs.bi = 300
  } else if (stack.bi.type === "tableau") {
    costs.bi = 150
  } else {
    costs.bi = 50 // Metabase, Superset, etc.
  }

  // Monitoring
  costs.monitoring = 50

  // Total
  costs.total = Object.values(costs).reduce((sum, cost) => sum + cost, 0) - costs.total

  return costs
}
