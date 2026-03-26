// @ts-nocheck
/**
 * DataSphere Innovation - MySQL Connector
 * Complete implementation for MySQL database connections
 */

import mysql, { Pool, PoolConnection, RowDataPacket, FieldPacket } from 'mysql2/promise'

export interface MySQLConnectionConfig {
  host: string
  port?: number
  database: string
  user: string
  password: string
  connectionString?: string
  ssl?: boolean | object
  charset?: string
  timezone?: string
}

export interface MySQLTableSchema {
  tableName: string
  schema?: string
  columns: MySQLColumnInfo[]
  rowCount?: number
  primaryKey?: string[]
  foreignKeys?: MySQLForeignKeyInfo[]
  indexes?: MySQLIndexInfo[]
}

export interface MySQLColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string | null
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  autoIncrement?: boolean
  comment?: string
  characterSet?: string
  collation?: string
}

export interface MySQLForeignKeyInfo {
  name: string
  columns: string[]
  referencedTable: string
  referencedColumns: string[]
  onUpdate: string
  onDelete: string
}

export interface MySQLIndexInfo {
  name: string
  columns: string[]
  unique: boolean
  type: string
}

export interface MySQLDataProfile {
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
  sumValue?: number
}

export interface MySQLQueryResult {
  rows: RowDataPacket[]
  fields: FieldPacket[]
  affectedRows?: number
  insertId?: number
}

/**
 * MySQL Connector Class
 */
export class MySQLConnector {
  private pool: Pool | null = null
  private config: MySQLConnectionConfig

  constructor(config: MySQLConnectionConfig) {
    this.config = config
  }

