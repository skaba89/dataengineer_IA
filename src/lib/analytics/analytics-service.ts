/**
 * DataSphere Innovation - Analytics Service
 * Product analytics with Mixpanel integration
 */

export type AnalyticsEvent =
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'project_created'
  | 'project_deleted'
  | 'pipeline_executed'
  | 'pipeline_completed'
  | 'pipeline_failed'
  | 'agent_started'
  | 'agent_completed'
  | 'agent_failed'
  | 'connector_added'
  | 'connector_sync_completed'
  | 'subscription_created'
  | 'subscription_upgraded'
  | 'subscription_cancelled'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'feature_used'
  | 'dashboard_viewed'
  | 'query_executed'

export interface EventProperties {
  userId?: string
  organizationId?: string
  projectId?: string
  pipelineId?: string
  agentType?: string
  connectorType?: string
  planId?: string
  amount?: number
  duration?: number
  [key: string]: unknown
}

export interface UserProperties {
  userId: string
  email?: string
  name?: string
  organizationId?: string
  planId?: string
  createdAt?: Date
  mfaEnabled?: boolean
}

class AnalyticsService {
  private projectId: string
  private apiKey: string
  private enabled: boolean

  constructor() {
    this.projectId = process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_ID || 'datasphere'
    this.apiKey = process.env.MIXPANEL_API_KEY || ''
    this.enabled = process.env.NODE_ENV === 'production' && !!this.apiKey
  }

  async track(event: AnalyticsEvent, properties: EventProperties = {}): Promise<void> {
    if (!this.enabled) return

    const payload = {
      event,
      properties: {
        ...properties,
        $project_id: this.projectId,
        time: new Date().toISOString(),
        distinct_id: properties.userId || 'anonymous',
      },
    }

    try {
      await fetch('https://api.mixpanel.com/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([payload]),
      })
    } catch (error) {
      console.error('Analytics track error:', error)
    }
  }

  async identify(properties: UserProperties): Promise<void> {
    if (!this.enabled || !properties.userId) return

    const payload = {
      $token: this.apiKey,
      $distinct_id: properties.userId,
      $set: {
        $email: properties.email,
        $name: properties.name,
        $created: properties.createdAt?.toISOString(),
        Plan: properties.planId,
        'MFA Enabled': properties.mfaEnabled,
      },
    }

    try {
      await fetch('https://api.mixpanel.com/engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([payload]),
      })
    } catch (error) {
      console.error('Analytics identify error:', error)
    }
  }

  async trackPageView(userId: string, page: string): Promise<void> {
    await this.track('page_view', { userId, page })
  }
}

// Singleton
let instance: AnalyticsService | null = null

export function getAnalytics(): AnalyticsService {
  if (!instance) {
    instance = new AnalyticsService()
  }
  return instance
}

export const track = (event: AnalyticsEvent, properties?: EventProperties) =>
  getAnalytics().track(event, properties || {})

export const identify = (properties: UserProperties) =>
  getAnalytics().identify(properties)

export default AnalyticsService
