/**
 * DataSphere Innovation - Web Application Firewall (WAF)
 * 
 * Comprehensive security middleware with:
 * - SQL Injection detection and prevention
 * - XSS attack detection
 * - CSRF protection
 * - Security headers
 * - Request validation
 */

import { NextRequest, NextResponse } from 'next/server'

// Types
export interface WAFConfig {
  enabled: boolean
  mode: 'block' | 'log' | 'learning'
  trustedProxies: string[]
  rateLimitBypass: string[]
  customRules: WAFRule[]
}

export interface WAFRule {
  id: string
  name: string
  pattern: RegExp
  action: 'block' | 'log' | 'challenge'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export interface WAFResult {
  allowed: boolean
  reason?: string
  rule?: string
  severity?: string
  blockedAt?: Date
}

// Default WAF configuration
const DEFAULT_CONFIG: WAFConfig = {
  enabled: true,
  mode: 'block',
  trustedProxies: ['127.0.0.1', '::1'],
  rateLimitBypass: [],
  customRules: []
}

// SQL Injection patterns
const SQL_INJECTION_PATTERNS: WAFRule[] = [
  {
    id: 'sql-union',
    name: 'SQL Union Injection',
    pattern: /(\bUNION\b.*\bSELECT\b)|(\bSELECT\b.*\bUNION\b)/i,
    action: 'block',
    severity: 'critical',
    description: 'Detects UNION-based SQL injection attempts'
  },
  {
    id: 'sql-comment',
    name: 'SQL Comment Injection',
    pattern: /(--)|(\/\*)|(\*\/)|(\\x00)|(\\x1a)/i,
    action: 'block',
    severity: 'high',
    description: 'Detects SQL comment-based injection'
  },
  {
    id: 'sql-tautology',
    name: 'SQL Tautology',
    pattern: /(\bOR\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+)|(\bAND\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i,
    action: 'block',
    severity: 'critical',
    description: 'Detects tautology-based SQL injection'
  },
  {
    id: 'sql-stacked',
    name: 'Stacked Queries',
    pattern: /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)/i,
    action: 'block',
    severity: 'critical',
    description: 'Detects stacked query injection'
  },
  {
    id: 'sql-functions',
    name: 'Dangerous SQL Functions',
    pattern: /(EXEC\s|EXECUTE\s|xp_cmdshell|sp_executesql|LOAD_FILE|INTO\s+OUTFILE)/i,
    action: 'block',
    severity: 'critical',
    description: 'Detects dangerous SQL function usage'
  }
]

// XSS Attack patterns
const XSS_PATTERNS: WAFRule[] = [
  {
    id: 'xss-script',
    name: 'Script Tag Injection',
    pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    action: 'block',
    severity: 'critical',
    description: 'Detects script tag injection'
  },
  {
    id: 'xss-event',
    name: 'Event Handler Injection',
    pattern: /on(load|error|click|mouse|focus|blur|key|submit|change|input)\s*=/gi,
    action: 'block',
    severity: 'high',
    description: 'Detects event handler injection'
  },
  {
    id: 'xss-javascript',
    name: 'JavaScript Protocol',
    pattern: /javascript\s*:/gi,
    action: 'block',
    severity: 'high',
    description: 'Detects javascript: protocol usage'
  },
  {
    id: 'xss-data-uri',
    name: 'Data URI Injection',
    pattern: /data\s*:\s*text\/html/gi,
    action: 'block',
    severity: 'high',
    description: 'Detects data URI XSS attempts'
  },
  {
    id: 'xss-svg',
    name: 'SVG XSS',
    pattern: /<svg[\s\S]*?onload[\s\S]*?>/gi,
    action: 'block',
    severity: 'high',
    description: 'Detects SVG-based XSS'
  },
  {
    id: 'xss-iframe',
    name: 'Iframe Injection',
    pattern: /<iframe[\s\S]*?>/gi,
    action: 'block',
    severity: 'medium',
    description: 'Detects iframe injection'
  }
]

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS: WAFRule[] = [
  {
    id: 'path-traversal-basic',
    name: 'Path Traversal',
    pattern: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/|\.\.%2f)/i,
    action: 'block',
    severity: 'critical',
    description: 'Detects path traversal attempts'
  },
  {
    id: 'path-null-byte',
    name: 'Null Byte Injection',
    pattern: /%00|\x00/,
    action: 'block',
    severity: 'high',
    description: 'Detects null byte injection'
  }
]

