// @ts-nocheck
// Database Connectors - Real implementations for PostgreSQL, BigQuery, MySQL, MongoDB, Snowflake
import { db } from "@/lib/db"
import { Pool } from "pg"
import { BigQuery } from "@google-cloud/bigquery"

// Export additional connectors
export { MySQLConnector } from './mysql-connector'
export type { MySQLConnectionConfig, MySQLTableSchema, MySQLColumnInfo, MySQLDataProfile } from './mysql-connector'

export { MongoDBConnector } from './mongodb-connector'
export type { MongoDBConnectionConfig, MongoDBCollectionSchema, MongoDBSchemaField, MongoDBDataProfile } from './mongodb-connector'

export { SnowflakeConnector } from './snowflake-connector'
export type { SnowflakeConnectionConfig, SnowflakeTableSchema, SnowflakeColumnInfo, SnowflakeDataProfile } from './snowflake-connector'

// ============================================
// Base Connector Interface
// ============================================

export interface ConnectionConfig {
  type: "postgresql" | "mysql" | "bigquery" | "snowflake" | "api"
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  ssl?: boolean
  // BigQuery specific
  projectId?: string
  keyFilename?: string
  credentials?: string
  // API specific
  apiKey?: string
  baseUrl?: string
  headers?: Record<string, string>
}

export interface TableInfo {
  name: string
  schema?: string
  columns: ColumnInfo[]
  rowCount?: number
  primaryKey?: string
  foreignKeys?: ForeignKeyInfo[]
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string
  isPrimaryKey?: boolean
}

export interface ForeignKeyInfo {
  name: string
  columns: string[]
  referencedTable: string
  referencedColumns: string[]
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  executionTime: number
}

// ============================================
// PostgreSQL Connector
// ============================================

export class PostgreSQLConnector {
  private pool: Pool | null = null
  private config: ConnectionConfig

