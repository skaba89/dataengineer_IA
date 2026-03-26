// @ts-nocheck
/**
 * DataSphere Innovation - Email Service
 * Production-ready email service with SendGrid integration
 */

import { z } from 'zod'

// Email configuration
export interface EmailConfig {
  provider: 'sendgrid' | 'resend' | 'smtp'
  apiKey?: string
  fromEmail: string
  fromName?: string
  replyTo?: string
  baseUrl?: string
}

// Email payload schema
export const EmailPayloadSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(200),
  html: z.string().optional(),
  text: z.string().optional(),
  templateId: z.string().optional(),
  templateData: z.record(z.any()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(), // Base64 encoded
    type: z.string().optional(),
    disposition: z.enum(['attachment', 'inline']).optional(),
  })).optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  replyTo: z.string().email().optional(),
  tags: z.record(z.string()).optional(),
  customArgs: z.record(z.string()).optional(),
})

export type EmailPayload = z.infer<typeof EmailPayloadSchema>

// Email response
export interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
  errors?: string[]
}

// Email template types
export type EmailTemplateType =
  | 'welcome'
  | 'verify-email'
  | 'password-reset'
  | 'password-changed'
  | 'subscription-created'
  | 'subscription-upgraded'
  | 'subscription-cancelled'
  | 'invoice-generated'
  | 'payment-failed'
  | 'trial-ending'
  | 'project-completed'
  | 'alert'
  | 'notification'

// Template data interfaces
export interface WelcomeEmailData {
  userName: string
  loginUrl: string
  supportEmail: string
}

export interface VerifyEmailData {
  userName: string
  verificationUrl: string
  expiresIn: string
}

export interface PasswordResetData {
  userName: string
  resetUrl: string
  expiresIn: string
}

export interface SubscriptionEmailData {
  userName: string
  planName: string
  amount: string
  billingCycle: string
  nextBillingDate: string
  manageUrl: string
}

export interface InvoiceEmailData {
  userName: string
  invoiceNumber: string
  amount: string
  dueDate: string
  invoiceUrl: string
}

export interface AlertEmailData {
  userName: string
  alertType: string
  message: string
  details: Record<string, unknown>
  actionUrl?: string
}

/**
 * Email Service Class
 */
export class EmailService {
  private config: EmailConfig
  private templates: Map<EmailTemplateType, { subject: string; html: string; text: string }>

  constructor(config: EmailConfig) {
    this.config = config
    this.templates = new Map()
    this.initializeTemplates()
  }

