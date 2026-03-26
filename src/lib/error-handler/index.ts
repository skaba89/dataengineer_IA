/**
 * DataSphere Innovation - Centralized Error Handling System
 * Production-ready error management with classification, logging, and recovery
 */

import { Security } from '@/lib/security'

// ============================================================================
// Error Types & Classifications
// ============================================================================

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  FATAL = 'fatal'
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  SECURITY = 'security'
}

export enum ErrorCode {
  // Validation Errors (1xxx)
  VALIDATION_ERROR = 'ERR_1000',
  INVALID_INPUT = 'ERR_1001',
  MISSING_REQUIRED_FIELD = 'ERR_1002',
  INVALID_FORMAT = 'ERR_1003',
  INVALID_RANGE = 'ERR_1004',
  
  // Authentication Errors (2xxx)
  AUTHENTICATION_ERROR = 'ERR_2000',
  INVALID_CREDENTIALS = 'ERR_2001',
  TOKEN_EXPIRED = 'ERR_2002',
  TOKEN_INVALID = 'ERR_2003',
  MFA_REQUIRED = 'ERR_2004',
  SESSION_EXPIRED = 'ERR_2005',
  
  // Authorization Errors (3xxx)
  AUTHORIZATION_ERROR = 'ERR_3000',
  INSUFFICIENT_PERMISSIONS = 'ERR_3001',
  RESOURCE_FORBIDDEN = 'ERR_3002',
  SUBSCRIPTION_LIMIT = 'ERR_3003',
  FEATURE_NOT_AVAILABLE = 'ERR_3004',
  
  // Not Found Errors (4xxx)
  NOT_FOUND = 'ERR_4000',
  RESOURCE_NOT_FOUND = 'ERR_4001',
  USER_NOT_FOUND = 'ERR_4002',
  PROJECT_NOT_FOUND = 'ERR_4003',
  ORGANIZATION_NOT_FOUND = 'ERR_4004',
  
  // Conflict Errors (5xxx)
  CONFLICT = 'ERR_5000',
  RESOURCE_EXISTS = 'ERR_5001',
  VERSION_CONFLICT = 'ERR_5002',
  STATE_CONFLICT = 'ERR_5003',
  
  // Rate Limit Errors (6xxx)
  RATE_LIMIT_ERROR = 'ERR_6000',
  TOO_MANY_REQUESTS = 'ERR_6001',
  API_LIMIT_EXCEEDED = 'ERR_6002',
  
  // External Service Errors (7xxx)
  EXTERNAL_SERVICE_ERROR = 'ERR_7000',
  STRIPE_ERROR = 'ERR_7001',
  SSO_PROVIDER_ERROR = 'ERR_7002',
  CONNECTOR_ERROR = 'ERR_7003',
  AI_SERVICE_ERROR = 'ERR_7004',
  
  // Database Errors (8xxx)
  DATABASE_ERROR = 'ERR_8000',
  CONNECTION_ERROR = 'ERR_8001',
  QUERY_ERROR = 'ERR_8002',
  TRANSACTION_ERROR = 'ERR_8003',
  
  // Business Logic Errors (9xxx)
  BUSINESS_LOGIC_ERROR = 'ERR_9000',
  PIPELINE_ERROR = 'ERR_9001',
  TRANSFORMATION_ERROR = 'ERR_9002',
  EXPORT_ERROR = 'ERR_9003',
  
  // System Errors (0xxx)
  SYSTEM_ERROR = 'ERR_0000',
  INTERNAL_ERROR = 'ERR_0001',
  CONFIGURATION_ERROR = 'ERR_0002',
  
  // Security Errors (Sxxx)
  SECURITY_ERROR = 'ERR_S000',
  SUSPICIOUS_ACTIVITY = 'ERR_S001',
  BLOCKED_IP = 'ERR_S002',
  BRUTE_FORCE_DETECTED = 'ERR_S003',
}

