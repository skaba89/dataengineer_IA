/**
 * DataSphere Innovation - Sentry Server Configuration
 * This file configures Sentry for server-side (Node.js) error tracking
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  const environment = process.env.NODE_ENV || 'development'
  const isProduction = environment === 'production'
  
  // Detect deployment environment
  const deployment = process.env.VERCEL_ENV || process.env.RAILWAY_ENVIRONMENT || 'self-hosted'

  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment settings
    environment,
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version || '1.0.0',
    
    // Sampling rates
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    profilesSampleRate: isProduction ? 0.1 : 0,
    
    // Server-specific integrations
    integrations: [
      Sentry.consoleIntegration({
        levels: ['error', 'warn'],
      }),
      Sentry.httpIntegration(),
      Sentry.nativeNodeFetchIntegration(),
      Sentry.prismaIntegration(),
      Sentry.postgresIntegration(),
    ],
    
    // Server-specific ignore patterns
    ignoreErrors: [
      // Database connection issues (usually transient)
      'ECONNREFUSED',
      'ETIMEDOUT',
      'Connection terminated unexpectedly',
      // Authentication issues
      'Invalid token',
      'Token expired',
      'Unauthorized',
      // Validation errors
      'Validation error',
      'Invalid input',
    ],
    
    // Filter events before sending
    beforeSend(event, hint) {
      // Filter out health check errors
      if (event.request?.url?.includes('/api/health')) {
        return null
      }
      
      // Filter out metrics endpoint errors
      if (event.request?.url?.includes('/api/metrics')) {
        return null
      }
      
      // Filter out static file errors
      if (event.request?.url?.match(/\.(css|js|png|jpg|svg|ico|woff|woff2)$/)) {
        return null
      }
      
      return event
    },
    
    // Server context
    initialScope: {
      tags: {
        app: 'datasphere-innovation',
        platform: 'node',
        runtime: 'server',
        deployment,
        node_version: process.version,
      },
      contexts: {
        os: {
          name: process.platform,
          version: process.release.version,
        },
        runtime: {
          name: 'node',
          version: process.version,
        },
      },
    },
  })
  
  console.log(`[Sentry Server] Initialized for ${environment} (${deployment})`)
} else {
  console.log('[Sentry Server] DSN not configured, skipping initialization')
}
