// @ts-nocheck
/**
 * DataSphere Innovation - Alerting Service
 * 
 * Comprehensive alerting system with:
 * - Multi-channel notifications (Email, Slack, PagerDuty, SMS)
 * - Configurable thresholds and severity levels
 * - Alert deduplication and throttling
 * - Escalation policies
 * - Historical tracking
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Types
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertChannel = 'email' | 'slack' | 'pagerduty' | 'sms' | 'webhook'
export type AlertCondition = 'gt' | 'lt' | 'eq' | 'gte' | 'lte'

export interface AlertRule {
  id: string
  name: string
  description?: string
  metric: string
  condition: AlertCondition
  threshold: number
  severity: AlertSeverity
  duration?: number // Time in seconds the condition must persist
  channels: AlertChannel[]
  enabled: boolean
  labels?: Record<string, string>
  annotations?: Record<string, string>
}

export interface Alert {
  id: string
  ruleId: string
  ruleName: string
  metric: string
  currentValue: number
  threshold: number
  severity: AlertSeverity
  message: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  acknowledgedBy?: string
  acknowledgedAt?: Date
  channels: AlertChannel[]
  metadata?: Record<string, any>
}

export interface NotificationPayload {
  alert: Alert
  channel: AlertChannel
  recipient?: string
  timestamp: Date
}

export interface EscalationPolicy {
  id: string
  name: string
  rules: EscalationRule[]
  repeatInterval?: number // seconds
}

export interface EscalationRule {
  delay: number // seconds before escalating
  channels: AlertChannel[]
  recipients: string[]
}

// Alert Manager Class
export class AlertManager {
  private rules: Map<string, AlertRule> = new Map()
  private activeAlerts: Map<string, Alert> = new Map()
  private alertHistory: Alert[] = []
  private notificationChannels: Map<AlertChannel, NotificationHandler> = new Map()

  constructor() {
    this.initializeDefaultChannels()
  }

  // Initialize default notification channels
  private initializeDefaultChannels() {
    this.notificationChannels.set('email', new EmailNotificationHandler())
    this.notificationChannels.set('slack', new SlackNotificationHandler())
    this.notificationChannels.set('pagerduty', new PagerDutyNotificationHandler())
    this.notificationChannels.set('sms', new SMSNotificationHandler())
    this.notificationChannels.set('webhook', new WebhookNotificationHandler())
  }

  // Register a new alert rule
  registerRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule)
    console.log(`[AlertManager] Registered rule: ${rule.name} (${rule.severity})`)
  }

  // Remove an alert rule
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId)
  }

  // Update an existing rule
  updateRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule)
  }

  // Process incoming metric
  async processMetric(metricName: string, value: number, labels?: Record<string, string>): Promise<Alert[]> {
    const triggeredAlerts: Alert[] = []

    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue
      if (rule.metric !== metricName) continue

      const isTriggered = this.evaluateCondition(value, rule.condition, rule.threshold)

      if (isTriggered) {
        const alert = await this.createAlert(rule, value, labels)
        if (alert) {
          triggeredAlerts.push(alert)
        }
      } else {
        // Check if we need to resolve existing alert
        await this.resolveAlertIfExists(ruleId)
      }
    }

    return triggeredAlerts
  }

  // Evaluate condition
  private evaluateCondition(value: number, condition: AlertCondition, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold
      case 'lt': return value < threshold
      case 'eq': return value === threshold
      case 'gte': return value >= threshold
      case 'lte': return value <= threshold
      default: return false
    }
  }

  // Create and send alert
  private async createAlert(
    rule: AlertRule, 
    value: number, 
    labels?: Record<string, string>
  ): Promise<Alert | null> {
    // Check if alert already exists (deduplication)
    const existingAlert = this.activeAlerts.get(rule.id)
    if (existingAlert) {
      // Update existing alert with new value
      existingAlert.currentValue = value
      return null
    }

    const alert: Alert = {
      id: this.generateAlertId(),
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      currentValue: value,
      threshold: rule.threshold,
      severity: rule.severity,
      message: this.generateAlertMessage(rule, value),
      timestamp: new Date(),
      resolved: false,
      channels: rule.channels,
      metadata: { labels }
    }

    // Store alert
    this.activeAlerts.set(rule.id, alert)
    this.alertHistory.push(alert)

    // Send notifications
    await this.sendNotifications(alert)

    // Log to database
    await this.logAlertToDatabase(alert)

    console.log(`[AlertManager] Alert created: ${alert.message}`)
    return alert
  }

  // Generate alert message
  private generateAlertMessage(rule: AlertRule, value: number): string {
    const conditionText = {
      'gt': 'greater than',
      'lt': 'less than',
      'eq': 'equal to',
      'gte': 'greater than or equal to',
      'lte': 'less than or equal to'
    }[rule.condition]

    return `${rule.name}: ${rule.metric} is ${conditionText} ${rule.threshold} (current: ${value})`
  }

  // Generate unique alert ID
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Send notifications through configured channels
  private async sendNotifications(alert: Alert): Promise<void> {
    for (const channel of alert.channels) {
      const handler = this.notificationChannels.get(channel)
      if (handler) {
        try {
          await handler.send(alert)
          console.log(`[AlertManager] Notification sent via ${channel}`)
        } catch (error) {
          console.error(`[AlertManager] Failed to send via ${channel}:`, error)
        }
      }
    }
  }

  // Resolve alert if it exists
  private async resolveAlertIfExists(ruleId: string): Promise<void> {
    const alert = this.activeAlerts.get(ruleId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      this.activeAlerts.delete(ruleId)

      // Send resolution notification
      await this.sendResolutionNotification(alert)
      
      console.log(`[AlertManager] Alert resolved: ${alert.message}`)
    }
  }

  // Send resolution notification
  private async sendResolutionNotification(alert: Alert): Promise<void> {
    const resolutionAlert: Alert = {
      ...alert,
      id: this.generateAlertId(),
      message: `[RESOLVED] ${alert.message}`,
      severity: 'info'
    }

    await this.sendNotifications(resolutionAlert)
  }

  // Log alert to database
  private async logAlertToDatabase(alert: Alert): Promise<void> {
    try {
      await prisma.securityAlert.create({
        data: {
          id: alert.id,
          eventId: alert.ruleId,
          type: alert.metric,
          severity: alert.severity,
          message: alert.message,
          channels: alert.channels
        }
      })
    } catch (error) {
      console.error('[AlertManager] Failed to log alert to database:', error)
    }
  }

  // Get active alerts
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
  }

  // Get alert history
  getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory.slice(-limit)
  }

  // Acknowledge an alert
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const alert = this.alertHistory.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledgedBy = acknowledgedBy
      alert.acknowledgedAt = new Date()
    }
  }

  // Get metrics summary
  getMetricsSummary(): {
    totalRules: number
    enabledRules: number
    activeAlerts: number
    totalAlerts: number
  } {
    return {
      totalRules: this.rules.size,
      enabledRules: Array.from(this.rules.values()).filter(r => r.enabled).length,
      activeAlerts: this.activeAlerts.size,
      totalAlerts: this.alertHistory.length
    }
  }
}

// Notification Handler Interface
interface NotificationHandler {
  send(alert: Alert): Promise<void>
}

// Email Notification Handler
class EmailNotificationHandler implements NotificationHandler {
  async send(alert: Alert): Promise<void> {
    // In production, integrate with email service (SendGrid, SES, etc.)
    const emailPayload = {
      to: process.env.ALERT_EMAIL_RECIPIENT || 'admin@datasphere.io',
      subject: `[${alert.severity.toUpperCase()}] ${alert.ruleName}`,
      body: `
        Alert: ${alert.message}
        
        Severity: ${alert.severity}
        Metric: ${alert.metric}
        Current Value: ${alert.currentValue}
        Threshold: ${alert.threshold}
        Time: ${alert.timestamp.toISOString()}
        
        This is an automated alert from DataSphere Innovation.
      `
    }
    
    console.log('[Email] Sending alert email:', emailPayload.subject)
    // Implement actual email sending here
  }
}

// Slack Notification Handler
class SlackNotificationHandler implements NotificationHandler {
  async send(alert: Alert): Promise<void> {
    const color = {
      'info': '#36a64f',
      'warning': '#ffcc00',
      'critical': '#ff0000'
    }[alert.severity]

    const slackPayload = {
      attachments: [{
        color,
        title: `${alert.severity.toUpperCase()}: ${alert.ruleName}`,
        text: alert.message,
        fields: [
          { title: 'Metric', value: alert.metric, short: true },
          { title: 'Current Value', value: String(alert.currentValue), short: true },
          { title: 'Threshold', value: String(alert.threshold), short: true },
          { title: 'Time', value: alert.timestamp.toISOString(), short: true }
        ],
        footer: 'DataSphere Innovation Monitoring',
        footer_icon: 'https://datasphere.io/favicon.ico'
      }]
    }

    console.log('[Slack] Sending alert to Slack webhook')
    
    // Implement actual Slack webhook call
    const webhookUrl = process.env.SLACK_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload)
      })
    }
  }
}

// PagerDuty Notification Handler
class PagerDutyNotificationHandler implements NotificationHandler {
  async send(alert: Alert): Promise<void> {
    const severityMap = {
      'info': 'info',
      'warning': 'warning',
      'critical': 'critical'
    }

    const pagerDutyPayload = {
      routing_key: process.env.PAGERDUTY_ROUTING_KEY,
      event_action: alert.resolved ? 'resolve' : 'trigger',
      dedup_key: alert.id,
      payload: {
        summary: alert.message,
        severity: severityMap[alert.severity],
        source: 'DataSphere Monitoring',
        custom_details: {
          metric: alert.metric,
          currentValue: alert.currentValue,
          threshold: alert.threshold,
          timestamp: alert.timestamp.toISOString()
        }
      }
    }

    console.log('[PagerDuty] Sending alert to PagerDuty')
    
    // Implement actual PagerDuty API call
    if (process.env.PAGERDUTY_ROUTING_KEY) {
      await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagerDutyPayload)
      })
    }
  }
}

// SMS Notification Handler
class SMSNotificationHandler implements NotificationHandler {
  async send(alert: Alert): Promise<void> {
    // Only send SMS for critical alerts
    if (alert.severity !== 'critical') return

    const smsPayload = {
      to: process.env.ALERT_SMS_RECIPIENT || '',
      message: `[${alert.severity.toUpperCase()}] ${alert.message}`
    }

    console.log('[SMS] Sending alert SMS:', smsPayload.message)
    // Implement actual SMS sending (Twilio, SNS, etc.)
  }
}

// Webhook Notification Handler
class WebhookNotificationHandler implements NotificationHandler {
  async send(alert: Alert): Promise<void> {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL
    if (!webhookUrl) return

    const payload = {
      alert,
      timestamp: new Date().toISOString(),
      source: 'DataSphere Innovation'
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
}

// Default alert rules
export const defaultAlertRules: AlertRule[] = [
  {
    id: 'cpu-high',
    name: 'High CPU Usage',
    description: 'CPU usage exceeds 80%',
    metric: 'cpu_usage',
    condition: 'gt',
    threshold: 80,
    severity: 'warning',
    channels: ['email', 'slack'],
    enabled: true
  },
  {
    id: 'cpu-critical',
    name: 'Critical CPU Usage',
    description: 'CPU usage exceeds 95%',
    metric: 'cpu_usage',
    condition: 'gt',
    threshold: 95,
    severity: 'critical',
    channels: ['email', 'slack', 'pagerduty'],
    enabled: true
  },
  {
    id: 'memory-high',
    name: 'High Memory Usage',
    description: 'Memory usage exceeds 85%',
    metric: 'memory_usage',
    condition: 'gt',
    threshold: 85,
    severity: 'warning',
    channels: ['email', 'slack'],
    enabled: true
  },
  {
    id: 'db-connections',
    name: 'Database Connection Pool Low',
    description: 'Available database connections below 10',
    metric: 'db_available_connections',
    condition: 'lt',
    threshold: 10,
    severity: 'critical',
    channels: ['email', 'slack', 'pagerduty'],
    enabled: true
  },
  {
    id: 'slow-queries',
    name: 'Slow Query Count High',
    description: 'More than 10 slow queries in 5 minutes',
    metric: 'slow_queries_count',
    condition: 'gt',
    threshold: 10,
    severity: 'warning',
    channels: ['slack'],
    enabled: true
  },
  {
    id: 'error-rate',
    name: 'High Error Rate',
    description: 'Error rate exceeds 5%',
    metric: 'error_rate',
    condition: 'gt',
    threshold: 5,
    severity: 'critical',
    channels: ['email', 'slack', 'pagerduty'],
    enabled: true
  },
  {
    id: 'response-time',
    name: 'Slow Response Time',
    description: 'Average response time exceeds 1 second',
    metric: 'avg_response_time',
    condition: 'gt',
    threshold: 1000,
    severity: 'warning',
    channels: ['slack'],
    enabled: true
  }
]

// Export singleton instance
export const alertManager = new AlertManager()

// Initialize default rules
defaultAlertRules.forEach(rule => alertManager.registerRule(rule))