// ============================================================================
// Custom Error Classes
// ============================================================================

export interface AppErrorDetails {
  code: ErrorCode
  message: string
  severity: ErrorSeverity
  category: ErrorCategory
  httpStatus: number
  isOperational: boolean
  details?: Record<string, unknown>
  stack?: string
  cause?: Error
  timestamp: Date
  requestId?: string
  userId?: string
  organizationId?: string
  path?: string
  method?: string
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly severity: ErrorSeverity
  public readonly category: ErrorCategory
  public readonly httpStatus: number
  public readonly isOperational: boolean
  public readonly details?: Record<string, unknown>
  public readonly timestamp: Date
  public readonly requestId?: string
  public readonly userId?: string
  public readonly organizationId?: string
  public readonly path?: string
  public readonly method?: string

  constructor(params: {
    code: ErrorCode
    message: string
    severity: ErrorSeverity
    category: ErrorCategory
    httpStatus: number
    isOperational?: boolean
    details?: Record<string, unknown>
    cause?: Error
    requestId?: string
    userId?: string
    organizationId?: string
    path?: string
    method?: string
  }) {
    super(params.message)
    this.name = 'AppError'
    this.code = params.code
    this.severity = params.severity
    this.category = params.category
    this.httpStatus = params.httpStatus
    this.isOperational = params.isOperational ?? true
    this.details = params.details
    this.timestamp = new Date()
    this.requestId = params.requestId
    this.userId = params.userId
    this.organizationId = params.organizationId
    this.path = params.path
    this.method = params.method

    if (params.cause) {
      this.cause = params.cause
    }

    Error.captureStackTrace(this, this.constructor)
  }

  toJSON(): AppErrorDetails {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      category: this.category,
      httpStatus: this.httpStatus,
      isOperational: this.isOperational,
      details: this.details,
      stack: this.stack,
      timestamp: this.timestamp,
      requestId: this.requestId,
      userId: this.userId,
      organizationId: this.organizationId,
      path: this.path,
      method: this.method,
    }
  }

  toPublicJSON(): Partial<AppErrorDetails> {
    // Remove sensitive information for public responses
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      category: this.category,
      httpStatus: this.httpStatus,
      timestamp: this.timestamp,
      requestId: this.requestId,
    }
  }
}

// ============================================================================
// Specific Error Classes
// ============================================================================

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      severity: ErrorSeverity.LOW,
      category: ErrorCategory.VALIDATION,
      httpStatus: 400,
      details,
    })
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', code: ErrorCode = ErrorCode.AUTHENTICATION_ERROR) {
    super({
      code,
      message,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.AUTHENTICATION,
      httpStatus: 401,
    })
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', code: ErrorCode = ErrorCode.AUTHORIZATION_ERROR) {
    super({
      code,
      message,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.AUTHORIZATION,
      httpStatus: 403,
    })
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: identifier ? `${resource} with identifier '${identifier}' not found` : `${resource} not found`,
      severity: ErrorSeverity.LOW,
      category: ErrorCategory.NOT_FOUND,
      httpStatus: 404,
      details: { resource, identifier },
    })
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: ErrorCode.CONFLICT,
      message,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.CONFLICT,
      httpStatus: 409,
      details,
    })
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super({
      code: ErrorCode.TOO_MANY_REQUESTS,
      message: 'Too many requests. Please try again later.',
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.RATE_LIMIT,
      httpStatus: 429,
      details: { retryAfter },
    })
    this.name = 'RateLimitError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, cause?: Error) {
    super({
      code: ErrorCode.EXTERNAL_SERVICE_ERROR,
      message: `External service error: ${service} - ${message}`,
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.EXTERNAL_SERVICE,
      httpStatus: 502,
      details: { service },
      cause,
    })
    this.name = 'ExternalServiceError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, cause?: Error) {
    super({
      code: ErrorCode.DATABASE_ERROR,
      message,
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.DATABASE,
      httpStatus: 500,
      cause,
    })
    this.name = 'DatabaseError'
  }
}

