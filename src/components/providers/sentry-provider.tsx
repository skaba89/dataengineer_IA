'use client'

/**
 * DataSphere Innovation - Sentry Provider
 * Client-side Sentry initialization and error boundary integration
 */

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

interface SentryProviderProps {
  children: React.ReactNode
  dsn?: string
  environment?: string
}

interface UserContext {
  id: string
  email?: string
  username?: string
  organizationId?: string
  role?: string
}

// ============================================================================
// Sentry Provider Component
// ============================================================================

export function SentryProvider({ 
  children, 
  dsn,
  environment 
}: SentryProviderProps) {
  useEffect(() => {
    const sentryDsn = dsn || process.env.NEXT_PUBLIC_SENTRY_DSN
    
    if (!sentryDsn) {
      console.log('[Sentry] No DSN configured, skipping initialization')
      return
    }

    const env = environment || process.env.NODE_ENV || 'development'
    const isProduction = env === 'production'

    Sentry.init({
      dsn: sentryDsn,
      environment: env,
      
      // Performance monitoring
      tracesSampleRate: isProduction ? 0.1 : 1.0,
      
      // Session replay
      replaysSessionSampleRate: isProduction ? 0.1 : 0,
      replaysOnErrorSampleRate: isProduction ? 1.0 : 0,
      
      // Integrations
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
          maskAllInputs: true,
        }),
      ],
      
      // Ignore common non-critical errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Network request failed',
        'Failed to fetch',
        'cancelled',
      ],
    })

    console.log(`[Sentry] Client initialized for environment: ${env}`)
  }, [dsn, environment])

  // Don't block rendering while Sentry initializes
  return <>{children}</>
}

// ============================================================================
// User Context Hook
// ============================================================================

export function useSentryUser() {
  const setUser = (user: UserContext | null) => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      })
      
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
    }
  }

  return { setUser }
}

// ============================================================================
// Error Reporting Hook
// ============================================================================

export function useSentryError() {
  const captureError = (
    error: Error | string,
    context?: {
      tags?: Record<string, string>
      extra?: Record<string, unknown>
      level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
    }
  ) => {
    return Sentry.captureException(
      typeof error === 'string' ? new Error(error) : error,
      {
        level: context?.level || 'error',
        tags: context?.tags,
        extra: context?.extra,
      }
    )
  }

  const captureMessage = (
    message: string,
    level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
  ) => {
    return Sentry.captureMessage(message, level)
  }

  const addBreadcrumb = (
    message: string,
    category: string,
    data?: Record<string, unknown>
  ) => {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      timestamp: Date.now() / 1000,
    })
  }

  return { captureError, captureMessage, addBreadcrumb }
}

// ============================================================================
// Error Boundary Component
// ============================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  eventId: string | null
}

export class SentryErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, eventId: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })

    this.setState({ eventId })
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                We've encountered an unexpected error. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 rounded-md bg-muted text-xs font-mono overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
              
              {this.state.eventId && (
                <p className="text-xs text-center text-muted-foreground">
                  Error ID: {this.state.eventId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// ============================================================================
// Performance Monitoring Hook
// ============================================================================

export function useSentryPerformance() {
  const startTransaction = (name: string, op: string = 'navigation') => {
    return Sentry.startInactiveSpan({ name, op })
  }

  const measurePageLoad = (pageName: string) => {
    Sentry.addBreadcrumb({
      message: `Page load: ${pageName}`,
      category: 'navigation',
      timestamp: Date.now() / 1000,
    })
  }

  const measureApiCall = async <T,>(
    name: string,
    request: () => Promise<T>
  ): Promise<T> => {
    return Sentry.startSpan(
      {
        name,
        op: 'http.client',
      },
      async () => {
        const startTime = Date.now()
        try {
          const result = await request()
          Sentry.addBreadcrumb({
            message: `API call succeeded: ${name}`,
            category: 'http',
            data: { duration: Date.now() - startTime },
            level: 'info',
          })
          return result
        } catch (error) {
          Sentry.addBreadcrumb({
            message: `API call failed: ${name}`,
            category: 'http',
            data: { duration: Date.now() - startTime },
            level: 'error',
          })
          throw error
        }
      }
    )
  }

  return { startTransaction, measurePageLoad, measureApiCall }
}

// ============================================================================
// Exports
// ============================================================================

export default SentryProvider