  constructor(config: ConnectionConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      this.pool = new Pool({
        host: this.config.host || "localhost",
        port: this.config.port || 5432,
        database: this.config.database || "postgres",
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        max: 5,
        idleTimeoutMillis: 30000,
      })

      // Test connection
      const client = await this.pool.connect()
      await client.query("SELECT 1")
      client.release()

      return true
    } catch (error) {
      console.error("PostgreSQL connection error:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; version?: string }> {
    try {
      if (!this.pool) {
        const connected = await this.connect()
        if (!connected) {
          return { success: false, message: "Failed to establish connection" }
        }
      }

      const result = await this.pool!.query("SELECT version()")
      return {
        success: true,
        message: "Connection successful",
        version: result.rows[0].version,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getTables(): Promise<TableInfo[]> {
    if (!this.pool) throw new Error("Not connected")

    const result = await this.pool.query(`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `)

    const tables: TableInfo[] = []
    for (const row of result.rows) {
      const columns = await this.getColumns(row.table_name, row.table_schema)
      tables.push({
        name: row.table_name,
        schema: row.table_schema,
        columns,
      })
    }

    return tables
  }

  private async getColumns(tableName: string, schema: string): Promise<ColumnInfo[]> {
    const result = await this.pool!.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = $2
      ORDER BY ordinal_position
    `, [tableName, schema])

    return result.rows.map((row) => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === "YES",
      defaultValue: row.column_default,
    }))
  }

  async getTableSchema(tableName: string, schema = "public"): Promise<TableInfo> {
    if (!this.pool) throw new Error("Not connected")

    const columns = await this.getColumns(tableName, schema)
    
    // Get row count
    const countResult = await this.pool!.query(`
      SELECT COUNT(*) as count FROM ${schema}.${tableName}
    `)

    return {
      name: tableName,
      schema,
      columns,
      rowCount: parseInt(countResult.rows[0].count),
    }
  }

  async query(sql: string, params?: unknown[]): Promise<QueryResult> {
    if (!this.pool) throw new Error("Not connected")

    const startTime = Date.now()
    const result = await this.pool!.query(sql, params)
    const executionTime = Date.now() - startTime

    return {
      columns: result.fields.map((f) => f.name),
      rows: result.rows,
      rowCount: result.rowCount || 0,
      executionTime,
    }
  }

  async getSampleData(tableName: string, schema = "public", limit = 100): Promise<QueryResult> {
    return this.query(`SELECT * FROM ${schema}.${tableName} LIMIT ${limit}`)
  }

  async getTableStats(tableName: string, schema = "public"): Promise<Record<string, unknown>> {
    if (!this.pool) throw new Error("Not connected")

    // Get table size
    const sizeResult = await this.pool!.query(`
      SELECT pg_size_pretty(pg_total_relation_size('${schema}.${tableName}')) as size
    `)

    // Get row count estimate
    const countResult = await this.pool!.query(`
      SELECT reltuples::bigint as estimate FROM pg_class 
      WHERE relname = $1
    `, [tableName])

    return {
      size: sizeResult.rows[0]?.size,
      estimatedRows: countResult.rows[0]?.estimate || 0,
    }
  }
}

// ============================================
// BigQuery Connector
// ============================================

export class BigQueryConnector {
  private bigquery: BigQuery | null = null
  private config: ConnectionConfig

  constructor(config: ConnectionConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      const options: ConstructorParameters<typeof BigQuery>[0] = {
        projectId: this.config.projectId,
      }

      if (this.config.keyFilename) {
        options.keyFilename = this.config.keyFilename
      } else if (this.config.credentials) {
        options.credentials = JSON.parse(this.config.credentials)
      }

      this.bigquery = new BigQuery(options)

      // Test connection
      await this.bigquery.getDatasets()

      return true
    } catch (error) {
      console.error("BigQuery connection error:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.bigquery = null
  }

  async testConnection(): Promise<{ success: boolean; message: string; projectId?: string }> {
    try {
      if (!this.bigquery) {
        const connected = await this.connect()
        if (!connected) {
          return { success: false, message: "Failed to establish connection" }
        }
      }

      const [datasets] = await this.bigquery!.getDatasets({ maxResults: 1 })
      return {
        success: true,
        message: "Connection successful",
        projectId: this.bigquery!.projectId,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getDatasets(): Promise<string[]> {
    if (!this.bigquery) throw new Error("Not connected")

    const [datasets] = await this.bigquery.getDatasets()
    return datasets.map((ds) => ds.id || "")
  }

  async getTables(datasetId: string): Promise<TableInfo[]> {
    if (!this.bigquery) throw new Error("Not connected")

    const [tables] = await this.bigquery.dataset(datasetId).getTables()
    
    const tableInfos: TableInfo[] = []
    for (const table of tables) {
      const [metadata] = await table.getMetadata()
      const schema = metadata.schema?.fields || []
      
      tableInfos.push({
        name: table.id || "",
        schema: datasetId,
        columns: schema.map((field: any) => ({
          name: field.name,
          type: field.type,
          nullable: field.mode !== "REQUIRED",
          defaultValue: field.defaultValue,
        })),
        rowCount: parseInt(metadata.numRows) || 0,
      })
    }

    return tableInfos
  }

  async query(sql: string): Promise<QueryResult> {
    if (!this.bigquery) throw new Error("Not connected")

    const startTime = Date.now()
    const [rows] = await this.bigquery!.query(sql)
    const executionTime = Date.now() - startTime

    // Get column names from first row
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
      executionTime,
    }
  }

  async getTableSchema(datasetId: string, tableId: string): Promise<TableInfo> {
    if (!this.bigquery) throw new Error("Not connected")

    const table = this.bigquery.dataset(datasetId).table(tableId)
    const [metadata] = await table.getMetadata()
    
    const schema = metadata.schema?.fields || []

    return {
      name: tableId,
      schema: datasetId,
      columns: schema.map((field: any) => ({
        name: field.name,
        type: field.type,
        nullable: field.mode !== "REQUIRED",
        defaultValue: field.defaultValue,
      })),
      rowCount: parseInt(metadata.numRows) || 0,
    }
  }

  async getSampleData(datasetId: string, tableId: string, limit = 100): Promise<QueryResult> {
    return this.query(`SELECT * FROM \`${this.config.projectId}.${datasetId}.${tableId}\` LIMIT ${limit}`)
  }
}

// ============================================
// Connector Factory
// ============================================

export function createConnector(config: ConnectionConfig): PostgreSQLConnector | BigQueryConnector | null {
  switch (config.type) {
    case "postgresql":
      return new PostgreSQLConnector(config)
    case "bigquery":
      return new BigQueryConnector(config)
    default:
      console.warn(`Connector type ${config.type} not implemented yet`)
      return null
  }
}

// ============================================
// Database Connection Manager
// ============================================

export class ConnectionManager {
  private static connections = new Map<string, PostgreSQLConnector | BigQueryConnector>()

  static async getConnection(sourceId: string, config: ConnectionConfig): Promise<PostgreSQLConnector | BigQueryConnector | null> {
    if (this.connections.has(sourceId)) {
      return this.connections.get(sourceId) || null
    }

    const connector = createConnector(config)
    if (!connector) return null

    const connected = await connector.connect()
    if (!connected) return null

    this.connections.set(sourceId, connector)
    return connector
  }

  static async closeConnection(sourceId: string): Promise<void> {
    const connector = this.connections.get(sourceId)
    if (connector) {
      await connector.disconnect()
      this.connections.delete(sourceId)
    }
  }

  static async closeAll(): Promise<void> {
    for (const [sourceId] of this.connections) {
      await this.closeConnection(sourceId)
    }
  }
}

// ============================================
// Helper Functions for API
// ============================================

export async function testDataSourceConnection(sourceId: string): Promise<{
  success: boolean
  message: string
  details?: Record<string, unknown>
}> {
  const source = await db.dataSource.findUnique({
    where: { id: sourceId },
  })

  if (!source) {
    return { success: false, message: "Data source not found" }
  }

  // Parse metadata for connection config
  const metadata = source.metadata ? JSON.parse(source.metadata) : {}
  
  const config: ConnectionConfig = {
    type: source.type as ConnectionConfig["type"],
    host: source.host || metadata.host,
    port: source.port || metadata.port,
    database: source.database || metadata.database,
    username: metadata.username,
    password: metadata.password, // Should be encrypted in production
    projectId: metadata.projectId,
    keyFilename: metadata.keyFilename,
    credentials: metadata.credentials,
  }

  let result
  switch (config.type) {
    case "postgresql": {
      const connector = new PostgreSQLConnector(config)
      result = await connector.testConnection()
      await connector.disconnect()
      break
    }
    case "bigquery": {
      const connector = new BigQueryConnector(config)
      result = await connector.testConnection()
      await connector.disconnect()
      break
    }
    default:
      return {
        success: false,
        message: `Connection testing not supported for type: ${config.type}`,
      }
  }

  // Update data source status
  await db.dataSource.update({
    where: { id: sourceId },
    data: {
      status: result.success ? "connected" : "error",
      lastSync: result.success ? new Date() : undefined,
    },
  })

  return {
    success: result.success,
    message: result.message,
    details: result,
  }
}

export async function discoverSourceSchema(sourceId: string): Promise<{
  success: boolean
  tables?: TableInfo[]
  error?: string
}> {
  const source = await db.dataSource.findUnique({
    where: { id: sourceId },
  })

  if (!source) {
    return { success: false, error: "Data source not found" }
  }

  const metadata = source.metadata ? JSON.parse(source.metadata) : {}
  
  const config: ConnectionConfig = {
    type: source.type as ConnectionConfig["type"],
    host: source.host || metadata.host,
    port: source.port || metadata.port,
    database: source.database || metadata.database,
    username: metadata.username,
    password: metadata.password,
    projectId: metadata.projectId,
    keyFilename: metadata.keyFilename,
    credentials: metadata.credentials,
  }

  try {
    let tables: TableInfo[] = []

    switch (config.type) {
      case "postgresql": {
        const connector = new PostgreSQLConnector(config)
        const connected = await connector.connect()
        if (!connected) {
          return { success: false, error: "Failed to connect" }
        }
        tables = await connector.getTables()
        await connector.disconnect()
        break
      }
      case "bigquery": {
        const connector = new BigQueryConnector(config)
        const connected = await connector.connect()
        if (!connected) {
          return { success: false, error: "Failed to connect" }
        }
        
        const datasets = await connector.getDatasets()
        for (const dataset of datasets) {
          const datasetTables = await connector.getTables(dataset)
          tables.push(...datasetTables)
        }
        await connector.disconnect()
        break
      }
      default:
        return {
          success: false,
          error: `Schema discovery not supported for type: ${config.type}`,
        }
    }

    // Save discovered tables to database
    for (const table of tables) {
      await db.sourceTable.upsert({
        where: {
          dataSourceId_name: {
            dataSourceId: sourceId,
            name: table.name,
          },
        },
        update: {
          schema: JSON.stringify(table.columns),
          rowCount: table.rowCount,
        },
        create: {
          dataSourceId: sourceId,
          name: table.name,
          schema: JSON.stringify(table.columns),
          rowCount: table.rowCount,
        },
      })
    }

    return { success: true, tables }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
