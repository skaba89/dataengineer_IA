/**
 * DataSphere Innovation - Sentry Edge Configuration
 * This file configures Sentry for edge runtime (middleware, edge functions)
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  const environment = process.env.NODE_ENV || 'development'
  const isProduction = environment === 'production'

  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment settings
    environment,
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version || '1.0.0',
    
    // Edge runtime has limited capabilities
    tracesSampleRate: isProduction ? 0.05 : 1.0,
    
    // Minimal integrations for edge runtime
    integrations: [],
    
    // Edge-specific ignore patterns
    ignoreErrors: [
      // Middleware redirect/cancel errors (expected behavior)
      'NEXT_REDIRECT',
      'NEXT_NOT_FOUND',
      // Auth redirects
      'Unauthorized',
      // Rate limiting
      'Rate limit exceeded',
    ],
    
    // Filter events before sending
    beforeSend(event) {
      // Filter out health check middleware calls
      if (event.request?.url?.includes('/api/health')) {
        return null
      }
      
      // Filter out static assets middleware calls
      if (event.request?.url?.match(/\.(css|js|png|jpg|svg|ico|woff|woff2)$/)) {
        return null
      }
      
      return event
    },
    
    // Edge context
    initialScope: {
      tags: {
        app: 'datasphere-innovation',
        platform: 'edge',
        runtime: 'edge',
      },
    },
  })
  
  console.log(`[Sentry Edge] Initialized for ${environment}`)
} else {
  console.log('[Sentry Edge] DSN not configured, skipping initialization')
}
