// Connector Types and Interfaces

export type ConnectorType = 
  | 'POSTGRESQL'
  | 'MYSQL'
  | 'BIGQUERY'
  | 'SNOWFLAKE'
  | 'REDSHIFT'
  | 'MONGODB'
  | 'ELASTICSEARCH'
  | 'S3'
  | 'AZURE_BLOB'
  | 'GOOGLE_SHEETS'
  | 'SALESFORCE'
  | 'HUBSPOT'
  | 'STRIPE'
  | 'CUSTOM'

export type ConnectorStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'PENDING'

export interface ConnectorConfig {
  type: ConnectorType
  name: string
  description?: string
  connectionConfig: Record<string, unknown>
  credentials: Record<string, unknown>
  schedule?: {
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
    time?: string
  }
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  details?: Record<string, unknown>
  latency?: number
}

export interface DataSourceSchema {
  tables: Array<{
    name: string
    schema?: string
    columns: Array<{
      name: string
      type: string
      nullable: boolean
      primaryKey?: boolean
      foreignKey?: {
        table: string
        column: string
      }
    }>
    rowCount?: number
  }>
  views: Array<{
    name: string
    schema?: string
    columns: Array<{
      name: string
      type: string
    }>
  }>
}

export interface DataPreview {
  columns: string[]
  rows: Array<Record<string, unknown>>
  totalRows: number
}

// Base Connector Interface
export interface IConnector {
  type: ConnectorType
  name: string
  
  connect(config: ConnectorConfig): Promise<ConnectionTestResult>
  disconnect(): Promise<void>
  testConnection(): Promise<ConnectionTestResult>
  getSchema(): Promise<DataSourceSchema>
  previewData(table: string, limit?: number): Promise<DataPreview>
  executeQuery(query: string): Promise<Array<Record<string, unknown>>>
}

// Connector Registry with configurations
export const CONNECTOR_REGISTRY: Record<ConnectorType, {
  name: string
  description: string
  icon: string
  requiredFields: Array<{
    name: string
    label: string
    type: 'text' | 'password' | 'number' | 'url'
    required: boolean
    placeholder?: string
  }>
  features: string[]
}> = {
  POSTGRESQL: {
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases',
    icon: '🐘',
    requiredFields: [
      { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { name: 'port', label: 'Port', type: 'number', required: true, placeholder: '5432' },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'schema', label: 'Schema', type: 'text', required: false, placeholder: 'public' },
    ],
    features: ['CDC', 'Batch', 'Real-time'],
  },
  MYSQL: {
    name: 'MySQL',
    description: 'Connect to MySQL/MariaDB databases',
    icon: '🐬',
    requiredFields: [
      { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { name: 'port', label: 'Port', type: 'number', required: true, placeholder: '3306' },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
    ],
    features: ['CDC', 'Batch', 'Real-time'],
  },
  BIGQUERY: {
    name: 'Google BigQuery',
    description: 'Connect to Google BigQuery data warehouse',
    icon: '📊',
    requiredFields: [
      { name: 'projectId', label: 'Project ID', type: 'text', required: true },
      { name: 'dataset', label: 'Dataset', type: 'text', required: true },
      { name: 'credentials', label: 'Service Account JSON', type: 'password', required: true },
    ],
    features: ['Serverless', 'Auto-scaling', 'SQL'],
  },
  SNOWFLAKE: {
    name: 'Snowflake',
    description: 'Connect to Snowflake data cloud',
    icon: '❄️',
    requiredFields: [
      { name: 'account', label: 'Account', type: 'text', required: true },
      { name: 'warehouse', label: 'Warehouse', type: 'text', required: true },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'schema', label: 'Schema', type: 'text', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
    ],
    features: ['Cloud-native', 'Auto-scaling', 'Zero-copy'],
  },
  REDSHIFT: {
    name: 'Amazon Redshift',
    description: 'Connect to Amazon Redshift data warehouse',
    icon: '🔴',
    requiredFields: [
      { name: 'host', label: 'Host', type: 'text', required: true },
      { name: 'port', label: 'Port', type: 'number', required: true, placeholder: '5439' },
      { name: 'database', label: 'Database', type: 'text', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
    ],
    features: ['Columnar', 'MPP', 'S3 integration'],
  },
  MONGODB: {
    name: 'MongoDB',
    description: 'Connect to MongoDB databases',
    icon: '🍃',
    requiredFields: [
      { name: 'connectionString', label: 'Connection String', type: 'password', required: true, placeholder: 'mongodb://...' },
      { name: 'database', label: 'Database', type: 'text', required: true },
    ],
    features: ['Document-based', 'Flexible schema', 'Aggregations'],
  },
  ELASTICSEARCH: {
    name: 'Elasticsearch',
    description: 'Connect to Elasticsearch clusters',
    icon: '🔍',
    requiredFields: [
      { name: 'host', label: 'Host', type: 'url', required: true },
      { name: 'port', label: 'Port', type: 'number', required: true, placeholder: '9200' },
      { name: 'username', label: 'Username', type: 'text', required: false },
      { name: 'password', label: 'Password', type: 'password', required: false },
    ],
    features: ['Full-text search', 'Analytics', 'Real-time'],
  },
  S3: {
    name: 'Amazon S3',
    description: 'Connect to Amazon S3 buckets',
    icon: '🪣',
    requiredFields: [
      { name: 'bucket', label: 'Bucket Name', type: 'text', required: true },
      { name: 'region', label: 'Region', type: 'text', required: true, placeholder: 'us-east-1' },
      { name: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
      { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
    ],
    features: ['Object storage', 'Unlimited scale', 'Data lake'],
  },
  AZURE_BLOB: {
    name: 'Azure Blob Storage',
    description: 'Connect to Azure Blob Storage',
    icon: '☁️',
    requiredFields: [
      { name: 'connectionString', label: 'Connection String', type: 'password', required: true },
      { name: 'container', label: 'Container', type: 'text', required: true },
    ],
    features: ['Object storage', 'Azure integration', 'Data lake'],
  },
  GOOGLE_SHEETS: {
    name: 'Google Sheets',
    description: 'Connect to Google Sheets spreadsheets',
    icon: '📋',
    requiredFields: [
      { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true },
      { name: 'credentials', label: 'Service Account JSON', type: 'password', required: true },
    ],
    features: ['Spreadsheets', 'Easy import', 'Collaboration'],
  },
  SALESFORCE: {
    name: 'Salesforce',
    description: 'Connect to Salesforce CRM',
    icon: '☁️',
    requiredFields: [
      { name: 'instanceUrl', label: 'Instance URL', type: 'url', required: true },
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
    ],
    features: ['CRM data', 'Objects', 'SOQL'],
  },
  HUBSPOT: {
    name: 'HubSpot',
    description: 'Connect to HubSpot CRM',
    icon: '🧡',
    requiredFields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
    features: ['CRM data', 'Marketing', 'Sales'],
  },
  STRIPE: {
    name: 'Stripe',
    description: 'Connect to Stripe payments',
    icon: '💳',
    requiredFields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
    features: ['Payments', 'Subscriptions', 'Invoicing'],
  },
  CUSTOM: {
    name: 'Custom Connector',
    description: 'Create a custom connector',
    icon: '🔧',
    requiredFields: [
      { name: 'name', label: 'Connector Name', type: 'text', required: true },
      { name: 'endpoint', label: 'API Endpoint', type: 'url', required: true },
      { name: 'apiKey', label: 'API Key', type: 'password', required: false },
    ],
    features: ['Custom', 'API', 'REST'],
  },
}
