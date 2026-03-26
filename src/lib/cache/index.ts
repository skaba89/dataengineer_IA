/**
 * DataSphere Innovation - Advanced Caching System
 * 
 * Multi-layer caching with:
 * - In-memory LRU cache
 * - Redis distributed cache
 * - HTTP cache headers
 * - Query result caching
 * - Automatic cache invalidation
 */

import { LRUCache } from 'lru-cache'

// Types
export interface CacheConfig {
  ttl: number
  maxSize: number
  prefix?: string
  staleWhileRevalidate?: boolean
  refreshThreshold?: number
}

export interface CacheEntry<T> {
  value: T
  expiresAt: number
  createdAt: number
  tags: string[]
  etag?: string
  lastModified?: Date
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
}

// In-memory LRU cache
class MemoryCache<T = any> {
  private cache: LRUCache<string, CacheEntry<T>>
  private stats = { hits: 0, misses: 0 }

  constructor(maxSize: number = 1000) {
    this.cache = new LRUCache({
      max: maxSize,
      ttl: 1000 * 60 * 60, // 1 hour default
      updateAgeOnGet: true,
      updateAgeOnHas: true
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (entry) {
      if (Date.now() < entry.expiresAt) {
        this.stats.hits++
        return entry.value
      }
      this.cache.delete(key)
    }
    this.stats.misses++
    return null
  }

  set(key: string, value: T, ttl: number, tags: string[] = []): void {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
      tags,
      etag: this.generateETag(value)
    }
    this.cache.set(key, entry, { ttl })
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() >= entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  clear(): void {
    this.cache.clear()
  }

  clearByTag(tag: string): number {
    let cleared = 0
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
        cleared++
      }
    }
    return cleared
  }

  private generateETag(value: T): string {
    const str = JSON.stringify(value)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return `"${Math.abs(hash).toString(36)}"`
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0
    }
  }
}

// Redis cache adapter
class RedisCache<T = any> {
  private client: any
  private prefix: string
  private connected: boolean = false

  constructor(client?: any, prefix: string = 'cache:') {
    this.client = client
    this.prefix = prefix
    this.connected = !!client
  }

  async get(key: string): Promise<T | null> {
    if (!this.connected) return null
    
    try {
      const data = await this.client.get(`${this.prefix}${key}`)
      if (data) {
        const entry: CacheEntry<T> = JSON.parse(data)
        if (Date.now() < entry.expiresAt) {
          return entry.value
        }
        await this.delete(key)
      }
    } catch (error) {
      console.error('[RedisCache] Get error:', error)
    }
    return null
  }

  async set(key: string, value: T, ttl: number, tags: string[] = []): Promise<void> {
    if (!this.connected) return

    try {
      const entry: CacheEntry<T> = {
        value,
        expiresAt: Date.now() + ttl,
        createdAt: Date.now(),
        tags
      }
      
      await this.client.setex(
        `${this.prefix}${key}`,
        Math.ceil(ttl / 1000),
        JSON.stringify(entry)
      )

      // Store tag index
      if (tags.length > 0) {
        for (const tag of tags) {
          await this.client.sadd(`${this.prefix}tag:${tag}`, key)
        }
      }
    } catch (error) {
      console.error('[RedisCache] Set error:', error)
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.connected) return false
    
    try {
      await this.client.del(`${this.prefix}${key}`)
      return true
    } catch (error) {
      console.error('[RedisCache] Delete error:', error)
      return false
    }
  }

  async clearByTag(tag: string): Promise<number> {
    if (!this.connected) return 0

    try {
      const keys = await this.client.smembers(`${this.prefix}tag:${tag}`)
      if (keys.length > 0) {
        await this.client.del(keys.map((k: string) => `${this.prefix}${k}`))
        await this.client.del(`${this.prefix}tag:${tag}`)
      }
      return keys.length
    } catch (error) {
      console.error('[RedisCache] ClearByTag error:', error)
      return 0
    }
  }
}

// Multi-layer cache manager
export class CacheManager {
  private memoryCache: MemoryCache
  private redisCache: RedisCache
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: config.ttl || 3600000, // 1 hour
      maxSize: config.maxSize || 10000,
      prefix: config.prefix || 'ds:',
      staleWhileRevalidate: config.staleWhileRevalidate ?? true,
      refreshThreshold: config.refreshThreshold || 0.8
    }

    this.memoryCache = new MemoryCache(this.config.maxSize)
    this.redisCache = new RedisCache(undefined, this.config.prefix)
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryValue = this.memoryCache.get(key)
    if (memoryValue !== null) {
      return memoryValue as T
    }

    // Try Redis cache
    const redisValue = await this.redisCache.get<T>(key)
    if (redisValue !== null) {
      // Populate memory cache
      this.memoryCache.set(key, redisValue, this.config.ttl)
      return redisValue
    }

    return null
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number, tags?: string[]): Promise<void> {
    const actualTtl = ttl || this.config.ttl
    
    // Set in both caches
    this.memoryCache.set(key, value, actualTtl, tags)
    await this.redisCache.set(key, value, actualTtl, tags)
  }

  /**
   * Get or set value with callback
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl?: number,
    tags?: string[]
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await callback()
    await this.set(key, value, ttl, tags)
    return value
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)
    await this.redisCache.delete(key)
  }

  /**
   * Clear cache by tag
   */
  async clearByTag(tag: string): Promise<void> {
    this.memoryCache.clearByTag(tag)
    await this.redisCache.clearByTag(tag)
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return this.memoryCache.getStats()
  }

  /**
   * Generate cache key from parts
   */
  static key(...parts: (string | number | object)[]): string {
    return parts
      .map(part => {
        if (typeof part === 'object') {
          return JSON.stringify(part)
        }
        return String(part)
      })
      .join(':')
      .replace(/\s+/g, '')
      .toLowerCase()
  }
}

// Query cache decorator
export function Cached(ttl: number = 60000, tags: string[] = []) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const cache = new CacheManager()

    descriptor.value = async function (...args: any[]) {
      const key = CacheManager.key(propertyKey, ...args)
      return cache.getOrSet(
        key,
        () => originalMethod.apply(this, args),
        ttl,
        tags
      )
    }

    return descriptor
  }
}

// HTTP Cache headers helper
export function setCacheHeaders(
  response: Response,
  options: {
    maxAge?: number
    staleWhileRevalidate?: number
    isPublic?: boolean
    etag?: string
    lastModified?: Date
  } = {}
): Response {
  const {
    maxAge = 3600,
    staleWhileRevalidate = 86400,
    isPublic = false,
    etag,
    lastModified
  } = options

  const cacheControl = [
    isPublic ? 'public' : 'private',
    `max-age=${maxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`
  ].join(', ')

  response.headers.set('Cache-Control', cacheControl)
  
  if (etag) {
    response.headers.set('ETag', etag)
  }
  
  if (lastModified) {
    response.headers.set('Last-Modified', lastModified.toUTCString())
  }

  return response
}

// Export singleton instance
export const cache = new CacheManager()

// Export cache keys generator for common queries
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  organization: (id: string) => `org:${id}`,
  project: (id: string) => `project:${id}`,
  dataSource: (id: string) => `datasource:${id}`,
  pipeline: (id: string) => `pipeline:${id}`,
  dashboard: (id: string) => `dashboard:${id}`,
  apiKeys: (orgId: string) => `apikeys:${orgId}`,
  permissions: (userId: string, orgId: string) => `perms:${userId}:${orgId}`,
  auditLogs: (orgId: string, date: string) => `audit:${orgId}:${date}`,
  metrics: (type: string, period: string) => `metrics:${type}:${period}`
}
