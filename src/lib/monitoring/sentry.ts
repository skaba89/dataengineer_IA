/**
 * DataSphere Innovation - Sentry Monitoring Configuration
 * Production-ready error tracking, performance monitoring, and user context
 */

import * as Sentry from '@sentry/nextjs'

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface UserContext {
  id: string
  email?: string
  username?: string
  organizationId?: string
  role?: string
}

export interface ErrorContext {
  tags?: Record<string, string>
  extra?: Record<string, unknown>
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
  fingerprint?: string[]
}

export interface PerformanceConfig {
  tracesSampleRate: number
  profilesSampleRate: number
  slowConnectionTimeout: number
}

// ============================================================================
// Environment Detection
// ============================================================================

function getEnvironment(): string {
  const nodeEnv = process.env.NODE_ENV || 'development'
  const vercelEnv = process.env.VERCEL_ENV
  
  if (vercelEnv) {
    return vercelEnv === 'production' ? 'production' : 'preview'
  }
  
  return nodeEnv
}

function isSentryEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_SENTRY_DSN
}

// ============================================================================
// Sentry Initialization
// ============================================================================

export function initSentry(): void {
  if (!isSentryEnabled()) {
    console.log('[Sentry] Disabled - No DSN configured')
    return
  }

  const environment = getEnvironment()
  const isProduction = environment === 'production'

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Environment configuration
    environment,
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version || '1.0.0',
    
    // Performance monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    profilesSampleRate: isProduction ? 0.1 : 1.0,
    
    // Session replay (production only)
    replaysSessionSampleRate: isProduction ? 0.1 : 0,
    replaysOnErrorSampleRate: isProduction ? 1.0 : 0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      if (event.exception) {
        const error = hint.originalException
        
        // Ignore network errors that are user-related
        if (error instanceof Error) {
          const ignoredMessages = [
            'Network request failed',
            'Failed to fetch',
            'NetworkError',
            'Cancelled by user',
            'Non-Error promise rejection',
            'ResizeObserver loop',
            ' hydration', // React hydration errors are handled separately
          ]
          
          if (ignoredMessages.some(msg => error.message?.includes(msg))) {
            return null
          }
        }
      }
      
      return event
    },
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration({
        // Configure which URLs to trace
        tracePropagationTargets: [
          'localhost',
          /^\//,
          /^https:\/\/datasphere\.io/,
        ],
      }),
      Sentry.replayIntegration({
        // Mask sensitive data
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,
      }),
    ],
    
    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'atomicFindClose',
      'fb_xd_fragment',
      // Random plugins
      'bmi_SafeAddOn',
      'EBCallBackMessageReceived',
      'conduitPageOpenSidebar',
      // React internal
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network errors
      'Network request failed',
      'Failed to fetch',
      // Canceled requests
      'canceled',
      'Cancel',
    ],
    
    // Tags
    initialScope: {
      tags: {
        app: 'datasphere-innovation',
        version: process.env.npm_package_version || '1.0.0',
      },
    },
  })

  console.log(`[Sentry] Initialized for environment: ${environment}`)
}

// ============================================================================
// User Context Management
// ============================================================================

export function setUserContext(user: UserContext | null): void {
  if (!isSentryEnabled()) return

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    // Set additional context
    Sentry.setTag('user_role', user.role || 'unknown')
    Sentry.setTag('organization_id', user.organizationId || 'none')
    
    Sentry.setContext('user_details', {
      id: user.id,
      role: user.role,
      organizationId: user.organizationId,
    })
  } else {
    Sentry.setUser(null)
    Sentry.setTag('user_role', undefined)
    Sentry.setTag('organization_id', undefined)
    Sentry.setContext('user_details', undefined)
  }
}

export function clearUserContext(): void {
  setUserContext(null)
}

// ============================================================================
// Error Capture
// ============================================================================

export function captureError(
  error: Error | string,
  context?: ErrorContext
): string {
  if (!isSentryEnabled()) {
    console.error('[Sentry] Error captured (Sentry disabled):', error)
    return ''
  }

  const eventId = Sentry.captureException(
    typeof error === 'string' ? new Error(error) : error,
    {
      level: context?.level || 'error',
      tags: context?.tags,
      extra: context?.extra,
      fingerprint: context?.fingerprint,
    }
  )

  return eventId
}

export function captureMessage(
  message: string,
  context?: ErrorContext
): string {
  if (!isSentryEnabled()) {
    console.log('[Sentry] Message captured (Sentry disabled):', message)
    return ''
  }

  const eventId = Sentry.captureMessage(message, {
    level: context?.level || 'info',
    tags: context?.tags,
    extra: context?.extra,
    fingerprint: context?.fingerprint,
  })

  return eventId
}

