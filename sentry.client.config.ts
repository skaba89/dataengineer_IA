/**
 * DataSphere Innovation - Sentry Client Configuration
 * This file configures Sentry for client-side (browser) error tracking
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
    
    // Adjust sampling rates based on environment
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    profilesSampleRate: isProduction ? 0.1 : 0,
    
    // Session Replay configuration
    replaysSessionSampleRate: isProduction ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrations for browser
    integrations: [
      Sentry.browserTracingIntegration({
        // Set trace propagation targets
        tracePropagationTargets: [
          'localhost',
          /^\//,
          /^https:\/\/datasphere\.io/,
          /^https:\/\/.*\.datasphere\.io/,
        ],
      }),
      Sentry.replayIntegration({
        // Privacy settings - mask sensitive data
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,
        // Network capture
        networkDetailAllowUrls: [/\/api\//],
        networkRequestHeaders: ['Content-Type'],
        networkResponseHeaders: ['Content-Type'],
      }),
      Sentry.feedbackIntegration({
        // User feedback on errors
        colorScheme: 'system',
        isEmailRequired: false,
        showBranding: false,
        showName: false,
        triggerLabel: 'Signaler un problème',
        formTitle: 'Signaler un problème',
        submitButtonLabel: 'Envoyer',
        messageLabel: 'Décrivez le problème',
        successMessageText: 'Merci pour votre retour !',
      }),
    ],
    
    // Ignore common noise
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'atomicFindClose',
      'fb_xd_fragment',
      // Browser plugins
      'bmi_SafeAddOn',
      'EBCallBackMessageReceived',
      'conduitPageOpenSidebar',
      // React internal
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network
      'Network request failed',
      'Failed to fetch',
      'NetworkError',
      // User actions
      'cancelled',
      'Cancel',
      'canceled',
      // Chunk loading
      'ChunkLoadError',
      'Loading chunk',
      'Loading CSS chunk',
    ],
    
    // Filter events before sending
    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (event.request?.url?.includes('chrome-extension://')) {
        return null
      }
      
      // Filter out non-Error exceptions
      if (hint.originalException && !(hint.originalException instanceof Error)) {
        return null
      }
      
      return event
    },
    
    // Initial scope with app info
    initialScope: {
      tags: {
        app: 'datasphere-innovation',
        platform: 'web',
        runtime: 'browser',
      },
    },
  })
  
  console.log(`[Sentry Client] Initialized for ${environment}`)
} else {
  console.log('[Sentry Client] DSN not configured, skipping initialization')
}