  /**
   * Initialize built-in email templates
   */
  private initializeTemplates(): void {
    // Welcome email
    this.templates.set('welcome', {
      subject: 'Welcome to DataSphere Innovation!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1F4E79, #2E75B6); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; background: #28A745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to DataSphere Innovation</h1>
            </div>
            <div class="content">
              <h2>Hello {{userName}},</h2>
              <p>Thank you for joining DataSphere Innovation! We're excited to help you transform your data engineering workflows with AI-powered automation.</p>
              <p>Here's what you can do next:</p>
              <ul>
                <li>Set up your first data project</li>
                <li>Connect your data sources</li>
                <li>Explore our AI agents</li>
                <li>Check out the documentation</li>
              </ul>
              <a href="{{loginUrl}}" class="button">Get Started</a>
              <p>If you have any questions, feel free to reach out to our support team at {{supportEmail}}.</p>
            </div>
            <div class="footer">
              <p>© 2024 DataSphere Innovation. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to DataSphere Innovation!

Hello {{userName}},

Thank you for joining DataSphere Innovation! We're excited to help you transform your data engineering workflows with AI-powered automation.

Get started: {{loginUrl}}

If you have any questions, contact us at {{supportEmail}}.

© 2024 DataSphere Innovation. All rights reserved.
      `,
    })

    // Email verification
    this.templates.set('verify-email', {
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1F4E79, #2E75B6); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; background: #1F4E79; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .code { background: #e9ecef; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-family: monospace; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { color: #DC3545; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Hello {{userName}},</h2>
              <p>Please verify your email address to complete your account setup.</p>
              <a href="{{verificationUrl}}" class="button">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #1F4E79;">{{verificationUrl}}</p>
              <p class="warning">This link will expire in {{expiresIn}}.</p>
            </div>
            <div class="footer">
              <p>© 2024 DataSphere Innovation. All rights reserved.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Verify Your Email Address

Hello {{userName}},

Please verify your email address by clicking the link below:

{{verificationUrl}}

This link will expire in {{expiresIn}}.

If you didn't create an account, you can safely ignore this email.

© 2024 DataSphere Innovation. All rights reserved.
      `,
    })

    // Password reset
    this.templates.set('password-reset', {
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC3545; color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; background: #DC3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello {{userName}},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="{{resetUrl}}" class="button">Reset Password</a>
              <div class="warning">
                <strong>Security Notice:</strong> This link will expire in {{expiresIn}}. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </div>
            </div>
            <div class="footer">
              <p>© 2024 DataSphere Innovation. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Password Reset Request

Hello {{userName}},

We received a request to reset your password. Click the link below to create a new password:

{{resetUrl}}

This link will expire in {{expiresIn}}.

If you didn't request a password reset, please ignore this email or contact support.

© 2024 DataSphere Innovation. All rights reserved.
      `,
    })

    // Subscription created
    this.templates.set('subscription-created', {
      subject: 'Welcome to DataSphere {{planName}}!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28A745, #20C997); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .button { display: inline-block; background: #28A745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to {{planName}}!</h1>
            </div>
            <div class="content">
              <h2>Hello {{userName}},</h2>
              <p>Thank you for subscribing to DataSphere Innovation {{planName}}! Your subscription is now active.</p>
              <div class="details">
                <h3>Subscription Details</h3>
                <div class="detail-row">
                  <span>Plan:</span>
                  <strong>{{planName}}</strong>
                </div>
                <div class="detail-row">
                  <span>Amount:</span>
                  <strong>{{amount}}</strong>
                </div>
                <div class="detail-row">
                  <span>Billing Cycle:</span>
                  <strong>{{billingCycle}}</strong>
                </div>
                <div class="detail-row">
                  <span>Next Billing Date:</span>
                  <strong>{{nextBillingDate}}</strong>
                </div>
              </div>
              <a href="{{manageUrl}}" class="button">Manage Subscription</a>
            </div>
            <div class="footer">
              <p>© 2024 DataSphere Innovation. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to {{planName}}!

Hello {{userName}},

Thank you for subscribing to DataSphere Innovation {{planName}}! Your subscription is now active.

Subscription Details:
- Plan: {{planName}}
- Amount: {{amount}}
- Billing Cycle: {{billingCycle}}
- Next Billing Date: {{nextBillingDate}}

Manage your subscription: {{manageUrl}}

© 2024 DataSphere Innovation. All rights reserved.
      `,
    })

    // Alert/Notification
    this.templates.set('alert', {
      subject: '[ALERT] {{alertType}}',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FFA500; color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #FFA500; padding: 15px; margin: 20px 0; }
            .details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #1F4E79; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>{{alertType}}</h1>
            </div>
            <div class="content">
              <h2>Hello {{userName}},</h2>
              <div class="alert-box">
                <strong>Alert:</strong> {{message}}
              </div>
              <div class="details">
                <h3>Details</h3>
                {{#each details}}
                <p><strong>{{@key}}:</strong> {{this}}</p>
                {{/each}}
              </div>
              {{#if actionUrl}}
              <a href="{{actionUrl}}" class="button">Take Action</a>
              {{/if}}
            </div>
            <div class="footer">
              <p>© 2024 DataSphere Innovation. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
{{alertType}}

Hello {{userName}},

Alert: {{message}}

Details:
{{#each details}}
- {{@key}}: {{this}}
{{/each}}

{{#if actionUrl}}
Take action: {{actionUrl}}
{{/if}}

© 2024 DataSphere Innovation. All rights reserved.
      `,
    })
  }

  /**
   * Send email via SendGrid
   */
  async send(payload: EmailPayload): Promise<EmailResponse> {
    try {
      // Validate payload
      const validated = EmailPayloadSchema.parse(payload)

      switch (this.config.provider) {
        case 'sendgrid':
          return this.sendViaSendGrid(validated)
        case 'resend':
          return this.sendViaResend(validated)
        case 'smtp':
          return this.sendViaSMTP(validated)
        default:
          return { success: false, error: 'Unsupported email provider' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      }
    }
  }

  /**
   * Send email using SendGrid API
   */
  private async sendViaSendGrid(payload: EmailPayload): Promise<EmailResponse> {
    if (!this.config.apiKey) {
      return { success: false, error: 'SendGrid API key not configured' }
    }

    const body = {
      personalizations: [
        {
          to: Array.isArray(payload.to) 
            ? payload.to.map(email => ({ email })) 
            : [{ email: payload.to }],
          cc: payload.cc 
            ? (Array.isArray(payload.cc) ? payload.cc : [payload.cc]).map(email => ({ email }))
            : undefined,
          bcc: payload.bcc 
            ? (Array.isArray(payload.bcc) ? payload.bcc : [payload.bcc]).map(email => ({ email }))
            : undefined,
          subject: payload.subject,
          custom_args: payload.customArgs,
        },
      ],
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName,
      },
      reply_to: payload.replyTo || this.config.replyTo 
        ? { email: payload.replyTo || this.config.replyTo! }
        : undefined,
      content: [
        ...(payload.text ? [{ type: 'text/plain', value: payload.text }] : []),
        ...(payload.html ? [{ type: 'text/html', value: payload.html }] : []),
      ],
      template_id: payload.templateId,
      dynamic_template_data: payload.templateData,
      attachments: payload.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        type: att.type,
        disposition: att.disposition,
      })),
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      const messageId = response.headers.get('X-Message-Id')
      return { success: true, messageId: messageId || undefined }
    } else {
      const error = await response.json()
      return {
        success: false,
        error: error.errors?.[0]?.message || 'Failed to send email via SendGrid',
        errors: error.errors?.map((e: any) => e.message),
      }
    }
  }

  /**
   * Send email using Resend API
   */
  private async sendViaResend(payload: EmailPayload): Promise<EmailResponse> {
    if (!this.config.apiKey) {
      return { success: false, error: 'Resend API key not configured' }
    }

    const body = {
      from: this.config.fromName 
        ? `${this.config.fromName} <${this.config.fromEmail}>`
        : this.config.fromEmail,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      cc: payload.cc 
        ? (Array.isArray(payload.cc) ? payload.cc : [payload.cc])
        : undefined,
      bcc: payload.bcc 
        ? (Array.isArray(payload.bcc) ? payload.bcc : [payload.bcc])
        : undefined,
      reply_to: payload.replyTo || this.config.replyTo,
      attachments: payload.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
      })),
      tags: payload.tags ? Object.entries(payload.tags).map(([name, value]) => ({ name, value })) : undefined,
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (response.ok) {
      return { success: true, messageId: result.id }
    } else {
      return {
        success: false,
        error: result.message || 'Failed to send email via Resend',
      }
    }
  }

  /**
   * Send email via SMTP (simplified)
   */
  private async sendViaSMTP(payload: EmailPayload): Promise<EmailResponse> {
    // SMTP implementation would use nodemailer
    console.log('SMTP sending not implemented - use SendGrid or Resend')
    return { success: false, error: 'SMTP not implemented' }
  }

  /**
   * Send templated email
   */
  async sendTemplate<T extends Record<string, unknown>>(
    type: EmailTemplateType,
    to: string | string[],
    data: T,
    options?: { cc?: string | string[]; bcc?: string | string[]; attachments?: EmailPayload['attachments'] }
  ): Promise<EmailResponse> {
    const template = this.templates.get(type)
    
    if (!template) {
      return { success: false, error: `Template '${type}' not found` }
    }

    // Replace placeholders in template
    let html = template.html
    let text = template.text
    let subject = template.subject

    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`
      const stringValue = String(value)
      html = html.replace(new RegExp(placeholder, 'g'), stringValue)
      text = text.replace(new RegExp(placeholder, 'g'), stringValue)
      subject = subject.replace(new RegExp(placeholder, 'g'), stringValue)
    }

    return this.send({
      to,
      subject,
      html,
      text,
      cc: options?.cc,
      bcc: options?.bcc,
      attachments: options?.attachments,
    })
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<EmailResponse> {
    return this.sendTemplate('welcome', to, data)
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to: string, data: VerifyEmailData): Promise<EmailResponse> {
    return this.sendTemplate('verify-email', to, data)
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, data: PasswordResetData): Promise<EmailResponse> {
    return this.sendTemplate('password-reset', to, data)
  }

  /**
   * Send subscription email
   */
  async sendSubscriptionEmail(to: string, data: SubscriptionEmailData): Promise<EmailResponse> {
    return this.sendTemplate('subscription-created', to, data)
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(to: string, data: InvoiceEmailData): Promise<EmailResponse> {
    return this.sendTemplate('invoice-generated', to, data)
  }

  /**
   * Send alert email
   */
  async sendAlertEmail(to: string, data: AlertEmailData): Promise<EmailResponse> {
    return this.sendTemplate('alert', to, data)
  }

  /**
   * Add custom template
   */
  addTemplate(type: EmailTemplateType, template: { subject: string; html: string; text: string }): void {
    this.templates.set(type, template)
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): EmailTemplateType[] {
    return Array.from(this.templates.keys())
  }
}

// Default export - singleton instance
let emailServiceInstance: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService({
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@dataspheir.io',
      fromName: 'DataSphere Innovation',
    })
  }
  return emailServiceInstance
}

export default EmailService
