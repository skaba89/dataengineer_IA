/**
 * DataSphere Innovation - Email Service
 * Handles email sending with React template rendering
 */

import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  EmailTemplateType,
  EmailLocale,
  WelcomeEmailProps,
  VerificationEmailProps,
  PasswordResetEmailProps,
  SubscriptionCreatedEmailProps,
  SubscriptionCancelledEmailProps,
  PaymentFailedEmailProps,
  ProjectCompletedEmailProps,
  AgentExecutionEmailProps,
  InvoiceEmailProps,
  emailTemplates
} from './templates'

// ==========================================
// Types
// ==========================================

export type EmailProvider = 'resend' | 'sendgrid' | 'mock'

export interface EmailConfig {
  provider: EmailProvider
  apiKey?: string
  fromEmail: string
  fromName?: string
  replyTo?: string
  baseUrl?: string
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  disposition?: 'attachment' | 'inline'
  contentId?: string
}

export interface EmailMessage {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  from?: string
  replyTo?: string
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
  tags?: Record<string, string>
  scheduledAt?: Date
  trackingId?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  deliveredTo?: string[]
}

export interface SendEmailOptions {
  locale?: EmailLocale
  attachments?: EmailAttachment[]
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  tags?: Record<string, string>
  scheduledAt?: Date
  trackingEnabled?: boolean
}

// Template data types
export type TemplateDataMap = {
  welcome: WelcomeEmailProps
  verification: VerificationEmailProps
  passwordReset: PasswordResetEmailProps
  subscriptionCreated: SubscriptionCreatedEmailProps
  subscriptionCancelled: SubscriptionCancelledEmailProps
  paymentFailed: PaymentFailedEmailProps
  projectCompleted: ProjectCompletedEmailProps
  agentExecution: AgentExecutionEmailProps
  invoice: InvoiceEmailProps
}

// ==========================================
// Rate Limiter
// ==========================================

class EmailRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  canSend(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    const requests = this.requests.get(identifier) || []
    const validRequests = requests.filter(time => time > windowStart)

    if (validRequests.length >= this.maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }

  getRemaining(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const requests = this.requests.get(identifier) || []
    const validRequests = requests.filter(time => time > windowStart)
    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

// ==========================================
// React Template Renderer
// ==========================================

function renderTemplateToHTML(template: React.ReactElement): string {
  const doctype = '<!DOCTYPE html>'
  const markup = renderToStaticMarkup(template)
  return doctype + markup
}

function extractPreviewText(html: string): string | undefined {
  const match = html.match(/<meta\s+name="description"\s+content="([^"]+)"/)
  return match ? match[1] : undefined
}

// ==========================================
// Email Provider Implementations
// ==========================================

interface EmailProviderClient {
  name: string
  send(email: EmailMessage): Promise<EmailResult>
  sendBatch(emails: EmailMessage[]): Promise<EmailResult[]>
}

class ResendProvider implements EmailProviderClient {
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
            content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
          })),
          tags: email.tags ? Object.entries(email.tags).map(([name, value]) => ({ name, value })) : undefined,
          scheduled_at: email.scheduledAt?.toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.message || 'Resend API error' }
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
}

class SendGridProvider implements EmailProviderClient {
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
              subject: email.subject,
            },
          ],
          from: { email: email.from, name: undefined },
          reply_to: email.replyTo ? { email: email.replyTo } : undefined,
          content: [
            ...(email.text ? [{ type: 'text/plain', value: email.text }] : []),
            { type: 'text/html', value: email.html },
          ],
          attachments: email.attachments?.map(a => ({
            filename: a.filename,
            content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
            type: a.contentType,
            disposition: a.disposition || 'attachment',
          })),
          send_at: email.scheduledAt ? Math.floor(email.scheduledAt.getTime() / 1000) : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.errors?.[0]?.message || 'SendGrid API error' }
      }

      const messageId = response.headers.get('x-message-id')
      return { success: true, messageId: messageId || undefined }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendBatch(emails: EmailMessage[]): Promise<EmailResult[]> {
    // SendGrid batch API - send individually for simplicity
    return Promise.all(emails.map(email => this.send(email)))
  }
}

class MockProvider implements EmailProviderClient {
  name = 'mock'

  async send(email: EmailMessage): Promise<EmailResult> {
    console.log('[Mock Email Service] Sending email:')
    console.log(`  To: ${Array.isArray(email.to) ? email.to.join(', ') : email.to}`)
    console.log(`  Subject: ${email.subject}`)
    console.log(`  HTML Length: ${email.html.length} chars`)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return { 
      success: true, 
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
    }
  }