// ============================================================================
// Performance Monitoring
// ============================================================================

export function startTransaction(name: string, op: string) {
  return Sentry.startSpan({ name, op }, (span) => span)
}

export function startSpan<T>(
  name: string,
  op: string,
  callback: () => T
): T {
  return Sentry.startSpan({ name, op }, callback)
}

export async function startSpanAsync<T>(
  name: string,
  op: string,
  callback: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan({ name, op }, callback)
}

// ============================================================================
// Breadcrumb Management
// ============================================================================

export function addBreadcrumb(
  message: string,
  category: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  data?: Record<string, unknown>
): void {
  if (!isSentryEnabled()) return

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  })
}

export function addNavigationBreadcrumb(
  from: string,
  to: string
): void {
  addBreadcrumb(`Navigate from ${from} to ${to}`, 'navigation', 'info', {
    from,
    to,
  })
}

export function addHttpBreadcrumb(
  method: string,
  url: string,
  statusCode: number
): void {
  addBreadcrumb(`${method} ${url} - ${statusCode}`, 'http', 
    statusCode >= 400 ? 'error' : 'info',
    { method, url, statusCode }
  )
}

export function addUserActionBreadcrumb(
  action: string,
  details?: Record<string, unknown>
): void {
  addBreadcrumb(`User action: ${action}`, 'user', 'info', details)
}

// ============================================================================
// Context Management
// ============================================================================

export function setContext(
  name: string,
  context: Record<string, unknown> | null
): void {
  if (!isSentryEnabled()) return
  Sentry.setContext(name, context)
}

export function setTag(key: string, value: string | undefined): void {
  if (!isSentryEnabled()) return
  Sentry.setTag(key, value)
}

export function setExtra(key: string, value: unknown): void {
  if (!isSentryEnabled()) return
  Sentry.setExtra(key, value)
}

// ============================================================================
// API Error Handler Wrapper
// ============================================================================

export function withErrorTracking<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: { name?: string; tags?: Record<string, string> }
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args)
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureError(error, {
            tags: {
              function: context?.name || fn.name || 'anonymous',
              ...context?.tags,
            },
          })
          throw error
        })
      }
      
      return result
    } catch (error) {
      captureError(error, {
        tags: {
          function: context?.name || fn.name || 'anonymous',
          ...context?.tags,
        },
      })
      throw error
    }
  }) as T
}

// ============================================================================
// React Error Boundary Integration
// ============================================================================

export function captureReactError(
  error: Error,
  componentStack: string,
  errorInfo?: Record<string, unknown>
): string {
  return captureError(error, {
    tags: {
      source: 'react-error-boundary',
    },
    extra: {
      componentStack,
      ...errorInfo,
    },
  })
}

// ============================================================================
// Feature-specific Error Tracking
// ============================================================================

export function trackDatabaseError(
  operation: string,
  error: Error,
  metadata?: Record<string, unknown>
): string {
  return captureError(error, {
    tags: {
      source: 'database',
      operation,
    },
    extra: metadata,
    level: 'error',
  })
}

export function trackApiError(
  endpoint: string,
  method: string,
  error: Error,
  statusCode?: number
): string {
  return captureError(error, {
    tags: {
      source: 'api',
      endpoint,
      method,
      status_code: statusCode?.toString(),
    },
    level: statusCode && statusCode >= 500 ? 'error' : 'warning',
  })
}

export function trackAuthError(
  action: string,
  error: Error,
  provider?: string
): string {
  return captureError(error, {
    tags: {
      source: 'auth',
      action,
      provider: provider || 'credentials',
    },
    level: 'warning',
  })
}

export function trackBillingError(
  action: string,
  error: Error,
  customerId?: string
): string {
  return captureError(error, {
    tags: {
      source: 'billing',
      action,
    },
    extra: {
      customerId: customerId ? `[REDACTED:${customerId.slice(-4)}]` : undefined,
    },
    level: 'error',
  })
}

// ============================================================================
// Exports
// ============================================================================

export { Sentry }

// Named export object for convenient access
const SentryMonitoring = {
  init: initSentry,
  setUser: setUserContext,
  clearUser: clearUserContext,
  captureError,
  captureMessage,
  startTransaction,
  startSpan,
  startSpanAsync,
  addBreadcrumb,
  addNavigationBreadcrumb,
  addHttpBreadcrumb,
  addUserActionBreadcrumb,
  setContext,
  setTag,
  setExtra,
  withErrorTracking,
  captureReactError,
  trackDatabaseError,
  trackApiError,
  trackAuthError,
  trackBillingError,
}

export default SentryMonitoring
