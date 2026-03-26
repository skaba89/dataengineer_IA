// AI Data Engineering System - Database Connectors

import { Pool, PoolClient, QueryResult } from 'pg';

// Types
export interface ConnectionConfig {
  type: 'postgresql' | 'mysql' | 'bigquery' | 'snowflake' | 'redshift';
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  connectionString?: string;
  projectId?: string; // For BigQuery
  keyFilename?: string; // For BigQuery
  schema?: string;
}

export interface TableSchema {
  tableName: string;
  schema?: string;
  columns: ColumnInfo[];
  rowCount?: number;
  primaryKey?: string[];
  foreignKeys?: ForeignKeyInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  description?: string;
}

export interface ForeignKeyInfo {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
}

export interface DataProfile {
  tableName: string;
  columnName: string;
  dataType: string;
  nullCount: number;
  nullPercent: number;
  distinctCount: number;
  sampleValues: unknown[];
  minValue?: unknown;
  maxValue?: unknown;
  avgValue?: number;
}

// Base Connector Interface
export interface IDatabaseConnector {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  testConnection(): Promise<{ success: boolean; message: string }>;
  getTables(): Promise<TableSchema[]>;
  getTableSchema(tableName: string): Promise<TableSchema>;
  profileTable(tableName: string): Promise<DataProfile[]>;
  executeQuery(query: string): Promise<QueryResult>;
  getRowCount(tableName: string): Promise<number>;
}

// PostgreSQL Connector
export class PostgreSQLConnector implements IDatabaseConnector {
  private pool: Pool | null = null;
  private config: ConnectionConfig;

  constructor(config: ConnectionConfig) {
    this.config = config;
  }

  async connect(): Promise<boolean> {
    try {
      this.pool = new Pool({
        connectionString: this.config.connectionString,
        host: this.config.host,
        port: this.config.port || 5432,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Test connection
      const client = await this.pool.connect();
      client.release();
      return true;
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.pool) {
        const connected = await this.connect();
        if (!connected) {
          return { success: false, message: 'Failed to establish connection' };
        }
      }

      const result = await this.pool!.query('SELECT NOW() as time, version() as version');
      return {
        success: true,
        message: `Connected successfully. PostgreSQL ${result.rows[0].version.split(' ')[1]}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async getTables(): Promise<TableSchema[]> {
    const query = `
      SELECT 
        table_schema,
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name, ordinal_position
    `;

    const result = await this.pool!.query(query);
    const tables: Map<string, TableSchema> = new Map();

    for (const row of result.rows) {
      const key = `${row.table_schema}.${row.table_name}`;
      
      if (!tables.has(key)) {
        tables.set(key, {
          tableName: row.table_name,
          schema: row.table_schema,
          columns: [],
        });
      }

      const table = tables.get(key)!;
      table.columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        defaultValue: row.column_default,
      });
    }

    return Array.from(tables.values());
  }

  async getTableSchema(tableName: string, schema: string = 'public'): Promise<TableSchema> {
    const columnQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `;

    const pkQuery = `
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = '${schema}.${tableName}'::regclass AND i.indisprimary
    `;

    const fkQuery = `
      SELECT
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
    `;

    const [columnsResult, pkResult, fkResult] = await Promise.all([
      this.pool!.query(columnQuery, [schema, tableName]),
      this.pool!.query(pkQuery),
      this.pool!.query(fkQuery, [schema, tableName]),
    ]);

    const primaryKeys = pkResult.rows.map((r) => r.attname);
    const foreignKeys = fkResult.rows.map((r) => ({
      columns: [r.column_name],
      referencedTable: r.foreign_table,
      referencedColumns: [r.foreign_column],
    }));

    return {
      tableName,
      schema,
      columns: columnsResult.rows.map((row) => ({
        name: row.column_name,
        type: row.data_type + (row.character_maximum_length ? `(${row.character_maximum_length})` : ''),
        nullable: row.is_nullable === 'YES',
        defaultValue: row.column_default,
        isPrimaryKey: primaryKeys.includes(row.column_name),
      })),
      primaryKey: primaryKeys,
      foreignKeys,
    };
  }

  async profileTable(tableName: string, schema: string = 'public'): Promise<DataProfile[]> {
    const tableSchema = await this.getTableSchema(tableName, schema);
    const profiles: DataProfile[] = [];

    for (const column of tableSchema.columns) {
      const fullTableName = `"${schema}"."${tableName}"`;
      
      // Get basic stats
      const statsQuery = `
        SELECT 
          COUNT(*) as total_rows,
          COUNT("${column.name}") as non_null_count,
          COUNT(DISTINCT "${column.name}") as distinct_count,
          MIN("${column.name}") as min_val,
          MAX("${column.name}") as max_val
        FROM ${fullTableName}
      `;

      const stats = await this.pool!.query(statsQuery);
      const row = stats.rows[0];

      // Get sample values
      const sampleQuery = `
        SELECT DISTINCT "${column.name}" 
        FROM ${fullTableName} 
        WHERE "${column.name}" IS NOT NULL 
        LIMIT 10
      `;
      const sample = await this.pool!.query(sampleQuery);

      const totalRows = parseInt(row.total_rows) || 0;
      const nonNullCount = parseInt(row.non_null_count) || 0;

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
      });
    }

    return profiles;
  }

  async executeQuery(query: string): Promise<QueryResult> {
    return this.pool!.query(query);
  }

  async getRowCount(tableName: string, schema: string = 'public'): Promise<number> {
    const result = await this.pool!.query(`SELECT COUNT(*) FROM "${schema}"."${tableName}"`);
    return parseInt(result.rows[0].count) || 0;
  }
}

// MySQL Connector (similar structure)
export class MySQLConnector implements IDatabaseConnector {
  private config: ConnectionConfig;

  constructor(config: ConnectionConfig) {
    this.config = config;
  }

  async connect(): Promise<boolean> {
    // MySQL connection would use mysql2 package
    console.log('MySQL connector not fully implemented');
    return false;
  }

  async disconnect(): Promise<void> {}

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return { success: false, message: 'MySQL connector not implemented' };
  }

  async getTables(): Promise<TableSchema[]> {
    return [];
  }

  async getTableSchema(tableName: string): Promise<TableSchema> {
    return { tableName, columns: [] };
  }

  async profileTable(tableName: string): Promise<DataProfile[]> {
    return [];
  }

  async executeQuery(query: string): Promise<QueryResult> {
    return { rows: [], rowCount: 0 } as QueryResult;
  }

  async getRowCount(tableName: string): Promise<number> {
    return 0;
  }
}

// Factory function to create connector
export function createConnector(config: ConnectionConfig): IDatabaseConnector {
  switch (config.type) {
    case 'postgresql':
      return new PostgreSQLConnector(config);
    case 'mysql':
      return new MySQLConnector(config);
    case 'bigquery':
      // Would implement BigQuery connector
      throw new Error('BigQuery connector not yet implemented');
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}

// Connection string parser
export function parseConnectionString(connectionString: string): Partial<ConnectionConfig> {
  try {
    const url = new URL(connectionString);
    return {
      type: url.protocol.replace(':', '') as ConnectionConfig['type'],
      host: url.hostname,
      port: parseInt(url.port) || undefined,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
    };
  } catch {
    return {};
  }
}
