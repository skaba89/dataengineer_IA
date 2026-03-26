/**
 * DataSphere Innovation - MongoDB Connector
 * Complete implementation for MongoDB database connections
 */

import { MongoClient, Db, Collection, Document, MongoClientOptions } from 'mongodb'

export interface MongoDBConnectionConfig {
  uri?: string
  host?: string
  port?: number
  database: string
  user?: string
  password?: string
  replicaSet?: string
  ssl?: boolean
  authSource?: string
  options?: MongoClientOptions
}

export interface MongoDBCollectionSchema {
  collectionName: string
  documentCount: number
  avgDocumentSize: number
  totalSize: number
  indexes: MongoDBIndexInfo[]
  schema: MongoDBSchemaField[]
  validationRules?: object
}

export interface MongoDBSchemaField {
  path: string
  types: string[]
  count: number
  probability: number
  sampleValues: unknown[]
  nestedFields?: MongoDBSchemaField[]
}

export interface MongoDBIndexInfo {
  name: string
  keys: { field: string; direction: number }[]
  unique: boolean
  sparse: boolean
  background: boolean
  partialFilterExpression?: object
}

export interface MongoDBDataProfile {
  collectionName: string
  fieldName: string
  types: string[]
  nullCount: number
  nullPercent: number
  distinctCount: number
  sampleValues: unknown[]
  minValue?: unknown
  maxValue?: unknown
  avgValue?: number
}

export interface MongoDBQueryResult {
  acknowledged: boolean
  matchedCount?: number
  modifiedCount?: number
  upsertedId?: unknown
  insertedCount?: number
  deletedCount?: number
  documents?: Document[]
}

/**
 * MongoDB Connector Class
 */
export class MongoDBConnector {
  private client: MongoClient | null = null
  private db: Db | null = null
  private config: MongoDBConnectionConfig

  constructor(config: MongoDBConnectionConfig) {
    this.config = config
  }

  /**
   * Build connection URI from config
   */
  private buildUri(): string {
    if (this.config.uri) {
      return this.config.uri
    }

    const { host = 'localhost', port = 27017, user, password, database, replicaSet, ssl } = this.config
    
    let uri = 'mongodb://'
    
    if (user && password) {
      uri += `${encodeURIComponent(user)}:${encodeURIComponent(password)}@`
    }
    
    uri += `${host}:${port}/${database}`
    
    const params: string[] = []
    if (replicaSet) params.push(`replicaSet=${replicaSet}`)
    if (ssl) params.push('ssl=true')
    if (this.config.authSource) params.push(`authSource=${this.config.authSource}`)
    
    if (params.length > 0) {
      uri += '?' + params.join('&')
    }
    
    return uri
  }