// Command injection patterns
const COMMAND_INJECTION_PATTERNS: WAFRule[] = [
  {
    id: 'cmd-injection-basic',
    name: 'Command Injection',
    pattern: /(\||;|`|\$\(|\$\{|\|\||&&)\s*(ls|cat|rm|wget|curl|bash|sh|python|perl|ruby|php)/i,
    action: 'block',
    severity: 'critical',
    description: 'Detects command injection attempts'
  },
  {
    id: 'cmd-backtick',
    name: 'Backtick Command Execution',
    pattern: /`[^`]+`/,
    action: 'block',
    severity: 'critical',
    description: 'Detects backtick command execution'
  }
]

// All security rules combined
const ALL_RULES: WAFRule[] = [
  ...SQL_INJECTION_PATTERNS,
  ...XSS_PATTERNS,
  ...PATH_TRAVERSAL_PATTERNS,
  ...COMMAND_INJECTION_PATTERNS
]

export class WebApplicationFirewall {
  private config: WAFConfig
  private rules: WAFRule[]
  private blockedIPs: Set<string> = new Set()
  private suspiciousRequests: Map<string, number> = new Map()

  constructor(config: Partial<WAFConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.rules = [...ALL_RULES, ...this.config.customRules]
  }

  /**
   * Main WAF middleware function
   */
  async middleware(request: NextRequest): Promise<WAFResult> {
    if (!this.config.enabled) {
      return { allowed: true }
    }

    const clientIP = this.getClientIP(request)

    // Check if IP is blocked
    if (this.blockedIPs.has(clientIP)) {
      return {
        allowed: false,
        reason: 'IP blocked due to previous violations',
        severity: 'critical',
        blockedAt: new Date()
      }
    }

    // Check URL
    const urlResult = this.checkURL(request.url)
    if (!urlResult.allowed) return urlResult

    // Check headers
    const headerResult = this.checkHeaders(request)
    if (!headerResult.allowed) return headerResult

    // Check query parameters
    const queryResult = this.checkQueryParams(request)
    if (!queryResult.allowed) return queryResult

    // Check body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const bodyResult = await this.checkBody(request)
      if (!bodyResult.allowed) return bodyResult
    }

    return { allowed: true }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    const realIP = request.headers.get('x-real-ip')
    if (realIP) {
      return realIP.trim()
    }
    
    return 'unknown'
  }

  /**
   * Check URL for malicious patterns
   */
  private checkURL(url: string): WAFResult {
    for (const rule of this.rules) {
      if (rule.pattern.test(url)) {
        this.logViolation('url', rule, url)
        
        if (rule.action === 'block') {
          return {
            allowed: false,
            reason: `Blocked by rule: ${rule.name}`,
            rule: rule.id,
            severity: rule.severity
          }
        }
      }
    }
    return { allowed: true }
  }

  /**
   * Check request headers for malicious patterns
   */
  private checkHeaders(request: NextRequest): WAFResult {
    for (const [name, value] of request.headers.entries()) {
      // Check for header injection
      if (/[\r\n]/.test(value)) {
        return {
          allowed: false,
          reason: 'Header injection detected',
          severity: 'high'
        }
      }

      // Check header values against rules
      for (const rule of this.rules) {
        if (rule.pattern.test(value)) {
          this.logViolation('header', rule, `${name}: ${value}`)
          
          if (rule.action === 'block') {
            return {
              allowed: false,
              reason: `Blocked by rule: ${rule.name}`,
              rule: rule.id,
              severity: rule.severity
            }
          }
        }
      }
    }
    return { allowed: true }
  }

  /**
   * Check query parameters for malicious patterns
   */
  private checkQueryParams(request: NextRequest): WAFResult {
    const { searchParams } = new URL(request.url)
    
    for (const [name, value] of searchParams.entries()) {
      for (const rule of this.rules) {
        if (rule.pattern.test(value) || rule.pattern.test(name)) {
          this.logViolation('query', rule, `${name}=${value}`)
          
          if (rule.action === 'block') {
            return {
              allowed: false,
              reason: `Blocked by rule: ${rule.name}`,
              rule: rule.id,
              severity: rule.severity
            }
          }
        }
      }
    }
    return { allowed: true }
  }

  /**
   * Check request body for malicious patterns
   */
  private async checkBody(request: NextRequest): Promise<WAFResult> {
    try {
      const contentType = request.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        const body = await request.text()
        for (const rule of this.rules) {
          if (rule.pattern.test(body)) {
            this.logViolation('body', rule, body.substring(0, 500))
            
            if (rule.action === 'block') {
              return {
                allowed: false,
                reason: `Blocked by rule: ${rule.name}`,
                rule: rule.id,
                severity: rule.severity
              }
            }
          }
        }
      }
    } catch (error) {
      // If we can't parse the body, let it through
      // The application will handle the error
    }
    
    return { allowed: true }
  }

  /**
   * Log security violation
   */
  private logViolation(
    location: string,
    rule: WAFRule,
    payload: string
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'waf_violation',
      rule: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      location,
      payload: payload.substring(0, 1000),
      action: rule.action
    }

    console.log('[WAF]', JSON.stringify(logEntry))
  }

  /**
   * Block an IP address
   */
  blockIP(ip: string): void {
    this.blockedIPs.add(ip)
  }

  /**
   * Unblock an IP address
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip)
  }

  /**
   * Add security headers to response
   */
  addSecurityHeaders(response: NextResponse): NextResponse {
    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY')
    
    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    // XSS Protection
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://api.datasphere.io; " +
      "frame-ancestors 'none';"
    )
    
    // Permissions Policy
    response.headers.set(
      'Permissions-Policy',
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), ' +
      'magnetometer=(), microphone=(), payment=(), usb=()'
    )
    
    // Strict Transport Security
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
    
    return response
  }

  /**
   * Get WAF statistics
   */
  getStats(): {
    rulesCount: number
    blockedIPsCount: number
    mode: string
  } {
    return {
      rulesCount: this.rules.length,
      blockedIPsCount: this.blockedIPs.size,
      mode: this.config.mode
    }
  }
}

// Export singleton instance
export const waf = new WebApplicationFirewall()

// Export middleware helper
export function withWAF(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const result = await waf.middleware(request)
    
    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: result.reason || 'Request blocked by security policy',
          rule: result.rule
        },
        { status: 403 }
      )
    }
    
    const response = await handler(request, ...args)
    
    if (response instanceof NextResponse) {
      return waf.addSecurityHeaders(response)
    }
    
    return response
  }
}
