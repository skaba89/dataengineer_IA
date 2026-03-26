/**
 * DataSphere Innovation - Advanced Rate Limiting
 * 
 * Multi-tier rate limiting system with:
 * - Token bucket algorithm
 * - Sliding window counters
 * - Redis-backed distributed limiting
 * - Adaptive rate limiting
 * - IP-based and user-based limiting
 */

import { NextRequest, NextResponse } from 'next/server'

// Types
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipFailedRequests?: boolean
  skipSuccessfulRequests?: boolean
  keyGenerator?: (request: NextRequest) => string
  handler?: (request: NextRequest) => NextResponse
  skip?: (request: NextRequest) => boolean
}

export interface RateLimitRule {
  id: string
  name: string
  pattern: RegExp | string
  limits: {
    windowMs: number
    maxRequests: number
    burstLimit?: number
  }
  action: 'reject' | 'throttle' | 'challenge'
  whitelist?: string[]
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
  retryAfter?: number
}

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; ttl: number }>
  get(key: string): Promise<number>
  reset(key: string): Promise<void>
}

// In-memory store for rate limiting
class MemoryStore implements RateLimitStore {
  private store: Map<string, { count: number; expiresAt: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, value] of this.store.entries()) {
        if (value.expiresAt < now) {
          this.store.delete(key)
        }
      }
    }, 60000)
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; ttl: number }> {
    const now = Date.now()
    const record = this.store.get(key)

    if (!record || record.expiresAt < now) {
      this.store.set(key, {
        count: 1,
        expiresAt: now + windowMs
      })
      return { count: 1, ttl: windowMs }
    }

    record.count++
    return { count: record.count, ttl: record.expiresAt - now }
  }

  async get(key: string): Promise<number> {
    const record = this.store.get(key)
    if (!record || record.expiresAt < Date.now()) {
      return 0
    }
    return record.count
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }
}

// Redis store for distributed rate limiting
class RedisStore implements RateLimitStore {
  private redis: any // Redis client
  private prefix: string = 'ratelimit:'

  constructor(redisClient: any) {
    this.redis = redisClient
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; ttl: number }> {
    const fullKey = `${this.prefix}${key}`
    const multi = this.redis.multi()
    
    multi.incr(fullKey)
    multi.pttl(fullKey)
    
    const results = await multi.exec()
    const count = results[0][1]
    let ttl = results[1][1]

    if (ttl === -1) {
      // Key exists but has no expiry (shouldn't happen)
      await this.redis.pexpire(fullKey, windowMs)
      ttl = windowMs
    } else if (ttl === -2) {
      // Key was just created
      ttl = windowMs
    }

    return { count, ttl }
  }

  async get(key: string): Promise<number> {
    const count = await this.redis.get(`${this.prefix}${key}`)
    return parseInt(count || '0', 10)
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(`${this.prefix}${key}`)
  }
}

// Token bucket for burst handling
class TokenBucket {
  private tokens: number
  private lastRefill: number
  
  constructor(
    private capacity: number,
    private refillRate: number, // tokens per second
    private refillAmount: number = 1
  ) {
    this.tokens = capacity
    this.lastRefill = Date.now()
  }

  consume(tokens: number = 1): boolean {
    this.refill()
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens
      return true
    }
    
    return false
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000 // seconds
    
    if (elapsed >= this.refillRate) {
      const tokensToAdd = Math.floor(elapsed / this.refillRate) * this.refillAmount
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
      this.lastRefill = now
    }
  }

  getTokens(): number {
    this.refill()
    return this.tokens
  }
}

// Default rate limit rules by endpoint type
const DEFAULT_RULES: RateLimitRule[] = [
  {
    id: 'api-general',
    name: 'General API',
    pattern: /^\/api\//,
    limits: { windowMs: 60000, maxRequests: 100 },
    action: 'reject'
  },
  {
    id: 'api-auth',
    name: 'Authentication',
    pattern: /^\/api\/auth\//,
    limits: { windowMs: 900000, maxRequests: 10 }, // 15 min, 10 requests
    action: 'challenge'
  },
  {
    id: 'api-public',
    name: 'Public API',
    pattern: /^\/api\/v1\//,
    limits: { windowMs: 60000, maxRequests: 60 },
    action: 'reject'
  },
  {
    id: 'api-webhooks',
    name: 'Webhooks',
    pattern: /^\/api\/webhooks\//,
    limits: { windowMs: 60000, maxRequests: 1000 },
    action: 'reject'
  },
  {
    id: 'api-graphql',
    name: 'GraphQL',
    pattern: /^\/api\/graphql/,
    limits: { windowMs: 60000, maxRequests: 50 },
    action: 'throttle'
  }
]

export class AdvancedRateLimiter {
  private store: RateLimitStore
  private rules: RateLimitRule[]
  private tokenBuckets: Map<string, TokenBucket> = new Map()
  private blockedIPs: Map<string, Date> = new Map()
  private suspiciousActivity: Map<string, number[]> = new Map()

  constructor(store?: RateLimitStore, rules?: RateLimitRule[]) {
    this.store = store || new MemoryStore()
    this.rules = rules || DEFAULT_RULES
  }

