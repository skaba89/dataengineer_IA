/**
 * DataSphere Innovation - Redis Cache Service
 * Distributed caching and session management with Redis
 */

import { createClient } from 'redis'

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Singleton Redis client
let redisClient: ReturnType<typeof createClient> | null = null

/**
 * Get or create Redis client
 */
export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis connection failed after 10 retries')
            return new Error('Redis connection failed')
          }
          // Exponential backoff
          return Math.min(retries * 100, 3000)
        },
      },
    })

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err)
    })

    redisClient.on('connect', () => {
      console.log('Redis client connected')
    })

    await redisClient.connect()
  }

  return redisClient
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

/**
 * Cache service with Redis
 */
export class CacheService {
  private prefix: string
  private defaultTTL: number

  constructor(prefix: string = 'datasphere:', defaultTTL: number = 3600) {
    this.prefix = prefix
    this.defaultTTL = defaultTTL
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient()
      const value = await client.get(this.getKey(key))
      
      if (!value) return null
      
      return JSON.parse(value) as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const client = await getRedisClient()
      const serialized = JSON.stringify(value)
      
      await client.setEx(
        this.getKey(key),
        ttl || this.defaultTTL,
        serialized
      )
      
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient()
      await client.del(this.getKey(key))
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const client = await getRedisClient()
      const keys = await client.keys(this.getKey(pattern))
      
      if (keys.length === 0) return 0
      
      await client.del(keys)
      return keys.length
    } catch (error) {
      console.error('Cache deletePattern error:', error)
      return 0
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient()
      const result = await client.exists(this.getKey(key))
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  /**
   * Get TTL of a key
   */
  async getTTL(key: string): Promise<number> {
    try {
      const client = await getRedisClient()
      return await client.ttl(this.getKey(key))
    } catch (error) {
      console.error('Cache getTTL error:', error)
      return -1
    }
  }

  /**
   * Increment value
   */
  async increment(key: string, by: number = 1): Promise<number> {
    try {
      const client = await getRedisClient()
      return await client.incrBy(this.getKey(key), by)
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }

  /**
   * Set with NX (only if not exists)
   */
  async setNX<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const client = await getRedisClient()
      const serialized = JSON.stringify(value)
      
      const result = await client.set(
        this.getKey(key),
        serialized,
        {
          NX: true,
          EX: ttl || this.defaultTTL,
        }
      )
      
      return result === 'OK'
    } catch (error) {
      console.error('Cache setNX error:', error)
      return false
    }
  }
}

/**
 * Session store with Redis
 */
export class SessionStore {
  private cache: CacheService
  private sessionTTL: number

  constructor(sessionTTL: number = 86400 * 30) { // 30 days default
    this.cache = new CacheService('session:', sessionTTL)
    this.sessionTTL = sessionTTL
  }

  /**
   * Get session
   */
  async get(sessionId: string): Promise<Record<string, unknown> | null> {
    return this.cache.get<Record<string, unknown>>(sessionId)
  }

  /**
   * Set session
   */
  async set(sessionId: string, data: Record<string, unknown>): Promise<boolean> {
    return this.cache.set(sessionId, data, this.sessionTTL)
  }

  /**
   * Delete session
   */
  async delete(sessionId: string): Promise<boolean> {
    return this.cache.delete(sessionId)
  }

  /**
   * Refresh session TTL
   */
  async refresh(sessionId: string): Promise<boolean> {
    const session = await this.get(sessionId)
    if (!session) return false
    return this.set(sessionId, session)
  }
}

/**
 * Distributed rate limiter with Redis
 */
export class RedisRateLimiter {
  private cache: CacheService
  private maxRequests: number
  private windowMs: number

  constructor(options: {
    maxRequests: number
    windowMs: number
    prefix?: string
  }) {
    this.cache = new CacheService(options.prefix || 'ratelimit:', Math.ceil(options.windowMs / 1000))
    this.maxRequests = options.maxRequests
    this.windowMs = options.windowMs
  }

  /**
   * Check rate limit
   */
  async checkLimit(identifier: string): Promise<{
    allowed: boolean
    remaining: number
    resetAt: number
    retryAfter?: number
  }> {
    try {
      const client = await getRedisClient()
      const key = `ratelimit:${identifier}`
      const now = Date.now()
      const windowStart = now - this.windowMs

      // Use Redis transaction for atomicity
      const multi = client.multi()
      
      // Remove old entries
      multi.zRemRangeByScore(key, 0, windowStart)
      
      // Count current entries
      multi.zCard(key)
      
      // Add current request
      multi.zAdd(key, [{ score: now, value: `${now}-${Math.random()}` }])
      
      // Set expiry
      multi.expire(key, Math.ceil(this.windowMs / 1000))

      const results = await multi.exec()
      const count = results?.[1] as number || 0

      const allowed = count < this.maxRequests
      const remaining = Math.max(0, this.maxRequests - count - 1)
      const resetAt = now + this.windowMs
      const retryAfter = allowed ? undefined : Math.ceil(this.windowMs / 1000)

      return {
        allowed,
        remaining,
        resetAt,
        retryAfter,
      }
    } catch (error) {
      console.error('Redis rate limiter error:', error)
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: this.maxRequests,
        resetAt: Date.now() + this.windowMs,
      }
    }
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    await this.cache.delete(identifier)
  }
}

// Export default cache instance
export const cache = new CacheService()
export const sessionStore = new SessionStore()
