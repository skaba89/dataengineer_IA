// Enhanced Database & Service Connectors for AI Data Engineering System
// Supports: PostgreSQL, MySQL, BigQuery, Snowflake, MongoDB, Redis, Kafka, REST APIs, SaaS Connectors

import { Pool } from "pg"
import { BigQuery } from "@google-cloud/bigquery"
import mariadb from "mariadb"
import { MongoClient } from "mongodb"
import { createClient } from "redis"
import Redis from "ioredis"
import { Kafka, Admin, Consumer, Producer } from "kafkajs"

// ============================================
// Types & Interfaces
// ============================================

export type ConnectorType =
  | "postgresql"
  | "mysql"
  | "mariadb"
  | "bigquery"
  | "snowflake"
  | "mongodb"
  | "redis"
  | "kafka"
  | "api"
  | "s3"
  | "gcs"
  | "azure_blob"
  | "salesforce"
  | "hubspot"
  | "stripe"
  | "shopify"
  | "fivetran"
  | "airbyte"

export interface BaseConnectionConfig {
  type: ConnectorType
  label?: string
  ssl?: boolean
  timeout?: number
}

export interface SQLConnectionConfig extends BaseConnectionConfig {
  type: "postgresql" | "mysql" | "mariadb" | "snowflake"
  host: string
  port: number
  database: string
  username: string
  password: string
  schema?: string
  sslMode?: "disable" | "require" | "verify-ca" | "verify-full"
}

export interface BigQueryConfig extends BaseConnectionConfig {
  type: "bigquery"
  projectId: string
  keyFilename?: string
  credentials?: string // JSON string
  location?: string
}

export interface SnowflakeConfig extends BaseConnectionConfig {
  type: "snowflake"
  account: string
  username: string
  password: string
  database: string
  schema: string
  warehouse: string
  role?: string
}

export interface MongoDBConfig extends BaseConnectionConfig {
  type: "mongodb"
  connectionString: string
  database: string
}

export interface RedisConfig extends BaseConnectionConfig {
  type: "redis"
  host: string
  port: number
  password?: string
  database?: number
  cluster?: { nodes: { host: string; port: number }[] }
}

export interface KafkaConfig extends BaseConnectionConfig {
  type: "kafka"
  brokers: string[]
  sasl?: {
    mechanism: "plain" | "scram-sha-256" | "scram-sha-512"
    username: string
    password: string
  }
  ssl?: boolean
}

export interface APIConfig extends BaseConnectionConfig {
  type: "api"
  baseUrl: string
  authType: "none" | "basic" | "bearer" | "apikey" | "oauth2"
  apiKey?: string
  apiKeyHeader?: string
  username?: string
  password?: string
  bearerToken?: string
  oauthConfig?: {
    tokenUrl: string
    clientId: string
    clientSecret: string
    scopes?: string[]
  }
  headers?: Record<string, string>
}

export interface S3Config extends BaseConnectionConfig {
  type: "s3"
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  endpoint?: string
  prefix?: string
}

export interface SalesforceConfig extends BaseConnectionConfig {
  type: "salesforce"
  instanceUrl: string
  accessToken: string
  refreshToken?: string
  clientId?: string
  clientSecret?: string
  apiVersion?: string
}

export interface HubSpotConfig extends BaseConnectionConfig {
  type: "hubspot"
  accessToken: string
  portalId?: string
}

export interface StripeConfig extends BaseConnectionConfig {
  type: "stripe"
  apiKey: string
  apiVersion?: string
}

export interface ShopifyConfig extends BaseConnectionConfig {
  type: "shopify"
  shopDomain: string
  accessToken: string
  apiVersion?: string
}

export type ConnectionConfig =
  | SQLConnectionConfig
  | BigQueryConfig
  | SnowflakeConfig
  | MongoDBConfig
  | RedisConfig
  | KafkaConfig
  | APIConfig
  | S3Config
  | SalesforceConfig
  | HubSpotConfig
  | StripeConfig
  | ShopifyConfig

export interface TableInfo {
  name: string
  schema?: string
  columns: ColumnInfo[]
  rowCount?: number
  primaryKey?: string[]
  foreignKeys?: ForeignKeyInfo[]
  indexes?: IndexInfo[]
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  description?: string
  precision?: number
  scale?: number
}