  /**
   * Main rate limiting middleware
   */
  async check(request: NextRequest): Promise<RateLimitResult> {
    const clientIP = this.getClientIP(request)
    const path = new URL(request.url).pathname

    // Check if IP is blocked
    const blockedUntil = this.blockedIPs.get(clientIP)
    if (blockedUntil && blockedUntil > new Date()) {
      return {
        allowed: false,
        limit: 0,
        remaining: 0,
        resetAt: blockedUntil,
        retryAfter: Math.ceil((blockedUntil.getTime() - Date.now()) / 1000)
      }
    }

    // Find applicable rule
    const rule = this.findRule(path)
    if (!rule) {
      return { allowed: true, limit: Infinity, remaining: Infinity, resetAt: new Date(Date.now() + 60000) }
    }

    // Generate rate limit key
    const key = this.generateKey(clientIP, rule.id, path)

    // Check token bucket for burst handling
    if (rule.limits.burstLimit) {
      const bucket = this.getOrCreateBucket(key, rule.limits.burstLimit)
      if (!bucket.consume()) {
        return {
          allowed: false,
          limit: rule.limits.burstLimit,
          remaining: 0,
          resetAt: new Date(Date.now() + 1000)
        }
      }
    }

    // Check sliding window
    const { count, ttl } = await this.store.increment(key, rule.limits.windowMs)
    const remaining = Math.max(0, rule.limits.maxRequests - count)
    const resetAt = new Date(Date.now() + ttl)

    if (count > rule.limits.maxRequests) {
      // Track suspicious activity
      this.trackSuspiciousActivity(clientIP)

      return {
        allowed: false,
        limit: rule.limits.maxRequests,
        remaining: 0,
        resetAt,
        retryAfter: Math.ceil(ttl / 1000)
      }
    }

    return {
      allowed: true,
      limit: rule.limits.maxRequests,
      remaining,
      resetAt
    }
  }

  /**
   * Get or create token bucket
   */
  private getOrCreateBucket(key: string, capacity: number): TokenBucket {
    if (!this.tokenBuckets.has(key)) {
      this.tokenBuckets.set(key, new TokenBucket(capacity, 1, capacity / 10))
    }
    return this.tokenBuckets.get(key)!
  }

  /**
   * Find applicable rate limit rule
   */
  private findRule(path: string): RateLimitRule | undefined {
    for (const rule of this.rules) {
      if (typeof rule.pattern === 'string') {
        if (path.startsWith(rule.pattern)) return rule
      } else {
        if (rule.pattern.test(path)) return rule
      }
    }
    return undefined
  }

  /**
   * Generate rate limit key
   */
  private generateKey(ip: string, ruleId: string, path: string): string {
    return `${ip}:${ruleId}:${this.getPathGroup(path)}`
  }

  /**
   * Get path group for rate limiting
   */
  private getPathGroup(path: string): string {
    // Group similar paths (e.g., /api/users/123 -> /api/users/:id)
    return path
      .replace(/\/[a-f0-9]{24}/gi, '/:id')
      .replace(/\/\d+/g, '/:id')
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    return 'unknown'
  }

  /**
   * Track suspicious activity
   */
  private trackSuspiciousActivity(ip: string): void {
    const now = Date.now()
    const timestamps = this.suspiciousActivity.get(ip) || []
    
    // Keep last hour of violations
    const recentTimestamps = timestamps.filter(t => t > now - 3600000)
    recentTimestamps.push(now)
    
    this.suspiciousActivity.set(ip, recentTimestamps)

    // Auto-block after 10 violations in an hour
    if (recentTimestamps.length >= 10) {
      const blockedUntil = new Date(now + 3600000) // 1 hour
      this.blockedIPs.set(ip, blockedUntil)
      console.log(`[RateLimit] Auto-blocked IP ${ip} until ${blockedUntil.toISOString()}`)
    }
  }

  /**
   * Block IP address
   */
  blockIP(ip: string, durationMs: number = 3600000): void {
    this.blockedIPs.set(ip, new Date(Date.now() + durationMs))
  }

  /**
   * Unblock IP address
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip)
    this.suspiciousActivity.delete(ip)
  }

  /**
   * Add custom rate limit rule
   */
  addRule(rule: RateLimitRule): void {
    this.rules.push(rule)
  }

  /**
   * Remove rate limit rule
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId)
  }

  /**
   * Get rate limit headers
   */
  getHeaders(result: RateLimitResult): Record<string, string> {
    return {
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.floor(result.resetAt.getTime() / 1000)),
      ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {})
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    rulesCount: number
    blockedIPsCount: number
    suspiciousIPsCount: number
  } {
    return {
      rulesCount: this.rules.length,
      blockedIPsCount: this.blockedIPs.size,
      suspiciousIPsCount: this.suspiciousActivity.size
    }
  }
}

// Export singleton instance
export const rateLimiter = new AdvancedRateLimiter()

// Export middleware helper
export function withRateLimit(config?: Partial<RateLimitConfig>) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const result = await rateLimiter.check(request)

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter
        },
        { 
          status: 429,
          headers: rateLimiter.getHeaders(result)
        }
      )
    }

    const response = await handler(request)

    // Add rate limit headers to response
    const headers = rateLimiter.getHeaders(result)
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value)
    }

    return response
  }
}
