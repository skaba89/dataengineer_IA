// Email Notification System
// Supports SendGrid, Resend, and other email providers

export interface EmailProvider {
  name: string
  send(email: EmailMessage): Promise<EmailResult>
  sendBatch(emails: EmailMessage[]): Promise<EmailResult[]>
  sendTemplate(templateId: string, data: TemplateData): Promise<EmailResult>
}

export interface EmailMessage {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  from: string
  replyTo?: string
  subject: string
  html?: string
  text?: string
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
  tags?: Record<string, string>
  scheduledAt?: Date
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  disposition?: 'attachment' | 'inline'
  contentId?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  deliveredTo?: string[]
}

export interface TemplateData {
  to: string | string[]
  templateId: string
  variables: Record<string, unknown>
  subject?: string
}

// Email Templates
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  variables: string[]
  category: EmailCategory
}

export type EmailCategory = 
  | 'transactional'
  | 'marketing'
  | 'notification'
  | 'alert'
  | 'onboarding'
  | 'billing'

// Predefined Email Templates
export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  // Onboarding Emails
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to AI Data Engineering System!',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; }
            .feature-list { list-style: none; padding: 0; }
            .feature-list li { padding: 10px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Welcome to AI Data Engineering!</h1>
            </div>
            <div class="content">
              <h2>Hi {{name}},</h2>
              <p>Welcome to the AI Data Engineering System! You're now ready to transform your data operations with AI-powered automation.</p>
              
              <h3>Here's what you can do next:</h3>
              <ul class="feature-list">
                <li>📊 Connect your first data source</li>
                <li>🔄 Generate your first ETL pipeline</li>
                <li>📈 Set up automated data quality tests</li>
                <li>🎯 Create custom dashboards</li>
              </ul>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
              </p>
            </div>
            <div class="footer">
              <p>Need help? Contact us at support@aidataengineering.com</p>
              <p>© 2024 AI Data Engineering System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    variables: ['name', 'dashboardUrl'],
    category: 'onboarding',
  },

  // Quality Alert Emails
  qualityAlert: {
    id: 'quality_alert',
    name: 'Data Quality Alert',
    subject: '⚠️ Data Quality Alert: {{testName}}',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .alert-critical { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; }
            .alert-warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; }
            .alert-info { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; }
            .metric { display: inline-block; margin-right: 20px; }
            .metric-value { font-size: 24px; font-weight: bold; }
            .metric-label { font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert-{{severity}}">
              <h2>⚠️ Data Quality Alert</h2>
              <p><strong>Test:</strong> {{testName}}</p>
              <p><strong>Table:</strong> {{tableName}}</p>
              <p><strong>Status:</strong> {{status}}</p>
              
              <div style="margin-top: 20px;">
                <div class="metric">
                  <div class="metric-value">{{recordsTested}}</div>
                  <div class="metric-label">Records Tested</div>
                </div>
                <div class="metric">
                  <div class="metric-value">{{recordsFailed}}</div>
                  <div class="metric-label">Records Failed</div>
                </div>
                <div class="metric">
                  <div class="metric-value">{{failurePercentage}}%</div>
                  <div class="metric-label">Failure Rate</div>
                </div>
              </div>
              
              <p style="margin-top: 20px;"><strong>Message:</strong> {{message}}</p>
              
              <p style="margin-top: 20px;">
                <a href="{{testDetailsUrl}}">View Details →</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    variables: ['testName', 'tableName', 'severity', 'status', 'recordsTested', 'recordsFailed', 'failurePercentage', 'message', 'testDetailsUrl'],
    category: 'alert',
  },

  // Pipeline Execution Notification
  pipelineComplete: {
    id: 'pipeline_complete',
    name: 'Pipeline Execution Complete',
    subject: '✅ Pipeline Complete: {{pipelineName}}',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { color: #10b981; }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>{{#if success}}✅{{else}}❌{{/if}} Pipeline {{status}}</h2>
            <p><strong>Pipeline:</strong> {{pipelineName}}</p>
            <p><strong>Framework:</strong> {{framework}}</p>
            <p><strong>Duration:</strong> {{duration}}</p>
            <p><strong>Records Processed:</strong> {{recordsProcessed}}</p>
            
            {{#if errorMessage}}
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <strong>Error:</strong> {{errorMessage}}
            </div>
            {{/if}}
            
            <p style="margin-top: 20px;">
              <a href="{{pipelineUrl}}">View Pipeline Details →</a>
            </p>
          </div>
        </body>
      </html>
    `,
    variables: ['success', 'status', 'pipelineName', 'framework', 'duration', 'recordsProcessed', 'errorMessage', 'pipelineUrl'],
    category: 'notification',
  },

  // Billing Notification
  subscriptionCreated: {
    id: 'subscription_created',
    name: 'Subscription Created',
    subject: '🎉 Welcome to {{planName}} Plan!',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .plan-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; }
            .features { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="plan-card">
              <h1>{{planName}}</h1>
              <p style="font-size: 32px; margin: 20px 0;">€{{price}}/mois</p>
              <p>{{seats}} sièges inclus</p>
            </div>
            
            <div class="features">
              <h3>Vos avantages :</h3>
              <ul>
                <li>✓ {{projectLimit}} projets</li>
                <li>✓ {{dataSourceLimit}} sources de données</li>
                <li>✓ {{executionLimit}} exécutions/mois</li>
                <li>✓ Support {{supportLevel}}</li>
              </ul>
            </div>
            
            <p style="margin-top: 20px;">
              <a href="{{billingUrl}}">Gérer votre abonnement →</a>
            </p>
          </div>
        </body>
      </html>
    `,
    variables: ['planName', 'price', 'seats', 'projectLimit', 'dataSourceLimit', 'executionLimit', 'supportLevel', 'billingUrl'],
    category: 'billing',
  },

  // API Key Expiration
  apiKeyExpiring: {
    id: 'api_key_expiring',
    name: 'API Key Expiring',
    subject: '🔑 Your API Key expires in {{daysRemaining}} days',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="warning">
              <h2>🔑 API Key Expiring Soon</h2>
              <p>Your API key "<strong>{{keyName}}</strong>" will expire on <strong>{{expirationDate}}</strong>.</p>
              <p>Days remaining: <strong>{{daysRemaining}}</strong></p>
              
              <p style="margin-top: 20px;">
                <a href="{{apiKeysUrl}}">Renew or Create New Key →</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    variables: ['keyName', 'expirationDate', 'daysRemaining', 'apiKeysUrl'],
    category: 'notification',
  },

  // Weekly Report
  weeklyReport: {
    id: 'weekly_report',
    name: 'Weekly Activity Report',
    subject: '📊 Your Weekly Data Engineering Report',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
            .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 28px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>📊 Weekly Activity Report</h2>
            <p>Week of {{weekStart}} - {{weekEnd}}</p>
            
            <div class="stat-grid">
              <div class="stat-card">
                <div class="stat-value">{{pipelinesGenerated}}</div>
                <div class="stat-label">Pipelines Generated</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{executionsRun}}</div>
                <div class="stat-label">Executions Run</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{dataProcessed}}</div>
                <div class="stat-label">Data Processed</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{qualityScore}}%</div>
                <div class="stat-label">Quality Score</div>
              </div>
            </div>
            
            <h3 style="margin-top: 30px;">Top Activities</h3>
            <ul>
              {{#each activities}}
              <li>{{this.description}} - {{this.timestamp}}</li>
              {{/each}}
            </ul>
            
            <p style="margin-top: 20px;">
              <a href="{{dashboardUrl}}">View Full Dashboard →</a>
            </p>
          </div>
        </body>
      </html>
    `,
    variables: ['weekStart', 'weekEnd', 'pipelinesGenerated', 'executionsRun', 'dataProcessed', 'qualityScore', 'activities', 'dashboardUrl'],
    category: 'notification',
  },
}

// SendGrid Provider Implementation
export class SendGridProvider implements EmailProvider {
  name = 'sendgrid'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async send(email: EmailMessage): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: Array.isArray(email.to) ? email.to.map(e => ({ email: e })) : [{ email: email.to }],
              cc: email.cc ? (Array.isArray(email.cc) ? email.cc.map(e => ({ email: e })) : [{ email: email.cc }]) : undefined,
              bcc: email.bcc ? (Array.isArray(email.bcc) ? email.bcc.map(e => ({ email: e })) : [{ email: email.bcc }]) : undefined,
            },
          ],
          from: { email: email.from },
          reply_to: email.replyTo ? { email: email.replyTo } : undefined,
          subject: email.subject,
          content: [
            ...(email.text ? [{ type: 'text/plain', value: email.text }] : []),
            ...(email.html ? [{ type: 'text/html', value: email.html }] : []),
          ],
          attachments: email.attachments?.map(a => ({
            filename: a.filename,
            content: a.content.toString('base64'),
            type: a.contentType,
            disposition: a.disposition || 'attachment',
          })),
          send_at: email.scheduledAt ? Math.floor(email.scheduledAt.getTime() / 1000) : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.errors?.[0]?.message || 'SendGrid error' }
      }

      const messageId = response.headers.get('x-message-id')
      return { success: true, messageId: messageId || undefined }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendBatch(emails: EmailMessage[]): Promise<EmailResult[]> {
    // SendGrid batch API
    return Promise.all(emails.map(email => this.send(email)))
  }

  async sendTemplate(templateId: string, data: TemplateData): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: Array.isArray(data.to) ? data.to.map(e => ({ email: e })) : [{ email: data.to }],
              dynamic_template_data: data.variables,
            },
          ],
          from: { email: process.env.EMAIL_FROM || 'noreply@aidataengineering.com' },
          template_id: templateId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.errors?.[0]?.message || 'SendGrid template error' }
      }

      const messageId = response.headers.get('x-message-id')
      return { success: true, messageId: messageId || undefined }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Resend Provider Implementation
export class ResendProvider implements EmailProvider {
  name = 'resend'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async send(email: EmailMessage): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: email.from,
          to: Array.isArray(email.to) ? email.to : [email.to],
          cc: email.cc ? (Array.isArray(email.cc) ? email.cc : [email.cc]) : undefined,
          bcc: email.bcc ? (Array.isArray(email.bcc) ? email.bcc : [email.bcc]) : undefined,
          reply_to: email.replyTo,
          subject: email.subject,
          html: email.html,
          text: email.text,
          attachments: email.attachments?.map(a => ({
            filename: a.filename,
            content: a.content.toString('base64'),
          })),
          tags: email.tags ? Object.entries(email.tags).map(([name, value]) => ({ name, value })) : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.message || 'Resend error' }
      }

      const data = await response.json()
      return { success: true, messageId: data.id }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendBatch(emails: EmailMessage[]): Promise<EmailResult[]> {
    // Resend doesn't have a batch endpoint, send individually
    return Promise.all(emails.map(email => this.send(email)))
  }

  async sendTemplate(_templateId: string, _data: TemplateData): Promise<EmailResult> {
    // Resend uses React Email templates, handle differently
    return { success: false, error: 'Resend templates require React Email integration' }
  }
}

// Email Service
export class EmailService {
  private provider: EmailProvider

  constructor(provider?: EmailProvider) {
    // Default to Resend if available, otherwise SendGrid
    if (process.env.RESEND_API_KEY) {
      this.provider = new ResendProvider(process.env.RESEND_API_KEY)
    } else if (process.env.SENDGRID_API_KEY) {
      this.provider = new SendGridProvider(process.env.SENDGRID_API_KEY)
    } else {
      // Mock provider for development
      this.provider = {
        name: 'mock',
        send: async (email: EmailMessage) => {
          console.log('Mock email sent:', email.subject, 'to:', email.to)
          return { success: true, messageId: `mock_${Date.now()}` }
        },
        sendBatch: async (emails: EmailMessage[]) => {
          return emails.map(e => ({ success: true, messageId: `mock_${Date.now()}` }))
        },
        sendTemplate: async () => ({ success: true, messageId: `mock_${Date.now()}` }),
      }
    }
  }

  async send(email: EmailMessage): Promise<EmailResult> {
    return this.provider.send(email)
  }

  async sendBatch(emails: EmailMessage[]): Promise<EmailResult[]> {
    return this.provider.sendBatch(emails)
  }

  async sendFromTemplate(
    templateId: string,
    variables: Record<string, unknown>,
    to: string | string[]
  ): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES[templateId]
    if (!template) {
      return { success: false, error: `Template ${templateId} not found` }
    }

    // Replace variables in template
    let html = template.htmlContent
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      html = html.replace(regex, String(value))
    }

    let subject = template.subject
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      subject = subject.replace(regex, String(value))
    }

    return this.send({
      from: process.env.EMAIL_FROM || 'noreply@aidataengineering.com',
      to,
      subject,
      html,
    })
  }

  // Convenience methods
  async sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
    return this.sendFromTemplate('welcome', {
      name,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    }, email)
  }

  async sendQualityAlert(
    email: string,
    data: {
      testName: string
      tableName: string
      severity: string
      status: string
      recordsTested: number
      recordsFailed: number
      failurePercentage: number
      message: string
      testDetailsUrl: string
    }
  ): Promise<EmailResult> {
    return this.sendFromTemplate('quality_alert', data, email)
  }

  async sendPipelineNotification(
    email: string,
    data: {
      success: boolean
      status: string
      pipelineName: string
      framework: string
      duration: string
      recordsProcessed: number
      errorMessage?: string
      pipelineUrl: string
    }
  ): Promise<EmailResult> {
    return this.sendFromTemplate('pipeline_complete', data, email)
  }

  async sendWeeklyReport(
    email: string,
    data: {
      weekStart: string
      weekEnd: string
      pipelinesGenerated: number
      executionsRun: number
      dataProcessed: string
      qualityScore: number
      activities: Array<{ description: string; timestamp: string }>
    }
  ): Promise<EmailResult> {
    return this.sendFromTemplate('weekly_report', {
      ...data,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    }, email)
  }
}

// Export singleton instance
export const emailService = new EmailService()