export class SubscriptionLimitError extends AppError {
  constructor(limit: string, current: number, max: number) {
    super({
      code: ErrorCode.SUBSCRIPTION_LIMIT,
      message: `Subscription limit reached for ${limit}. Current: ${current}, Max: ${max}`,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.AUTHORIZATION,
      httpStatus: 402,
      details: { limit, current, max },
    })
    this.name = 'SubscriptionLimitError'
  }
}

export class SecurityError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.SECURITY_ERROR) {
    super({
      code,
      message,
      severity: ErrorSeverity.CRITICAL,
      category: ErrorCategory.SECURITY,
      httpStatus: 403,
    })
    this.name = 'SecurityError'
  }
}

// ============================================================================
// Error Handler
// ============================================================================

export interface ErrorHandlerConfig {
  logErrors: boolean
  auditSecurityErrors: boolean
  notifyCriticalErrors: boolean
  includeStackTrace: boolean
}

export class ErrorHandler {
  private static config: ErrorHandlerConfig = {
    logErrors: true,
    auditSecurityErrors: true,
    notifyCriticalErrors: true,
    includeStackTrace: process.env.NODE_ENV !== 'production',
  }

  static configure(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  static async handle(error: Error | AppError, context?: {
    requestId?: string
    userId?: string
    organizationId?: string
    path?: string
    method?: string
  }): Promise<AppError> {
    // Convert to AppError if needed
    const appError = error instanceof AppError 
      ? error 
      : this.wrapUnknownError(error)

    // Add context
    if (context) {
      Object.assign(appError, {
        requestId: context.requestId,
        userId: context.userId,
        organizationId: context.organizationId,
        path: context.path,
        method: context.method,
      })
    }

    // Log the error
    if (this.config.logErrors) {
      this.logError(appError)
    }

    // Audit security errors
    if (this.config.auditSecurityErrors && appError.category === ErrorCategory.SECURITY) {
      await this.auditSecurityError(appError)
    }

    // Notify for critical errors
    if (this.config.notifyCriticalErrors && 
        (appError.severity === ErrorSeverity.CRITICAL || appError.severity === ErrorSeverity.FATAL)) {
      await this.notifyCriticalError(appError)
    }

    return appError
  }

  private static wrapUnknownError(error: Error): AppError {
    // Check for known error types
    if (error.name === 'PrismaClientKnownRequestError') {
      return new DatabaseError(error.message, error)
    }
    if (error.name === 'PrismaClientValidationError') {
      return new ValidationError(error.message)
    }
    if (error.name === 'JsonWebTokenError') {
      return new AuthenticationError('Invalid token', ErrorCode.TOKEN_INVALID)
    }
    if (error.name === 'TokenExpiredError') {
      return new AuthenticationError('Token expired', ErrorCode.TOKEN_EXPIRED)
    }

    // Default to internal error
    return new AppError({
      code: ErrorCode.INTERNAL_ERROR,
      message: error.message || 'An unexpected error occurred',
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.SYSTEM,
      httpStatus: 500,
      isOperational: false,
      cause: error,
    })
  }

  private static logError(error: AppError): void {
    const logData = {
      timestamp: error.timestamp.toISOString(),
      code: error.code,
      severity: error.severity,
      category: error.category,
      message: error.message,
      requestId: error.requestId,
      userId: error.userId,
      organizationId: error.organizationId,
      path: error.path,
      method: error.method,
      details: error.details,
      ...(this.config.includeStackTrace && { stack: error.stack }),
    }

    if (error.severity === ErrorSeverity.FATAL || error.severity === ErrorSeverity.CRITICAL) {
      console.error('[FATAL ERROR]', JSON.stringify(logData, null, 2))
    } else if (error.severity === ErrorSeverity.HIGH) {
      console.error('[ERROR]', JSON.stringify(logData))
    } else if (error.severity === ErrorSeverity.MEDIUM) {
      console.warn('[WARN]', JSON.stringify(logData))
    } else {
      console.info('[INFO]', JSON.stringify(logData))
    }
  }

  private static async auditSecurityError(error: AppError): Promise<void> {
    try {
      await Security.Audit.log({
        action: 'security.alert',
        resource: 'error',
        details: {
          code: error.code,
          message: error.message,
          severity: error.severity,
        },
        ipAddress: error.details?.ipAddress as string || 'unknown',
        userAgent: error.details?.userAgent as string || 'unknown',
        status: 'failure',
        riskLevel: 'high',
        userId: error.userId,
        organizationId: error.organizationId,
      })
    } catch (auditError) {
      console.error('Failed to audit security error:', auditError)
    }
  }

  private static async notifyCriticalError(error: AppError): Promise<void> {
    // In production, this would integrate with PagerDuty, Slack, etc.
    console.error('[CRITICAL ERROR NOTIFICATION]', {
      code: error.code,
      message: error.message,
      severity: error.severity,
      timestamp: error.timestamp,
      requestId: error.requestId,
    })

    // Could also send to monitoring service
    // await MonitoringService.trackError(error)
  }

  static isOperational(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational
    }
    return false
  }