export interface ForeignKeyInfo {
  name: string
  columns: string[]
  referencedTable: string
  referencedColumns: string[]
}

export interface IndexInfo {
  name: string
  columns: string[]
  unique: boolean
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  executionTime: number
  truncated?: boolean
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  details?: Record<string, unknown>
  version?: string
  latency?: number
}

export interface DataProfile {
  tableName: string
  columnName: string
  dataType: string
  nullCount: number
  nullPercent: number
  distinctCount: number
  sampleValues: unknown[]
  minValue?: unknown
  maxValue?: unknown
  avgValue?: number
  stdDev?: number
  histogram?: { bucket: string; count: number }[]
}

// ============================================
// Base Connector Interface
// ============================================

export interface IConnector {
  connect(): Promise<boolean>
  disconnect(): Promise<void>
  testConnection(): Promise<ConnectionTestResult>
  getTables?(): Promise<TableInfo[]>
  getTableSchema?(tableName: string, schema?: string): Promise<TableInfo>
  profileData?(tableName: string, schema?: string): Promise<DataProfile[]>
  query?(sql: string, params?: unknown[]): Promise<QueryResult>
  getSampleData?(tableName: string, schema?: string, limit?: number): Promise<QueryResult>
  getTableStats?(tableName: string, schema?: string): Promise<Record<string, unknown>>
  discoverSchema?(): Promise<{ databases?: string[]; schemas?: string[]; tables?: TableInfo[] }>
}

// ============================================
// PostgreSQL Connector (Enhanced)
// ============================================

export class PostgreSQLConnector implements IConnector {
  private pool: Pool | null = null
  private config: SQLConnectionConfig