  /**
   * Establish connection to MySQL
   */
  async connect(): Promise<boolean> {
    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port || 3306,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        connectionString: this.config.connectionString,
        ssl: this.config.ssl,
        charset: this.config.charset || 'utf8mb4',
        timezone: this.config.timezone || 'local',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 30000,
      })

      // Test connection
      const connection = await this.pool.getConnection()
      await connection.ping()
      connection.release()

      return true
    } catch (error) {
      console.error('MySQL connection error:', error)
      return false
    }
  }

  /**
   * Close connection pool
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }
  }

  /**
   * Test connection and return server info
   */
  async testConnection(): Promise<{ success: boolean; message: string; version?: string }> {
    try {
      if (!this.pool) {
        const connected = await this.connect()
        if (!connected) {
          return { success: false, message: 'Failed to establish connection' }
        }
      }

      const [rows] = await this.pool!.execute<RowDataPacket[]>('SELECT VERSION() as version, NOW() as time')
      
      return {
        success: true,
        message: `Connected successfully to MySQL`,
        version: rows[0].version,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      }
    }
  }

  /**
   * Get all tables in the database
   */
  async getTables(): Promise<MySQLTableSchema[]> {
    const query = `
      SELECT 
        TABLE_SCHEMA as table_schema,
        TABLE_NAME as table_name,
        TABLE_TYPE as table_type,
        TABLE_ROWS as table_rows,
        TABLE_COMMENT as table_comment
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `

    const [tables] = await this.pool!.execute<RowDataPacket[]>(query, [this.config.database])
    const result: MySQLTableSchema[] = []

    for (const table of tables) {
      const schema = await this.getTableSchema(table.table_name)
      schema.rowCount = table.table_rows
      result.push(schema)
    }

    return result
  }

  /**
   * Get detailed schema for a specific table
   */
  async getTableSchema(tableName: string): Promise<MySQLTableSchema> {
    // Get columns
    const columnQuery = `
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_KEY,
        EXTRA,
        COLUMN_COMMENT,
        CHARACTER_SET_NAME,
        COLLATION_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `

    // Get primary keys
    const pkQuery = `
      SELECT COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = 'PRIMARY'
      ORDER BY ORDINAL_POSITION
    `

    // Get foreign keys
    const fkQuery = `
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME,
        UPDATE_RULE,
        DELETE_RULE
      FROM information_schema.KEY_COLUMN_USAGE kcu
      JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
        AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
      WHERE kcu.TABLE_SCHEMA = ?
        AND kcu.TABLE_NAME = ?
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    `

    // Get indexes
    const indexQuery = `
      SELECT 
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE,
        INDEX_TYPE
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `

    const [columns, primaryKeys, foreignKeys, indexes] = await Promise.all([
      this.pool!.execute<RowDataPacket[]>(columnQuery, [this.config.database, tableName]),
      this.pool!.execute<RowDataPacket[]>(pkQuery, [this.config.database, tableName]),
      this.pool!.execute<RowDataPacket[]>(fkQuery, [this.config.database, tableName]),
      this.pool!.execute<RowDataPacket[]>(indexQuery, [this.config.database, tableName]),
    ])

    const pkColumns = primaryKeys[0].map((r) => r.COLUMN_NAME)
    
    // Group indexes
    const indexMap = new Map<string, MySQLIndexInfo>()
    for (const idx of indexes[0]) {
      if (!indexMap.has(idx.INDEX_NAME)) {
        indexMap.set(idx.INDEX_NAME, {
          name: idx.INDEX_NAME,
          columns: [],
          unique: idx.NON_UNIQUE === 0,
          type: idx.INDEX_TYPE,
        })
      }
      indexMap.get(idx.INDEX_NAME)!.columns.push(idx.COLUMN_NAME)
    }

    // Group foreign keys by constraint name
    const fkMap = new Map<string, MySQLForeignKeyInfo>()
    for (const fk of foreignKeys[0]) {
      if (!fkMap.has(fk.CONSTRAINT_NAME)) {
        fkMap.set(fk.CONSTRAINT_NAME, {
          name: fk.CONSTRAINT_NAME,
          columns: [],
          referencedTable: fk.REFERENCED_TABLE_NAME,
          referencedColumns: [],
          onUpdate: fk.UPDATE_RULE,
          onDelete: fk.DELETE_RULE,
        })
      }
      fkMap.get(fk.CONSTRAINT_NAME)!.columns.push(fk.COLUMN_NAME)
      fkMap.get(fk.CONSTRAINT_NAME)!.referencedColumns.push(fk.REFERENCED_COLUMN_NAME)
    }

    return {
      tableName,
      columns: columns[0].map((col) => ({
        name: col.COLUMN_NAME,
        type: col.COLUMN_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        defaultValue: col.COLUMN_DEFAULT,
        isPrimaryKey: col.COLUMN_KEY === 'PRI',
        autoIncrement: col.EXTRA?.includes('auto_increment') || false,
        comment: col.COLUMN_COMMENT,
        characterSet: col.CHARACTER_SET_NAME,
        collation: col.COLLATION_NAME,
      })),
      primaryKey: pkColumns,
      foreignKeys: Array.from(fkMap.values()),
      indexes: Array.from(indexMap.values()),
    }
  }

  /**
   * Profile table data for quality analysis
   */
  async profileTable(tableName: string): Promise<MySQLDataProfile[]> {
    const schema = await this.getTableSchema(tableName)
    const profiles: MySQLDataProfile[] = []

    for (const column of schema.columns) {
      const columnName = column.name
      
      // Basic stats query
      const statsQuery = `
        SELECT 
          COUNT(*) as total_rows,
          COUNT(\`${columnName}\`) as non_null_count,
          COUNT(DISTINCT \`${columnName}\`) as distinct_count
        FROM \`${tableName}\`
      `

      const [statsResult] = await this.pool!.execute<RowDataPacket[]>(statsQuery)
      const stats = statsResult[0]

      // Numeric stats if applicable
      let numericStats = null
      if (this.isNumericType(column.type)) {
        const numQuery = `
          SELECT 
            MIN(\`${columnName}\`) as min_val,
            MAX(\`${columnName}\`) as max_val,
            AVG(\`${columnName}\`) as avg_val,
            SUM(\`${columnName}\`) as sum_val
          FROM \`${tableName}\`
          WHERE \`${columnName}\` IS NOT NULL
        `
        const [numResult] = await this.pool!.execute<RowDataPacket[]>(numQuery)
        numericStats = numResult[0]
      }

      // Sample values
      const sampleQuery = `
        SELECT DISTINCT \`${columnName}\`
        FROM \`${tableName}\`
        WHERE \`${columnName}\` IS NOT NULL
        LIMIT 10
      `
      const [sampleResult] = await this.pool!.execute<RowDataPacket[]>(sampleQuery)
      const sampleValues = sampleResult.map((r) => r[columnName])

      const totalRows = stats.total_rows || 0
      const nonNullCount = stats.non_null_count || 0

      profiles.push({
        tableName,
        columnName,
        dataType: column.type,
        nullCount: totalRows - nonNullCount,
        nullPercent: totalRows > 0 ? ((totalRows - nonNullCount) / totalRows) * 100 : 0,
        distinctCount: stats.distinct_count || 0,
        sampleValues,
        minValue: numericStats?.min_val,
        maxValue: numericStats?.max_val,
        avgValue: numericStats?.avg_val,
        sumValue: numericStats?.sum_val,
      })
    }

    return profiles
  }

  /**
   * Execute a query
   */
  async executeQuery(query: string, params?: unknown[]): Promise<MySQLQueryResult> {
    const [rows, fields] = await this.pool!.execute<RowDataPacket[]>(query, params)
    
    return {
      rows,
      fields,
      affectedRows: (rows as any).affectedRows,
      insertId: (rows as any).insertId,
    }
  }

  /**
   * Get row count for a table
   */
  async getRowCount(tableName: string): Promise<number> {
    const [result] = await this.pool!.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM \`${tableName}\``
    )
    return result[0].count
  }

  /**
   * Get sample data from table
   */
  async getSampleData(tableName: string, limit: number = 100): Promise<RowDataPacket[]> {
    const [rows] = await this.pool!.execute<RowDataPacket[]>(
      `SELECT * FROM \`${tableName}\` LIMIT ?`,
      [limit]
    )
    return rows
  }

  /**
   * Get table sizes
   */
  async getTableSizes(): Promise<{ tableName: string; sizeMB: number; rowCount: number }[]> {
    const query = `
      SELECT 
        TABLE_NAME as tableName,
        ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as sizeMB,
        TABLE_ROWS as rowCount
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
    `

    const [rows] = await this.pool!.execute<RowDataPacket[]>(query, [this.config.database])
    return rows as any[]
  }

  /**
   * Check if column type is numeric
   */
  private isNumericType(type: string): boolean {
    const numericTypes = [
      'int', 'integer', 'tinyint', 'smallint', 'mediumint', 'bigint',
      'float', 'double', 'decimal', 'dec', 'numeric', 'fixed',
      'bit', 'serial'
    ]
    const baseType = type.toLowerCase().split('(')[0].trim()
    return numericTypes.includes(baseType)
  }
}

export default MySQLConnector
