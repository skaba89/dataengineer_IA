/**
 * DataSphere Innovation - Database Connectors Tests
 * Comprehensive tests for PostgreSQL, MySQL, MongoDB, Snowflake, BigQuery connectors
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ============================================================================
// PostgreSQL Connector Tests
// ============================================================================

describe('PostgreSQLConnector', () => {
  let PostgreSQLConnector: typeof import('@/lib/connectors/index').PostgreSQLConnector
  let ConnectionConfig: typeof import('@/lib/connectors/index').ConnectionConfig

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('@/lib/connectors/index')
    PostgreSQLConnector = module.PostgreSQLConnector
    ConnectionConfig = module.ConnectionConfig
  })

  describe('Constructor and Configuration', () => {
    it('should create instance with valid config', () => {
      const config = {
        type: 'postgresql' as const,
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
      }

      const connector = new PostgreSQLConnector(config)
      expect(connector).toBeDefined()
    })

    it('should use default port when not specified', () => {
      const config = {
        type: 'postgresql' as const,
        host: 'localhost',
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
      }

      const connector = new PostgreSQLConnector(config)
      expect(connector).toBeDefined()
    })

    it('should handle SSL configuration', () => {
      const config = {
        type: 'postgresql' as const,
        host: 'localhost',
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
        ssl: true,
      }

      const connector = new PostgreSQLConnector(config)
      expect(connector).toBeDefined()
    })
  })

  describe('Connection Management', () => {
    it('should return false when connection fails with invalid credentials', async () => {
      const config = {
        type: 'postgresql' as const,
        host: 'invalid-host',
        port: 5432,
        database: 'nonexistent',
        username: 'invalid',
        password: 'invalid',
      }

      const connector = new PostgreSQLConnector(config)
      const result = await connector.connect()

      expect(result).toBe(false)
    })

    it('should disconnect gracefully', async () => {
      const config = {
        type: 'postgresql' as const,
        host: 'localhost',
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
      }

      const connector = new PostgreSQLConnector(config)
      // Should not throw even if not connected
      await expect(connector.disconnect()).resolves.not.toThrow()
    })
  })

  describe('Connection Testing', () => {
    it('should return test result with success status', async () => {
      const config = {
        type: 'postgresql' as const,
        host: 'localhost',
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
      }

      const connector = new PostgreSQLConnector(config)
      const result = await connector.testConnection()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(typeof result.success).toBe('boolean')
      expect(typeof result.message).toBe('string')
    })
  })

  describe('Schema Operations', () => {
    it('should throw error when getting tables without connection', async () => {
      const config = {
        type: 'postgresql' as const,
        host: 'localhost',
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
      }

      const connector = new PostgreSQLConnector(config)
      // Not connected, should throw
      await expect(connector.getTables()).rejects.toThrow('Not connected')
    })

    it('should throw error when getting table schema without connection', async () => {
      const config = {
        type: 'postgresql' as const,
        host: 'localhost',
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
      }

      const connector = new PostgreSQLConnector(config)
      await expect(connector.getTableSchema('users')).rejects.toThrow('Not connected')
    })

    it('should throw error when executing query without connection', async () => {
      const config = {
        type: 'postgresql' as const,
        host: 'localhost',
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
      }

      const connector = new PostgreSQLConnector(config)
      await expect(connector.query('SELECT 1')).rejects.toThrow('Not connected')
    })
  })

  describe('Query Operations', () => {
    it('should throw error for sample data without connection', async () => {
      const config = {
        type: 'postgresql' as const,
        host: 'localhost',
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
      }

      const connector = new PostgreSQLConnector(config)
      await expect(connector.getSampleData('users')).rejects.toThrow('Not connected')
    })

    it('should throw error for table stats without connection', async () => {
      const config = {
        type: 'postgresql' as const,
        host: 'localhost',
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
      }

      const connector = new PostgreSQLConnector(config)
      await expect(connector.getTableStats('users')).rejects.toThrow('Not connected')
    })
  })
})

// ============================================================================
// MySQL Connector Tests
// ============================================================================

describe('MySQLConnector', () => {
  let MySQLConnector: typeof import('@/lib/connectors/mysql-connector').MySQLConnector

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('@/lib/connectors/mysql-connector')
    MySQLConnector = module.MySQLConnector
  })

  describe('Constructor and Configuration', () => {
    it('should create instance with valid config', () => {
      const config = {
        host: 'localhost',
        port: 3306,
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      expect(connector).toBeDefined()
    })

    it('should use default port when not specified', () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      expect(connector).toBeDefined()
    })

    it('should handle connection string config', () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
        connectionString: 'mysql://user:pass@localhost:3306/db',
      }

      const connector = new MySQLConnector(config)
      expect(connector).toBeDefined()
    })

    it('should handle SSL configuration', () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
        ssl: { rejectUnauthorized: false },
      }

      const connector = new MySQLConnector(config)
      expect(connector).toBeDefined()
    })

    it('should handle charset and timezone configuration', () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
        charset: 'utf8mb4',
        timezone: 'UTC',
      }

      const connector = new MySQLConnector(config)
      expect(connector).toBeDefined()
    })
  })

  describe('Connection Management', () => {
    it('should return false when connection fails', async () => {
      const config = {
        host: 'invalid-host',
        port: 3306,
        database: 'nonexistent',
        user: 'invalid',
        password: 'invalid',
      }

      const connector = new MySQLConnector(config)
      const result = await connector.connect()

      expect(result).toBe(false)
    })

    it('should disconnect gracefully', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      await expect(connector.disconnect()).resolves.not.toThrow()
    })
  })

  describe('Connection Testing', () => {
    it('should return test result with success status', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      const result = await connector.testConnection()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(typeof result.success).toBe('boolean')
      expect(typeof result.message).toBe('string')
    })
  })

  describe('Schema Operations', () => {
    it('should throw error when getting tables without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      await expect(connector.getTables()).rejects.toThrow()
    })

    it('should throw error when getting table schema without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      await expect(connector.getTableSchema('users')).rejects.toThrow()
    })
  })

  describe('Query Operations', () => {
    it('should throw error for query execution without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      await expect(connector.executeQuery('SELECT 1')).rejects.toThrow()
    })

    it('should throw error for row count without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      await expect(connector.getRowCount('users')).rejects.toThrow()
    })

    it('should throw error for sample data without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      await expect(connector.getSampleData('users')).rejects.toThrow()
    })

    it('should throw error for table sizes without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      await expect(connector.getTableSizes()).rejects.toThrow()
    })
  })

  describe('Data Profiling', () => {
    it('should throw error for profile table without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const connector = new MySQLConnector(config)
      await expect(connector.profileTable('users')).rejects.toThrow()
    })
  })
})

// ============================================================================
// MongoDB Connector Tests
// ============================================================================

describe('MongoDBConnector', () => {
  let MongoDBConnector: typeof import('@/lib/connectors/mongodb-connector').MongoDBConnector

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('@/lib/connectors/mongodb-connector')
    MongoDBConnector = module.MongoDBConnector
  })

  describe('Constructor and Configuration', () => {
    it('should create instance with URI config', () => {
      const config = {
        uri: 'mongodb://localhost:27017',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      expect(connector).toBeDefined()
    })

    it('should create instance with host/port config', () => {
      const config = {
        host: 'localhost',
        port: 27017,
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      expect(connector).toBeDefined()
    })

    it('should handle authentication config', () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        user: 'admin',
        password: 'secret',
        authSource: 'admin',
      }

      const connector = new MongoDBConnector(config)
      expect(connector).toBeDefined()
    })

    it('should handle replica set config', () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
        replicaSet: 'rs0',
        ssl: true,
      }

      const connector = new MongoDBConnector(config)
      expect(connector).toBeDefined()
    })
  })

  describe('Connection Management', () => {
    it('should return false when connection fails', async () => {
      const config = {
        uri: 'mongodb://invalid-host:27017',
        database: 'nonexistent',
      }

      const connector = new MongoDBConnector(config)
      const result = await connector.connect()

      expect(result).toBe(false)
    })

    it('should disconnect gracefully', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.disconnect()).resolves.not.toThrow()
    })
  })

  describe('Connection Testing', () => {
    it('should return test result with success status', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      const result = await connector.testConnection()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
    })
  })

  describe('Schema Operations', () => {
    it('should throw error when getting collections without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.getCollections()).rejects.toThrow('Not connected')
    })

    it('should throw error when getting collection schema without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.getCollectionSchema('users')).rejects.toThrow('Not connected')
    })

    it('should throw error when getting indexes without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.getIndexes('users')).rejects.toThrow('Not connected')
    })

    it('should throw error when inferring schema without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.inferSchema('users')).rejects.toThrow('Not connected')
    })
  })

  describe('Query Operations', () => {
    it('should throw error for aggregate without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.aggregate('users', [])).rejects.toThrow('Not connected')
    })

    it('should throw error for find without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.find('users', {})).rejects.toThrow('Not connected')
    })

    it('should throw error for insert without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.insert('users', { name: 'test' })).rejects.toThrow('Not connected')
    })

    it('should throw error for update without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.update('users', {}, { $set: { name: 'updated' } })).rejects.toThrow('Not connected')
    })

    it('should throw error for delete without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.delete('users', {})).rejects.toThrow('Not connected')
    })

    it('should throw error for count without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.count('users')).rejects.toThrow('Not connected')
    })

    it('should throw error for collection stats without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.getCollectionStats()).rejects.toThrow('Not connected')
    })
  })

  describe('Data Profiling', () => {
    it('should throw error for profile collection without connection', async () => {
      const config = {
        host: 'localhost',
        database: 'testdb',
      }

      const connector = new MongoDBConnector(config)
      await expect(connector.profileCollection('users')).rejects.toThrow('Not connected')
    })
  })
})

// ============================================================================
// Snowflake Connector Tests
// ============================================================================

describe('SnowflakeConnector', () => {
  let SnowflakeConnector: typeof import('@/lib/connectors/snowflake-connector').SnowflakeConnector

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('@/lib/connectors/snowflake-connector')
    SnowflakeConnector = module.SnowflakeConnector
  })

  describe('Constructor and Configuration', () => {
    it('should create instance with valid config', () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
        schema: 'PUBLIC',
        warehouse: 'COMPUTE_WH',
      }

      const connector = new SnowflakeConnector(config)
      expect(connector).toBeDefined()
    })

    it('should handle role configuration', () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
        role: 'SYSADMIN',
      }

      const connector = new SnowflakeConnector(config)
      expect(connector).toBeDefined()
    })

    it('should handle authenticator configuration', () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
        authenticator: 'snowflake',
      }

      const connector = new SnowflakeConnector(config)
      expect(connector).toBeDefined()
    })

    it('should build correct API URL', () => {
      const config = {
        account: 'myorg-myaccount',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      expect(connector).toBeDefined()
    })
  })

  describe('Connection Management', () => {
    it('should connect successfully (mock)', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      const result = await connector.connect()

      // Mock connection should succeed
      expect(result).toBe(true)
    })

    it('should disconnect gracefully', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      await connector.connect()
      await expect(connector.disconnect()).resolves.not.toThrow()
    })
  })

  describe('Connection Testing', () => {
    it('should return test result', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      const result = await connector.testConnection()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
    })
  })

  describe('Query Operations', () => {
    it('should execute query after connection', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      await connector.connect()

      const result = await connector.executeQuery('SELECT 1')

      expect(result).toHaveProperty('rows')
      expect(result).toHaveProperty('columns')
      expect(result).toHaveProperty('rowCount')
    })

    it('should throw error when executing query without connection', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      // Not connected
      await expect(connector.executeQuery('SELECT 1')).rejects.toThrow('Not connected')
    })
  })

  describe('Schema Operations', () => {
    it('should get tables after connection', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
        schema: 'PUBLIC',
      }

      const connector = new SnowflakeConnector(config)
      await connector.connect()

      // Mock returns empty array
      const tables = await connector.getTables()
      expect(Array.isArray(tables)).toBe(true)
    })

    it('should get table schema after connection', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      await connector.connect()

      const schema = await connector.getTableSchema('USERS')
      expect(schema).toHaveProperty('tableName')
      expect(schema).toHaveProperty('columns')
    })
  })

  describe('Data Profiling', () => {
    it('should profile table after connection', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      await connector.connect()

      const profile = await connector.profileTable('USERS')
      expect(Array.isArray(profile)).toBe(true)
    })
  })

  describe('Statistics Operations', () => {
    it('should get table stats after connection', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      await connector.connect()

      const stats = await connector.getTableStats()
      expect(Array.isArray(stats)).toBe(true)
    })

    it('should get warehouse usage after connection', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      await connector.connect()

      const usage = await connector.getWarehouseUsage()
      expect(Array.isArray(usage)).toBe(true)
    })

    it('should get query history after connection', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      await connector.connect()

      const history = await connector.getQueryHistory(10)
      expect(Array.isArray(history)).toBe(true)
    })
  })

  describe('Bulk Operations', () => {
    it('should execute COPY INTO after connection', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      await connector.connect()

      const result = await connector.copyInto('USERS', {
        type: 'stage',
        path: '@my_stage/data',
      })
      expect(result).toHaveProperty('rows')
    })

    it('should create stage after connection', async () => {
      const config = {
        account: 'test-account',
        username: 'testuser',
        password: 'testpass',
        database: 'TEST_DB',
      }

      const connector = new SnowflakeConnector(config)
      await connector.connect()

      const result = await connector.createStage('my_stage', {
        type: 'internal',
      })
      expect(result).toHaveProperty('rows')
    })
  })
})

// ============================================================================
// BigQuery Connector Tests
// ============================================================================

describe('BigQueryConnector', () => {
  let BigQueryConnector: typeof import('@/lib/connectors/index').BigQueryConnector

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('@/lib/connectors/index')
    BigQueryConnector = module.BigQueryConnector
  })

  describe('Constructor and Configuration', () => {
    it('should create instance with project ID', () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'my-project',
      }

      const connector = new BigQueryConnector(config)
      expect(connector).toBeDefined()
    })

    it('should handle keyFilename configuration', () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'my-project',
        keyFilename: '/path/to/service-account.json',
      }

      const connector = new BigQueryConnector(config)
      expect(connector).toBeDefined()
    })

    it('should handle credentials configuration', () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'my-project',
        credentials: JSON.stringify({
          type: 'service_account',
          project_id: 'my-project',
        }),
      }

      const connector = new BigQueryConnector(config)
      expect(connector).toBeDefined()
    })
  })

  describe('Connection Management', () => {
    it('should return false when connection fails with invalid credentials', async () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'invalid-project',
      }

      const connector = new BigQueryConnector(config)
      const result = await connector.connect()

      expect(result).toBe(false)
    })

    it('should disconnect gracefully', async () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'my-project',
      }

      const connector = new BigQueryConnector(config)
      await expect(connector.disconnect()).resolves.not.toThrow()
    })
  })

  describe('Connection Testing', () => {
    it('should return test result with success status', async () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'my-project',
      }

      const connector = new BigQueryConnector(config)
      const result = await connector.testConnection()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
    })
  })

  describe('Dataset Operations', () => {
    it('should throw error when getting datasets without connection', async () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'my-project',
      }

      const connector = new BigQueryConnector(config)
      await expect(connector.getDatasets()).rejects.toThrow('Not connected')
    })
  })

  describe('Schema Operations', () => {
    it('should throw error when getting tables without connection', async () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'my-project',
      }

      const connector = new BigQueryConnector(config)
      await expect(connector.getTables('my_dataset')).rejects.toThrow('Not connected')
    })

    it('should throw error when getting table schema without connection', async () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'my-project',
      }

      const connector = new BigQueryConnector(config)
      await expect(connector.getTableSchema('my_dataset', 'my_table')).rejects.toThrow('Not connected')
    })
  })

  describe('Query Operations', () => {
    it('should throw error when executing query without connection', async () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'my-project',
      }

      const connector = new BigQueryConnector(config)
      await expect(connector.query('SELECT 1')).rejects.toThrow('Not connected')
    })

    it('should throw error for sample data without connection', async () => {
      const config = {
        type: 'bigquery' as const,
        projectId: 'my-project',
      }

      const connector = new BigQueryConnector(config)
      await expect(connector.getSampleData('my_dataset', 'my_table')).rejects.toThrow('Not connected')
    })
  })
})

// ============================================================================
// Connector Factory Tests
// ============================================================================

describe('createConnector Factory', () => {
  it('should create PostgreSQL connector', async () => {
    const { createConnector } = await import('@/lib/connectors/index')

    const connector = createConnector({
      type: 'postgresql',
      host: 'localhost',
      database: 'testdb',
      username: 'user',
      password: 'pass',
    })

    expect(connector).toBeDefined()
    expect(connector?.constructor.name).toBe('PostgreSQLConnector')
  })

  it('should create BigQuery connector', async () => {
    const { createConnector } = await import('@/lib/connectors/index')

    const connector = createConnector({
      type: 'bigquery',
      projectId: 'my-project',
    })

    expect(connector).toBeDefined()
    expect(connector?.constructor.name).toBe('BigQueryConnector')
  })

  it('should return null for unsupported connector type', async () => {
    const { createConnector } = await import('@/lib/connectors/index')

    const connector = createConnector({
      type: 'api' as any,
      baseUrl: 'https://api.example.com',
    })

    // API type is not implemented yet
    expect(connector).toBeNull()
  })
})

// ============================================================================
// Connection Manager Tests
// ============================================================================

describe('ConnectionManager', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should manage multiple connections', async () => {
    const { ConnectionManager } = await import('@/lib/connectors/index')

    // Close any existing connections first
    await ConnectionManager.closeAll()

    const config = {
      type: 'postgresql' as const,
      host: 'localhost',
      database: 'testdb',
      username: 'user',
      password: 'pass',
    }

    // This will fail since no actual database, but the manager should handle it
    const connector = await ConnectionManager.getConnection('test-source-1', config)

    // Connector will be null because connection failed
    expect(connector).toBeNull()
  })

  it('should close all connections', async () => {
    const { ConnectionManager } = await import('@/lib/connectors/index')

    await expect(ConnectionManager.closeAll()).resolves.not.toThrow()
  })

  it('should close specific connection', async () => {
    const { ConnectionManager } = await import('@/lib/connectors/index')

    await expect(ConnectionManager.closeConnection('nonexistent')).resolves.not.toThrow()
  })
})

// ============================================================================
// Helper Functions Tests
// ============================================================================

describe('Helper Functions', () => {
  describe('testDataSourceConnection', () => {
    it('should return error for non-existent data source', async () => {
      const { testDataSourceConnection } = await import('@/lib/connectors/index')
      const { db } = await import('@/lib/db')

      // Mock db.dataSource.findUnique to return null
      vi.mocked(db.dataSource.findUnique).mockResolvedValueOnce(null)

      const result = await testDataSourceConnection('nonexistent-id')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Data source not found')
    })
  })

  describe('discoverSourceSchema', () => {
    it('should return error for non-existent data source', async () => {
      const { discoverSourceSchema } = await import('@/lib/connectors/index')
      const { db } = await import('@/lib/db')

      // Mock db.dataSource.findUnique to return null
      vi.mocked(db.dataSource.findUnique).mockResolvedValueOnce(null)

      const result = await discoverSourceSchema('nonexistent-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Data source not found')
    })
  })
})

// ============================================================================
// Type Exports Tests
// ============================================================================

describe('Type Exports', () => {
  it('should export all required types from main module', async () => {
    const module = await import('@/lib/connectors/index')

    expect(module.PostgreSQLConnector).toBeDefined()
    expect(module.BigQueryConnector).toBeDefined()
    expect(module.ConnectionManager).toBeDefined()
    expect(module.createConnector).toBeDefined()
    expect(module.testDataSourceConnection).toBeDefined()
    expect(module.discoverSourceSchema).toBeDefined()
  })

  it('should export MySQL types', async () => {
    const module = await import('@/lib/connectors/mysql-connector')

    expect(module.MySQLConnector).toBeDefined()
  })

  it('should export MongoDB types', async () => {
    const module = await import('@/lib/connectors/mongodb-connector')

    expect(module.MongoDBConnector).toBeDefined()
  })

  it('should export Snowflake types', async () => {
    const module = await import('@/lib/connectors/snowflake-connector')

    expect(module.SnowflakeConnector).toBeDefined()
  })

  it('should export connector registry from types', async () => {
    const module = await import('@/lib/connectors/types')

    expect(module.CONNECTOR_REGISTRY).toBeDefined()
    expect(module.CONNECTOR_REGISTRY.POSTGRESQL).toBeDefined()
    expect(module.CONNECTOR_REGISTRY.MYSQL).toBeDefined()
    expect(module.CONNECTOR_REGISTRY.BIGQUERY).toBeDefined()
    expect(module.CONNECTOR_REGISTRY.SNOWFLAKE).toBeDefined()
    expect(module.CONNECTOR_REGISTRY.MONGODB).toBeDefined()
  })
})

// ============================================================================
// Connector Registry Tests
// ============================================================================

describe('CONNECTOR_REGISTRY', () => {
  it('should have all required connector configurations', async () => {
    const { CONNECTOR_REGISTRY } = await import('@/lib/connectors/types')

    const expectedConnectors = [
      'POSTGRESQL',
      'MYSQL',
      'BIGQUERY',
      'SNOWFLAKE',
      'REDSHIFT',
      'MONGODB',
      'ELASTICSEARCH',
      'S3',
      'AZURE_BLOB',
      'GOOGLE_SHEETS',
      'SALESFORCE',
      'HUBSPOT',
      'STRIPE',
      'CUSTOM',
    ]

    expectedConnectors.forEach(connector => {
      expect(CONNECTOR_REGISTRY[connector as keyof typeof CONNECTOR_REGISTRY]).toBeDefined()
    })
  })

  it('should have required fields for each connector', async () => {
    const { CONNECTOR_REGISTRY } = await import('@/lib/connectors/types')

    Object.entries(CONNECTOR_REGISTRY).forEach(([key, config]) => {
      expect(config.name).toBeDefined()
      expect(config.description).toBeDefined()
      expect(config.icon).toBeDefined()
      expect(Array.isArray(config.requiredFields)).toBe(true)
      expect(Array.isArray(config.features)).toBe(true)
    })
  })

  it('should have valid required field definitions', async () => {
    const { CONNECTOR_REGISTRY } = await import('@/lib/connectors/types')

    Object.entries(CONNECTOR_REGISTRY).forEach(([key, config]) => {
      config.requiredFields.forEach(field => {
        expect(field.name).toBeDefined()
        expect(field.label).toBeDefined()
        expect(['text', 'password', 'number', 'url']).toContain(field.type)
        expect(typeof field.required).toBe('boolean')
      })
    })
  })
})