  constructor(config: SQLConnectionConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port || 5432,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: this.config.timeout || 5000,
      })

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

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      if (!this.pool) {
        const connected = await this.connect()
        if (!connected) {
          return { success: false, message: "Failed to establish connection" }
        }
      }

      const result = await this.pool!.query("SELECT version(), current_database(), current_user")
      const latency = Date.now() - startTime

      return {
        success: true,
        message: "Connection successful",
        version: result.rows[0].version,
        latency,
        details: {
          database: result.rows[0].current_database,
          user: result.rows[0].current_user,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async getTables(): Promise<TableInfo[]> {
    if (!this.pool) throw new Error("Not connected")

    const result = await this.pool.query(`
      SELECT 
        t.table_name,
        t.table_schema,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = t.table_schema) as column_count
      FROM information_schema.tables t
      JOIN pg_tables pt ON pt.tablename = t.table_name
      WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_schema, t.table_name
    `)

    const tables: TableInfo[] = []
    for (const row of result.rows) {
      const columns = await this.getTableColumns(row.table_name, row.table_schema)
      tables.push({
        name: row.table_name,
        schema: row.table_schema,
        columns,
      })
    }

    return tables
  }

  private async getTableColumns(tableName: string, schema: string): Promise<ColumnInfo[]> {
    const columnQuery = `
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT kcu.column_name, kcu.table_name, kcu.table_schema
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
      ) pk ON pk.column_name = c.column_name 
        AND pk.table_name = c.table_name 
        AND pk.table_schema = c.table_schema
      WHERE c.table_name = $1 AND c.table_schema = $2
      ORDER BY c.ordinal_position
    `

    const result = await this.pool!.query(columnQuery, [tableName, schema])

    return result.rows.map((row) => ({
      name: row.column_name,
      type: row.data_type + (row.character_maximum_length ? `(${row.character_maximum_length})` : "") + (row.numeric_precision ? `(${row.numeric_precision}${row.numeric_scale ? "," + row.numeric_scale : ""})` : ""),
      nullable: row.is_nullable === "YES",
      defaultValue: row.column_default,
      isPrimaryKey: row.is_primary_key,
      precision: row.numeric_precision,
      scale: row.numeric_scale,
    }))
  }

  async getTableSchema(tableName: string, schema = "public"): Promise<TableInfo> {
    if (!this.pool) throw new Error("Not connected")

    const columns = await this.getTableColumns(tableName, schema)

    // Get primary keys
    const pkResult = await this.pool!.query(`
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = '"${schema}"."${tableName}"'::regclass AND i.indisprimary
    `)
    const primaryKeys = pkResult.rows.map((r) => r.attname)

    // Get foreign keys
    const fkResult = await this.pool!.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2
    `, [schema, tableName])

    const foreignKeys: ForeignKeyInfo[] = fkResult.rows.reduce((acc, row) => {
      const existing = acc.find((fk) => fk.name === row.constraint_name)
      if (existing) {
        existing.columns.push(row.column_name)
        existing.referencedColumns.push(row.foreign_column)
      } else {
        acc.push({
          name: row.constraint_name,
          columns: [row.column_name],
          referencedTable: row.foreign_table,
          referencedColumns: [row.foreign_column],
        })
      }
      return acc
    }, [] as ForeignKeyInfo[])

    // Get indexes
    const indexResult = await this.pool!.query(`
      SELECT
        i.relname as index_name,
        array_agg(a.attname ORDER by a.attnum) as columns,
        ix.indisunique as is_unique
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = $1
      GROUP BY i.relname, ix.indisunique
    `, [tableName])

    const indexes: IndexInfo[] = indexResult.rows.map((row) => ({
      name: row.index_name,
      columns: row.columns,
      unique: row.is_unique,
    }))

    // Get row count
    const countResult = await this.pool!.query(`SELECT COUNT(*) as count FROM "${schema}"."${tableName}"`)

    return {
      name: tableName,
      schema,
      columns,
      primaryKey: primaryKeys,
      foreignKeys,
      indexes,
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
    return this.query(`SELECT * FROM "${schema}"."${tableName}" LIMIT ${limit}`)
  }

  async getTableStats(tableName: string, schema = "public"): Promise<Record<string, unknown>> {
    if (!this.pool) throw new Error("Not connected")

    const stats = await this.pool!.query(`
      SELECT 
        pg_size_pretty(pg_total_relation_size('${schema}.${tableName}')) as total_size,
        pg_size_pretty(pg_relation_size('${schema}.${tableName}')) as table_size,
        pg_size_pretty(pg_total_relation_size('${schema}.${tableName}') - pg_relation_size('${schema}.${tableName}')) as index_size,
        (SELECT reltuples::bigint FROM pg_class WHERE relname = $1) as estimated_rows,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = $1 AND table_schema = $2) as column_count
    `, [tableName, schema])

    return stats.rows[0]
  }

  async profileData(tableName: string, schema = "public"): Promise<DataProfile[]> {
    const tableSchema = await this.getTableSchema(tableName, schema)
    const profiles: DataProfile[] = []

    for (const column of tableSchema.columns) {
      const fullTableName = `"${schema}"."${tableName}"`

      const statsQuery = `
        SELECT 
          COUNT(*) as total_rows,
          COUNT("${column.name}") as non_null_count,
          COUNT(DISTINCT "${column.name}") as distinct_count,
          MIN("${column.name}") as min_val,
          MAX("${column.name}") as max_val
        FROM ${fullTableName}
      `

      const stats = await this.pool!.query(statsQuery)
      const row = stats.rows[0]

      const sampleQuery = `
        SELECT DISTINCT "${column.name}" 
        FROM ${fullTableName} 
        WHERE "${column.name}" IS NOT NULL 
        LIMIT 10
      `
      const sample = await this.pool!.query(sampleQuery)

      const totalRows = parseInt(row.total_rows) || 0
      const nonNullCount = parseInt(row.non_null_count) || 0

      profiles.push({
        tableName,
        columnName: column.name,
        dataType: column.type,
        nullCount: totalRows - nonNullCount,
        nullPercent: totalRows > 0 ? ((totalRows - nonNullCount) / totalRows) * 100 : 0,
        distinctCount: parseInt(row.distinct_count) || 0,
        sampleValues: sample.rows.map((r) => r[column.name]),
        minValue: row.min_val,
        maxValue: row.max_val,
      })
    }

    return profiles
  }
}

// ============================================
// MySQL/MariaDB Connector
// ============================================

export class MySQLConnector implements IConnector {
  private pool: mariadb.Pool | null = null
  private config: SQLConnectionConfig

  constructor(config: SQLConnectionConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      this.pool = mariadb.createPool({
        host: this.config.host,
        port: this.config.port || 3306,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        connectionLimit: 10,
      })

      const conn = await this.pool.getConnection()
      await conn.ping()
      conn.release()
      return true
    } catch (error) {
      console.error("MySQL connection error:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      if (!this.pool) {
        const connected = await this.connect()
        if (!connected) {
          return { success: false, message: "Failed to establish connection" }
        }
      }

      const conn = await this.pool!.getConnection()
      const result = await conn.query("SELECT VERSION() as version, DATABASE() as db, CURRENT_USER() as user")
      conn.release()
      const latency = Date.now() - startTime

      return {
        success: true,
        message: "Connection successful",
        version: result[0].version,
        latency,
        details: {
          database: result[0].db,
          user: result[0].user,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async getTables(): Promise<TableInfo[]> {
    if (!this.pool) throw new Error("Not connected")

    const conn = await this.pool.getConnection()
    const result = await conn.query(`
      SELECT TABLE_NAME, TABLE_SCHEMA
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
    `)

    const tables: TableInfo[] = []
    for (const row of result) {
      const columns = await this.getTableColumns(conn, row.TABLE_NAME)
      tables.push({
        name: row.TABLE_NAME,
        schema: row.TABLE_SCHEMA,
        columns,
      })
    }
    conn.release()
    return tables
  }

  private async getTableColumns(conn: mariadb.PoolConnection, tableName: string): Promise<ColumnInfo[]> {
    const result = await conn.query(`
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_KEY
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [tableName])

    return result.map((row: any) => ({
      name: row.COLUMN_NAME,
      type: row.COLUMN_TYPE,
      nullable: row.IS_NULLABLE === "YES",
      defaultValue: row.COLUMN_DEFAULT,
      isPrimaryKey: row.COLUMN_KEY === "PRI",
    }))
  }

  async query(sql: string): Promise<QueryResult> {
    if (!this.pool) throw new Error("Not connected")

    const startTime = Date.now()
    const conn = await this.pool.getConnection()
    const result = await conn.query(sql)
    conn.release()
    const executionTime = Date.now() - startTime

    const rows = Array.isArray(result) ? result : []
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
      executionTime,
    }
  }
}