  async sendBatch(emails: EmailMessage[]): Promise<EmailResult[]> {
    return Promise.all(emails.map(email => this.send(email)))
  }
}

// ==========================================
// Email Service Class
// ==========================================

export class EmailService {
  private provider: EmailProviderClient
  private config: EmailConfig
  private rateLimiter: EmailRateLimiter

  constructor(config?: Partial<EmailConfig>) {
    // Default configuration
    this.config = {
      provider: (process.env.EMAIL_PROVIDER as EmailProvider) || 'resend',
      apiKey: process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'noreply@datasphere-innovation.fr',
      fromName: process.env.EMAIL_FROM_NAME || 'DataSphere Innovation',
      replyTo: process.env.EMAIL_REPLY_TO || 'support@datasphere-innovation.fr',
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://datasphere-innovation.fr',
      ...config
    }

    // Initialize provider
    this.provider = this.initializeProvider()
    
    // Initialize rate limiter (100 emails per minute per recipient)
    this.rateLimiter = new EmailRateLimiter(100, 60000)
  }

  private initializeProvider(): EmailProviderClient {
    switch (this.config.provider) {
      case 'resend':
        if (!this.config.apiKey) {
          console.warn('Resend API key not configured, falling back to mock provider')
          return new MockProvider()
        }
        return new ResendProvider(this.config.apiKey)
      
      case 'sendgrid':
        if (!this.config.apiKey) {
          console.warn('SendGrid API key not configured, falling back to mock provider')
          return new MockProvider()
        }
        return new SendGridProvider(this.config.apiKey)
      
      default:
        return new MockProvider()
    }
  }

  /**
   * Get the from email address with optional name
   */
  private getFromAddress(): string {
    if (this.config.fromName) {
      return `${this.config.fromName} <${this.config.fromEmail}>`
    }
    return this.config.fromEmail
  }

  /**
   * Check if email can be sent based on rate limits
   */
  canSendTo(recipient: string): boolean {
    return this.rateLimiter.canSend(recipient)
  }

  /**
   * Get remaining email quota for a recipient
   */
  getRemainingQuota(recipient: string): number {
    return this.rateLimiter.getRemaining(recipient)
  }

  /**
   * Render a React email template to HTML
   */
  renderTemplate<T extends EmailTemplateType>(
    templateType: T,
    props: TemplateDataMap[T]
  ): string {
    const Template = emailTemplates[templateType]
    if (!Template) {
      throw new Error(`Email template "${templateType}" not found`)
    }

    const element = React.createElement(Template, props as React.ComponentProps<typeof Template>)
    return renderTemplateToHTML(element)
  }

  /**
   * Send an email using raw HTML content
   */
  async send(email: EmailMessage): Promise<EmailResult> {
    // Check rate limit
    const recipients = Array.isArray(email.to) ? email.to : [email.to]
    for (const recipient of recipients) {
      if (!this.canSendTo(recipient)) {
        return {
          success: false,
          error: `Rate limit exceeded for ${recipient}`
        }
      }
    }

    // Set default from address
    const emailWithDefaults: EmailMessage = {
      ...email,
      from: email.from || this.getFromAddress(),
      replyTo: email.replyTo || this.config.replyTo,
    }

    return this.provider.send(emailWithDefaults)
  }

  /**
   * Send multiple emails in batch
   */
  async sendBatch(emails: EmailMessage[]): Promise<EmailResult[]> {
    return this.provider.sendBatch(emails)
  }

  /**
   * Send an email using a template
   */
  async sendTemplate<T extends EmailTemplateType>(
    templateType: T,
    to: string | string[],
    props: TemplateDataMap[T],
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    // Render template
    const html = this.renderTemplate(templateType, props)
    
    // Extract subject from template translations
    const subject = this.getSubjectForTemplate(templateType, props)

    // Add tracking pixel if enabled
    let finalHtml = html
    if (options?.trackingEnabled !== false) {
      const trackingId = options?.trackingId || this.generateTrackingId()
      finalHtml = this.addTrackingPixel(html, trackingId)
    }

    return this.send({
      to,
      subject,
      html: finalHtml,
      attachments: options?.attachments,
      cc: options?.cc,
      bcc: options?.bcc,
      replyTo: options?.replyTo,
      tags: options?.tags,
      scheduledAt: options?.scheduledAt,
    })
  }