  /**
   * Establish connection to MongoDB
   */
  async connect(): Promise<boolean> {
    try {
      const uri = this.buildUri()
      
      const options: MongoClientOptions = {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        ...this.config.options,
      }

      this.client = new MongoClient(uri, options)
      await this.client.connect()
      
      this.db = this.client.db(this.config.database)
      
      // Verify connection
      await this.db.command({ ping: 1 })
      
      return true
    } catch (error) {
      console.error('MongoDB connection error:', error)
      return false
    }
  }

  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }

  /**
   * Test connection and return server info
   */
  async testConnection(): Promise<{ success: boolean; message: string; version?: string }> {
    try {
      if (!this.client) {
        const connected = await this.connect()
        if (!connected) {
          return { success: false, message: 'Failed to establish connection' }
        }
      }

      const adminDb = this.client!.db().admin()
      const serverInfo = await adminDb.serverInfo()
      
      return {
        success: true,
        message: `Connected successfully to MongoDB`,
        version: serverInfo.version,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      }
    }
  }

  /**
   * Get all collections in the database
   */
  async getCollections(): Promise<MongoDBCollectionSchema[]> {
    if (!this.db) throw new Error('Not connected to database')

    const collections = await this.db.listCollections().toArray()
    const result: MongoDBCollectionSchema[] = []

    for (const coll of collections) {
      if (coll.type === 'collection' || !coll.type) {
        const schema = await this.getCollectionSchema(coll.name)
        result.push(schema)
      }
    }

    return result
  }

  /**
   * Get detailed schema for a specific collection
   */
  async getCollectionSchema(collectionName: string): Promise<MongoDBCollectionSchema> {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    
    // Get stats
    const stats = await collection.aggregate([
      { $collStats: { latencyStats: { histograms: false }, storageStats: {} } }
    ]).toArray()

    const storageStats = stats[0]?.storageStats || {}
    
    // Get indexes
    const indexes = await this.getIndexes(collectionName)
    
    // Infer schema from sample documents
    const schema = await this.inferSchema(collectionName)

    return {
      collectionName,
      documentCount: storageStats.count || 0,
      avgDocumentSize: storageStats.avgObjSize || 0,
      totalSize: storageStats.size || 0,
      indexes,
      schema,
      validationRules: stats[0]?.validation,
    }
  }

  /**
   * Get indexes for a collection
   */
  async getIndexes(collectionName: string): Promise<MongoDBIndexInfo[]> {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    const indexes = await collection.indexes()

    return indexes.map((idx) => ({
      name: idx.name || '',
      keys: Object.entries(idx.key).map(([field, direction]) => ({ field, direction: direction as number })),
      unique: idx.unique || false,
      sparse: idx.sparse || false,
      background: idx.background || false,
      partialFilterExpression: idx.partialFilterExpression,
    }))
  }

  /**
   * Infer schema from sample documents
   */
  async inferSchema(collectionName: string, sampleSize: number = 100): Promise<MongoDBSchemaField[]> {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    const documents = await collection.aggregate([
      { $sample: { size: sampleSize } }
    ]).toArray()

    return this.analyzeDocuments(documents)
  }

  /**
   * Analyze documents to infer field types
   */
  private analyzeDocuments(documents: Document[]): MongoDBSchemaField[] {
    const fieldAnalysis = new Map<string, { types: Map<string, number>; values: unknown[]; count: number }>()

    const analyzeObject = (obj: Document, prefix: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key
        
        if (!fieldAnalysis.has(path)) {
          fieldAnalysis.set(path, { types: new Map(), values: [], count: 0 })
        }
        
        const field = fieldAnalysis.get(path)!
        field.count++
        
        const type = this.getValueType(value)
        field.types.set(type, (field.types.get(type) || 0) + 1)
        
        if (field.values.length < 10 && value !== null && value !== undefined) {
          field.values.push(value)
        }
        
        // Recursively analyze nested objects
        if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
          analyzeObject(value, path)
        }
      }
    }

    for (const doc of documents) {
      analyzeObject(doc)
    }

    return Array.from(fieldAnalysis.entries()).map(([path, data]) => ({
      path,
      types: Array.from(data.types.keys()),
      count: data.count,
      probability: data.count / documents.length,
      sampleValues: data.values.slice(0, 10),
    }))
  }

  /**
   * Get value type name
   */
  private getValueType(value: unknown): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (Array.isArray(value)) return 'array'
    if (value instanceof Date) return 'date'
    if (value instanceof ObjectId) return 'objectId'
    if (Buffer.isBuffer(value)) return 'binary'
    if (typeof value === 'object') return 'object'
    return typeof value
  }

  /**
   * Profile collection data
   */
  async profileCollection(collectionName: string, sampleSize: number = 1000): Promise<MongoDBDataProfile[]> {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    const documents = await collection.aggregate([
      { $sample: { size: sampleSize } }
    ]).toArray()

    const profiles: MongoDBDataProfile[] = []
    const fieldStats = new Map<string, { types: Map<string, number>; values: unknown[]; nullCount: number }>()

    // Analyze each document
    for (const doc of documents) {
      for (const [key, value] of Object.entries(doc)) {
        if (!fieldStats.has(key)) {
          fieldStats.set(key, { types: new Map(), values: [], nullCount: 0 })
        }
        
        const stats = fieldStats.get(key)!
        const type = this.getValueType(value)
        stats.types.set(type, (stats.types.get(type) || 0) + 1)
        
        if (value === null || value === undefined) {
          stats.nullCount++
        } else if (stats.values.length < 10) {
          stats.values.push(value)
        }
      }
    }

    // Build profiles
    for (const [fieldName, stats] of fieldStats) {
      // Get distinct count via aggregation
      const distinctResult = await collection.aggregate([
        { $group: { _id: `$${fieldName}` } },
        { $count: 'distinctCount' }
      ]).toArray()
      
      const distinctCount = distinctResult[0]?.distinctCount || 0

      profiles.push({
        collectionName,
        fieldName,
        types: Array.from(stats.types.keys()),
        nullCount: stats.nullCount,
        nullPercent: (stats.nullCount / documents.length) * 100,
        distinctCount,
        sampleValues: stats.values.slice(0, 10),
      })
    }

    return profiles
  }

  /**
   * Execute aggregation pipeline
   */
  async aggregate(collectionName: string, pipeline: Document[]): Promise<Document[]> {
    if (!this.db) throw new Error('Not connected to database')
    
    const collection = this.db.collection(collectionName)
    return collection.aggregate(pipeline).toArray()
  }

  /**
   * Find documents
   */
  async find(
    collectionName: string,
    filter: Document = {},
    options: { limit?: number; skip?: number; sort?: Document; projection?: Document } = {}
  ): Promise<Document[]> {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    let cursor = collection.find(filter)

    if (options.sort) cursor = cursor.sort(options.sort)
    if (options.skip) cursor = cursor.skip(options.skip)
    if (options.limit) cursor = cursor.limit(options.limit)
    if (options.projection) cursor = cursor.project(options.projection)

    return cursor.toArray()
  }

  /**
   * Insert document(s)
   */
  async insert(collectionName: string, documents: Document | Document[]): Promise<MongoDBQueryResult> {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    
    if (Array.isArray(documents)) {
      const result = await collection.insertMany(documents)
      return {
        acknowledged: result.acknowledged,
        insertedCount: result.insertedCount,
      }
    } else {
      const result = await collection.insertOne(documents)
      return {
        acknowledged: result.acknowledged,
        insertedCount: 1,
      }
    }
  }

  /**
   * Update document(s)
   */
  async update(
    collectionName: string,
    filter: Document,
    update: Document,
    options: { upsert?: boolean; multi?: boolean } = {}
  ): Promise<MongoDBQueryResult> {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    
    if (options.multi) {
      const result = await collection.updateMany(filter, update, { upsert: options.upsert })
      return {
        acknowledged: result.acknowledged,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedId: result.upsertedId,
      }
    } else {
      const result = await collection.updateOne(filter, update, { upsert: options.upsert })
      return {
        acknowledged: result.acknowledged,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedId: result.upsertedId,
      }
    }
  }

  /**
   * Delete document(s)
   */
  async delete(collectionName: string, filter: Document, multi: boolean = false): Promise<MongoDBQueryResult> {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    
    if (multi) {
      const result = await collection.deleteMany(filter)
      return {
        acknowledged: result.acknowledged,
        deletedCount: result.deletedCount,
      }
    } else {
      const result = await collection.deleteOne(filter)
      return {
        acknowledged: result.acknowledged,
        deletedCount: result.deletedCount,
      }
    }
  }

  /**
   * Get document count
   */
  async count(collectionName: string, filter: Document = {}): Promise<number> {
    if (!this.db) throw new Error('Not connected to database')
    
    const collection = this.db.collection(collectionName)
    return collection.countDocuments(filter)
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(): Promise<{ name: string; count: number; size: number }[]> {
    if (!this.db) throw new Error('Not connected to database')

    const collections = await this.db.listCollections().toArray()
    const stats = []

    for (const coll of collections) {
      const count = await this.db!.collection(coll.name).countDocuments()
      const stat = await this.db!.collection(coll.name).stats()
      
      stats.push({
        name: coll.name,
        count,
        size: stat.size || 0,
      })
    }

    return stats.sort((a, b) => b.size - a.size)
  }
}

// Import ObjectId for type checking
import { ObjectId } from 'mongodb'

export default MongoDBConnector