  static getHttpStatus(error: Error): number {
    if (error instanceof AppError) {
      return error.httpStatus
    }
    return 500
  }
}

// ============================================================================
// Error Recovery Strategies
// ============================================================================

export interface RecoveryStrategy {
  name: string
  canRecover: (error: AppError) => boolean
  recover: (error: AppError) => Promise<boolean>
}

export class ErrorRecovery {
  private static strategies: RecoveryStrategy[] = [
    {
      name: 'database-reconnect',
      canRecover: (error) => 
        error.category === ErrorCategory.DATABASE && 
        error.code === ErrorCode.CONNECTION_ERROR,
      recover: async () => {
        // Attempt to reconnect to database
        console.log('Attempting database reconnection...')
        // Implementation would reconnect Prisma client
        return true
      },
    },
    {
      name: 'token-refresh',
      canRecover: (error) => 
        error.category === ErrorCategory.AUTHENTICATION && 
        error.code === ErrorCode.TOKEN_EXPIRED,
      recover: async (error) => {
        // Signal that token refresh is needed
        if (error.details) {
          error.details.requiresRefresh = true
        }
        return true
      },
    },
    {
      name: 'rate-limit-backoff',
      canRecover: (error) => 
        error.category === ErrorCategory.RATE_LIMIT,
      recover: async () => {
        // Signal that backoff is needed
        return true
      },
    },
  ]

  static registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy)
  }

  static async attemptRecovery(error: AppError): Promise<boolean> {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        try {
          const recovered = await strategy.recover(error)
          if (recovered) {
            console.log(`Error recovered using strategy: ${strategy.name}`)
            return true
          }
        } catch (recoveryError) {
          console.error(`Recovery strategy ${strategy.name} failed:`, recoveryError)
        }
      }
    }
    return false
  }
}

// ============================================================================
// Async Handler Wrapper
// ============================================================================

export function asyncHandler<T>(
  fn: (req: Request) => Promise<T>,
  options?: {
    userId?: string
    organizationId?: string
  }
): (req: Request) => Promise<T | Response> {
  return async (req: Request) => {
    try {
      return await fn(req)
    } catch (error) {
      const appError = await ErrorHandler.handle(error as Error, {
        userId: options?.userId,
        organizationId: options?.organizationId,
        path: new URL(req.url).pathname,
        method: req.method,
      })

      // Return JSON error response
      return new Response(JSON.stringify(appError.toPublicJSON()), {
        status: appError.httpStatus,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const Errors = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  DatabaseError,
  SubscriptionLimitError,
  SecurityError,
}

export default ErrorHandler