  /**
   * Get subject line for a template
   */
  private getSubjectForTemplate<T extends EmailTemplateType>(
    templateType: T,
    props: TemplateDataMap[T]
  ): string {
    const locale = (props as { locale?: EmailLocale }).locale || 'fr'
    
    const subjects: Record<EmailTemplateType, Record<EmailLocale, string>> = {
      welcome: {
        fr: 'Bienvenue sur DataSphere Innovation',
        en: 'Welcome to DataSphere Innovation'
      },
      verification: {
        fr: 'Vérifiez votre adresse email',
        en: 'Verify your email address'
      },
      passwordReset: {
        fr: 'Réinitialisation du mot de passe',
        en: 'Password Reset Request'
      },
      subscriptionCreated: {
        fr: `Bienvenue dans ${(props as SubscriptionCreatedEmailProps).planName} !`,
        en: `Welcome to ${(props as SubscriptionCreatedEmailProps).planName}!`
      },
      subscriptionCancelled: {
        fr: 'Annulation de votre abonnement',
        en: 'Subscription Cancelled'
      },
      paymentFailed: {
        fr: 'Échec de paiement',
        en: 'Payment Failed'
      },
      projectCompleted: {
        fr: `Projet terminé : ${(props as ProjectCompletedEmailProps).projectName}`,
        en: `Project Completed: ${(props as ProjectCompletedEmailProps).projectName}`
      },
      agentExecution: {
        fr: 'Rapport d\'exécution Agent',
        en: 'Agent Execution Report'
      },
      invoice: {
        fr: `Facture #${(props as InvoiceEmailProps).invoiceNumber}`,
        en: `Invoice #${(props as InvoiceEmailProps).invoiceNumber}`
      }
    }

    return subjects[templateType][locale]
  }

  /**
   * Generate a unique tracking ID
   */
  private generateTrackingId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 12)}`
  }

  /**
   * Add tracking pixel to email HTML
   */
  private addTrackingPixel(html: string, trackingId: string): string {
    const trackingUrl = `${this.config.baseUrl}/api/email/track?id=${trackingId}`
    const pixel = `<img src="${trackingUrl}" alt="" width="1" height="1" style="width:1px;height:1px;border:0;" />`
    
    // Insert before closing body tag
    return html.replace('</body>', `${pixel}</body>`)
  }

  // ==========================================
  // Convenience Methods
  // ==========================================

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    props: Omit<WelcomeEmailProps, 'locale'>,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    return this.sendTemplate('welcome', to, { ...props, locale: options?.locale }, options)
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(
    to: string,
    props: Omit<VerificationEmailProps, 'locale'>,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    return this.sendTemplate('verification', to, { ...props, locale: options?.locale }, options)
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    props: Omit<PasswordResetEmailProps, 'locale'>,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    return this.sendTemplate('passwordReset', to, { ...props, locale: options?.locale }, options)
  }

  /**
   * Send subscription created email
   */
  async sendSubscriptionCreatedEmail(
    to: string,
    props: Omit<SubscriptionCreatedEmailProps, 'locale'>,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    return this.sendTemplate('subscriptionCreated', to, { ...props, locale: options?.locale }, options)
  }

  /**
   * Send subscription cancelled email
   */
  async sendSubscriptionCancelledEmail(
    to: string,
    props: Omit<SubscriptionCancelledEmailProps, 'locale'>,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    return this.sendTemplate('subscriptionCancelled', to, { ...props, locale: options?.locale }, options)
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailedEmail(
    to: string,
    props: Omit<PaymentFailedEmailProps, 'locale'>,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    return this.sendTemplate('paymentFailed', to, { ...props, locale: options?.locale }, options)
  }

  /**
   * Send project completed email
   */
  async sendProjectCompletedEmail(
    to: string,
    props: Omit<ProjectCompletedEmailProps, 'locale'>,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    return this.sendTemplate('projectCompleted', to, { ...props, locale: options?.locale }, options)
  }

  /**
   * Send agent execution email
   */
  async sendAgentExecutionEmail(
    to: string,
    props: Omit<AgentExecutionEmailProps, 'locale'>,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    return this.sendTemplate('agentExecution', to, { ...props, locale: options?.locale }, options)
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(
    to: string,
    props: Omit<InvoiceEmailProps, 'locale'>,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    return this.sendTemplate('invoice', to, { ...props, locale: options?.locale }, options)
  }
}

// ==========================================
// Singleton Instance
// ==========================================

let emailServiceInstance: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService()
  }
  return emailServiceInstance
}

// Reset singleton (useful for testing)
export function resetEmailService(): void {
  emailServiceInstance = null
}

// Default export
export default EmailService