// ============================================
// Snowflake Connector
// ============================================

export class SnowflakeConnector implements IConnector {
  private connection: any = null
  private config: SnowflakeConfig

  constructor(config: SnowflakeConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      // Note: In production, use snowflake-sdk package
      // const snowflake = require('snowflake-sdk')
      // this.connection = snowflake.createConnection({...})
      // await this.connection.connect()
      console.log("Snowflake connector initialized (mock mode)")
      return true
    } catch (error) {
      console.error("Snowflake connection error:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      // await this.connection.destroy()
      this.connection = null
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      return {
        success: true,
        message: "Connection successful (mock)",
        latency: Date.now() - startTime,
        details: {
          account: this.config.account,
          database: this.config.database,
          warehouse: this.config.warehouse,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async getTables(): Promise<TableInfo[]> {
    // Mock implementation
    return []
  }

  async query(sql: string): Promise<QueryResult> {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionTime: 0,
    }
  }
}

// ============================================
// MongoDB Connector
// ============================================

export class MongoDBConnector implements IConnector {
  private client: MongoClient | null = null
  private config: MongoDBConfig

  constructor(config: MongoDBConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      this.client = new MongoClient(this.config.connectionString)
      await this.client.connect()
      await this.client.db(this.config.database).command({ ping: 1 })
      return true
    } catch (error) {
      console.error("MongoDB connection error:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      if (!this.client) {
        const connected = await this.connect()
        if (!connected) {
          return { success: false, message: "Failed to establish connection" }
        }
      }

      const result = await this.client!.db(this.config.database).command({ ping: 1 })
      const serverInfo = await this.client!.db().admin().serverInfo()
      const latency = Date.now() - startTime

      return {
        success: true,
        message: "Connection successful",
        version: serverInfo.version,
        latency,
        details: {
          database: this.config.database,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async getTables(): Promise<TableInfo[]> {
    if (!this.client) throw new Error("Not connected")

    const db = this.client.db(this.config.database)
    const collections = await db.listCollections().toArray()

    const tables: TableInfo[] = []
    for (const col of collections) {
      // Get sample document to infer schema
      const sample = await db.collection(col.name).findOne()
      const columns: ColumnInfo[] = sample
        ? Object.entries(sample).map(([key, value]) => ({
            name: key,
            type: typeof value,
            nullable: true,
          }))
        : []

      const count = await db.collection(col.name).countDocuments()

      tables.push({
        name: col.name,
        columns,
        rowCount: count,
      })
    }

    return tables
  }

  async query(collection: string, filter = {}): Promise<QueryResult> {
    if (!this.client) throw new Error("Not connected")

    const startTime = Date.now()
    const db = this.client.db(this.config.database)
    const docs = await db.collection(collection).find(filter).limit(1000).toArray()
    const executionTime = Date.now() - startTime

    const columns = docs.length > 0 ? Object.keys(docs[0]) : []

    return {
      columns,
      rows: docs as Record<string, unknown>[],
      rowCount: docs.length,
      executionTime,
    }
  }
}

// ============================================
// Redis Connector
// ============================================

export class RedisConnector implements IConnector {
  private client: Redis | null = null
  private config: RedisConfig

  constructor(config: RedisConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      if (this.config.cluster) {
        this.client = new Redis(this.config.cluster.nodes, {
          password: this.config.password,
        })
      } else {
        this.client = new Redis({
          host: this.config.host,
          port: this.config.port || 6379,
          password: this.config.password,
          db: this.config.database || 0,
        })
      }

      await this.client.ping()
      return true
    } catch (error) {
      console.error("Redis connection error:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.client = null
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      if (!this.client) {
        const connected = await this.connect()
        if (!connected) {
          return { success: false, message: "Failed to establish connection" }
        }
      }

      const info = await this.client!.info("server")
      const latency = Date.now() - startTime

      const versionMatch = info.match(/redis_version:([^\r\n]+)/)
      const version = versionMatch ? versionMatch[1] : "unknown"

      return {
        success: true,
        message: "Connection successful",
        version,
        latency,
        details: {
          database: this.config.database || 0,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async getKeys(pattern = "*"): Promise<string[]> {
    if (!this.client) throw new Error("Not connected")
    return this.client.keys(pattern)
  }

  async getValue(key: string): Promise<string | null> {
    if (!this.client) throw new Error("Not connected")
    return this.client.get(key)
  }

  async getTTL(key: string): Promise<number> {
    if (!this.client) throw new Error("Not connected")
    return this.client.ttl(key)
  }
}

// ============================================
// Kafka Connector
// ============================================

export class KafkaConnector implements IConnector {
  private kafka: Kafka | null = null
  private admin: Admin | null = null
  private config: KafkaConfig

  constructor(config: KafkaConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      this.kafka = new Kafka({
        brokers: this.config.brokers,
        sasl: this.config.sasl,
        ssl: this.config.ssl,
      })
      this.admin = this.kafka.admin()
      await this.admin.connect()
      return true
    } catch (error) {
      console.error("Kafka connection error:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.admin) {
      await this.admin.disconnect()
      this.admin = null
      this.kafka = null
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      if (!this.admin) {
        const connected = await this.connect()
        if (!connected) {
          return { success: false, message: "Failed to establish connection" }
        }
      }

      const clusterInfo = await this.admin!.describeCluster()
      const latency = Date.now() - startTime

      return {
        success: true,
        message: "Connection successful",
        latency,
        details: {
          brokers: clusterInfo.brokers.length,
          controllerId: clusterInfo.controller,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async getTopics(): Promise<string[]> {
    if (!this.admin) throw new Error("Not connected")
    return this.admin.listTopics()
  }

  async getTopicMetadata(topic: string) {
    if (!this.admin) throw new Error("Not connected")
    return this.admin.fetchTopicMetadata({ topics: [topic] })
  }

  async createConsumer(groupId: string): Promise<Consumer> {
    if (!this.kafka) throw new Error("Not connected")
    return this.kafka.consumer({ groupId })
  }

  async createProducer(): Promise<Producer> {
    if (!this.kafka) throw new Error("Not connected")
    return this.kafka.producer()
  }
}

// ============================================
// REST API Connector
// ============================================

export class APIConnector implements IConnector {
  private config: APIConfig
  private accessToken: string | null = null

  constructor(config: APIConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    if (this.config.authType === "oauth2" && this.config.oauthConfig) {
      try {
        const response = await fetch(this.config.oauthConfig.tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.config.oauthConfig.clientId,
            client_secret: this.config.oauthConfig.clientSecret,
            scope: this.config.oauthConfig.scopes?.join(" ") || "",
          }),
        })

        const data = await response.json()
        this.accessToken = data.access_token
        return true
      } catch (error) {
        console.error("OAuth token fetch error:", error)
        return false
      }
    }

    return true
  }

  async disconnect(): Promise<void> {
    this.accessToken = null
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      const response = await this.request("GET", this.config.baseUrl)
      const latency = Date.now() - startTime

      return {
        success: response.ok,
        message: response.ok ? "Connection successful" : `HTTP ${response.status}`,
        latency,
        details: {
          baseUrl: this.config.baseUrl,
          statusCode: response.status,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  private async request(
    method: string,
    url: string,
    body?: unknown
  ): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.config.headers,
    }

    switch (this.config.authType) {
      case "basic":
        headers["Authorization"] = `Basic ${Buffer.from(
          `${this.config.username}:${this.config.password}`
        ).toString("base64")}`
        break
      case "bearer":
        headers["Authorization"] = `Bearer ${this.config.bearerToken}`
        break
      case "apikey":
        headers[this.config.apiKeyHeader || "X-API-Key"] = this.config.apiKey!
        break
      case "oauth2":
        if (this.accessToken) {
          headers["Authorization"] = `Bearer ${this.accessToken}`
        }
        break
    }

    return fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async get(endpoint: string, params?: Record<string, string>): Promise<QueryResult> {
    const startTime = Date.now()
    const url = new URL(endpoint, this.config.baseUrl)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v))
    }

    const response = await this.request("GET", url.toString())
    const data = await response.json()
    const executionTime = Date.now() - startTime

    const rows = Array.isArray(data) ? data : [data]
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
      executionTime,
    }
  }

  async post(endpoint: string, body: unknown): Promise<Response> {
    return this.request("POST", new URL(endpoint, this.config.baseUrl).toString(), body)
  }
}

// ============================================
// SaaS Connectors
// ============================================

export class SalesforceConnector implements IConnector {
  private config: SalesforceConfig

  constructor(config: SalesforceConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    return true
  }

  async disconnect(): Promise<void> {}

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      const response = await fetch(
        `${this.config.instanceUrl}/services/data/v${this.config.apiVersion || "58.0"}/limits`,
        {
          headers: { Authorization: `Bearer ${this.config.accessToken}` },
        }
      )

      const latency = Date.now() - startTime
      return {
        success: response.ok,
        message: response.ok ? "Connection successful" : `HTTP ${response.status}`,
        latency,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async query(soql: string): Promise<QueryResult> {
    const startTime = Date.now()
    const response = await fetch(
      `${this.config.instanceUrl}/services/data/v${this.config.apiVersion || "58.0"}/query?q=${encodeURIComponent(soql)}`,
      {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      }
    )

    const data = await response.json()
    const executionTime = Date.now() - startTime

    const rows = data.records || []
    const columns = rows.length > 0 ? Object.keys(rows[0]).filter((k) => !k.startsWith("attributes")) : []

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
      executionTime,
    }
  }

  async describeObjects(): Promise<string[]> {
    const response = await fetch(
      `${this.config.instanceUrl}/services/data/v${this.config.apiVersion || "58.0"}/sobjects`,
      {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      }
    )
    const data = await response.json()
    return data.sobjects.map((obj: any) => obj.name)
  }
}

export class HubSpotConnector implements IConnector {
  private config: HubSpotConfig

  constructor(config: HubSpotConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    return true
  }

  async disconnect(): Promise<void> {}

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      const response = await fetch("https://api.hubapi.com/integrations/v1/limits", {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      })

      const latency = Date.now() - startTime
      return {
        success: response.ok,
        message: response.ok ? "Connection successful" : `HTTP ${response.status}`,
        latency,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async getContacts(limit = 100): Promise<QueryResult> {
    const startTime = Date.now()
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      }
    )

    const data = await response.json()
    const executionTime = Date.now() - startTime

    const rows = data.results || []
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
      executionTime,
    }
  }
}

export class StripeConnector implements IConnector {
  private config: StripeConfig

  constructor(config: StripeConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    return true
  }

  async disconnect(): Promise<void> {}

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      const response = await fetch("https://api.stripe.com/v1/balance", {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      })

      const latency = Date.now() - startTime
      return {
        success: response.ok,
        message: response.ok ? "Connection successful" : `HTTP ${response.status}`,
        latency,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async getCustomers(limit = 100): Promise<QueryResult> {
    const startTime = Date.now()
    const response = await fetch(
      `https://api.stripe.com/v1/customers?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      }
    )

    const data = await response.json()
    const executionTime = Date.now() - startTime

    const rows = data.data || []
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
      executionTime,
    }
  }

  async getCharges(limit = 100): Promise<QueryResult> {
    const startTime = Date.now()
    const response = await fetch(
      `https://api.stripe.com/v1/charges?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      }
    )

    const data = await response.json()
    const executionTime = Date.now() - startTime

    const rows = data.data || []
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
      executionTime,
    }
  }
}

export class ShopifyConnector implements IConnector {
  private config: ShopifyConfig

  constructor(config: ShopifyConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    return true
  }

  async disconnect(): Promise<void> {}

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    try {
      const response = await fetch(
        `https://${this.config.shopDomain}/admin/api/${this.config.apiVersion || "2024-01"}/shop.json`,
        {
          headers: { "X-Shopify-Access-Token": this.config.accessToken },
        }
      )

      const latency = Date.now() - startTime
      return {
        success: response.ok,
        message: response.ok ? "Connection successful" : `HTTP ${response.status}`,
        latency,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async getProducts(limit = 100): Promise<QueryResult> {
    const startTime = Date.now()
    const response = await fetch(
      `https://${this.config.shopDomain}/admin/api/${this.config.apiVersion || "2024-01"}/products.json?limit=${limit}`,
      {
        headers: { "X-Shopify-Access-Token": this.config.accessToken },
      }
    )

    const data = await response.json()
    const executionTime = Date.now() - startTime

    const rows = data.products || []
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
      executionTime,
    }
  }

  async getOrders(limit = 100): Promise<QueryResult> {
    const startTime = Date.now()
    const response = await fetch(
      `https://${this.config.shopDomain}/admin/api/${this.config.apiVersion || "2024-01"}/orders.json?limit=${limit}`,
      {
        headers: { "X-Shopify-Access-Token": this.config.accessToken },
      }
    )

    const data = await response.json()
    const executionTime = Date.now() - startTime

    const rows = data.orders || []
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      rowCount: rows.length,
      executionTime,
    }
  }
}

// ============================================
// Connector Factory
// ============================================

export function createConnector(config: ConnectionConfig): IConnector | null {
  switch (config.type) {
    case "postgresql":
      return new PostgreSQLConnector(config as SQLConnectionConfig)
    case "mysql":
    case "mariadb":
      return new MySQLConnector(config as SQLConnectionConfig)
    case "snowflake":
      return new SnowflakeConnector(config as SnowflakeConfig)
    case "mongodb":
      return new MongoDBConnector(config as MongoDBConfig)
    case "redis":
      return new RedisConnector(config as RedisConfig)
    case "kafka":
      return new KafkaConnector(config as KafkaConfig)
    case "api":
      return new APIConnector(config as APIConfig)
    case "salesforce":
      return new SalesforceConnector(config as SalesforceConfig)
    case "hubspot":
      return new HubSpotConnector(config as HubSpotConfig)
    case "stripe":
      return new StripeConnector(config as StripeConfig)
    case "shopify":
      return new ShopifyConnector(config as ShopifyConfig)
    default:
      console.warn(`Connector type ${config.type} not implemented`)
      return null
  }
}

// ============================================
// Connection Manager
// ============================================

export class ConnectionManager {
  private static connections = new Map<string, IConnector>()

  static async getConnection(id: string, config: ConnectionConfig): Promise<IConnector | null> {
    if (this.connections.has(id)) {
      return this.connections.get(id) || null
    }

    const connector = createConnector(config)
    if (!connector) return null

    const connected = await connector.connect()
    if (!connected) return null

    this.connections.set(id, connector)
    return connector
  }

  static async closeConnection(id: string): Promise<void> {
    const connector = this.connections.get(id)
    if (connector) {
      await connector.disconnect()
      this.connections.delete(id)
    }
  }

  static async closeAll(): Promise<void> {
    for (const [id] of this.connections) {
      await this.closeConnection(id)
    }
  }

  static getActiveConnections(): string[] {
    return Array.from(this.connections.keys())
  }
}
