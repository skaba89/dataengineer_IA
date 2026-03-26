/**
 * DataSphere Innovation - Email Queue
 * Handles email queuing with retry logic and failure handling
 */

import { getEmailService, EmailResult, EmailMessage, EmailAttachment, SendEmailOptions } from './email-service'
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
  TemplateDataMap
} from './templates'

// ==========================================
// Types
// ==========================================

export type EmailQueueStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'

export interface QueuedEmail {
  id: string
  status: EmailQueueStatus
  priority: EmailPriority
  attempts: number
  maxAttempts: number
  createdAt: Date
  lastAttemptAt?: Date
  nextAttemptAt?: Date
  sentAt?: Date
  error?: string
  
  // Email data
  templateType?: EmailTemplateType
  templateProps?: Record<string, unknown>
  rawEmail?: EmailMessage
  
  // Metadata
  recipient: string
  subject: string
  tags?: Record<string, string>
  metadata?: Record<string, unknown>
}

export type EmailPriority = 'high' | 'normal' | 'low'

export interface EmailQueueConfig {
  maxAttempts: number
  retryDelays: number[] // in milliseconds
  concurrency: number
  batchSize: number
  processInterval: number
}

export interface EmailQueueStats {
  pending: number
  processing: number
  sent: number
  failed: number
  total: number
}

export interface EmailLogEntry {
  id: string
  emailId: string
  timestamp: Date
  event: 'created' | 'attempt' | 'sent' | 'failed' | 'cancelled' | 'retry'
  details?: string
  error?: string
  metadata?: Record<string, unknown>
}

// ==========================================
// Default Configuration
// ==========================================

const DEFAULT_CONFIG: EmailQueueConfig = {
  maxAttempts: 5,
  retryDelays: [
    60 * 1000,      // 1 minute
    5 * 60 * 1000,  // 5 minutes
    15 * 60 * 1000, // 15 minutes
    60 * 60 * 1000, // 1 hour
    6 * 60 * 60 * 1000 // 6 hours
  ],
  concurrency: 5,
  batchSize: 20,
  processInterval: 5000 // 5 seconds
}

// ==========================================
// In-Memory Queue Storage
// ==========================================

class EmailQueueStorage {
  private queue: Map<string, QueuedEmail> = new Map()
  private logs: EmailLogEntry[] = []
  private maxLogs: number = 10000

  // Queue operations
  add(email: QueuedEmail): void {
    this.queue.set(email.id, email)
    this.addLog(email.id, 'created', `Email queued for ${email.recipient}`)
  }

  get(id: string): QueuedEmail | undefined {
    return this.queue.get(id)
  }

  update(id: string, updates: Partial<QueuedEmail>): QueuedEmail | undefined {
    const email = this.queue.get(id)
    if (email) {
      const updated = { ...email, ...updates }
      this.queue.set(id, updated)
      return updated
    }
    return undefined
  }

  remove(id: string): boolean {
    return this.queue.delete(id)
  }

  // Query operations
  getPending(limit?: number): QueuedEmail[] {
    const pending = Array.from(this.queue.values())
      .filter(e => e.status === 'pending')
      .sort((a, b) => {
        // Sort by priority first, then by creation date
        const priorityOrder = { high: 0, normal: 1, low: 2 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
    
    return limit ? pending.slice(0, limit) : pending
  }

  getByRecipient(recipient: string): QueuedEmail[] {
    return Array.from(this.queue.values())
      .filter(e => e.recipient === recipient)
  }

  getStats(): EmailQueueStats {
    const emails = Array.from(this.queue.values())
    return {
      pending: emails.filter(e => e.status === 'pending').length,
      processing: emails.filter(e => e.status === 'processing').length,
      sent: emails.filter(e => e.status === 'sent').length,
      failed: emails.filter(e => e.status === 'failed').length,
      total: emails.length
    }
  }

  // Cleanup
  cleanup(olderThanDays: number = 30): number {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
    let removed = 0
    
    for (const [id, email] of this.queue.entries()) {
      if (
        (email.status === 'sent' || email.status === 'failed' || email.status === 'cancelled') &&
        email.createdAt < cutoff
      ) {
        this.queue.delete(id)
        removed++
      }
    }
    
    return removed
  }

  // Logging
  addLog(emailId: string, event: EmailLogEntry['event'], details?: string, error?: string, metadata?: Record<string, unknown>): void {
    this.logs.push({
      id: `${emailId}_${Date.now()}`,
      emailId,
      timestamp: new Date(),
      event,
      details,
      error,
      metadata
    })
    
    // Keep logs under limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  getLogs(emailId?: string, limit?: number): EmailLogEntry[] {
    let logs = this.logs
    if (emailId) {
      logs = logs.filter(l => l.emailId === emailId)
    }
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return limit ? logs.slice(0, limit) : logs
  }
}

// ==========================================
// Email Queue Class
// ==========================================

export class EmailQueue {
  private storage: EmailQueueStorage
  private config: EmailQueueConfig
  private processing: boolean = false
  private processTimer?: NodeJS.Timeout
  private currentProcessing: Set<string> = new Set()

  constructor(config?: Partial<EmailQueueConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.storage = new EmailQueueStorage()
  }

  /**
   * Generate a unique ID for queued emails
   */
  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`
  }

  /**
   * Calculate the next retry time based on attempt number
   */
  private getNextRetryTime(attempt: number): Date {
    const delay = this.config.retryDelays[Math.min(attempt, this.config.retryDelays.length - 1)]
    return new Date(Date.now() + delay)
  }

  /**
   * Queue an email using a template
   */
  async queueTemplate<T extends EmailTemplateType>(
    to: string,
    templateType: T,
    templateProps: TemplateDataMap[T],
    options?: {
      priority?: EmailPriority
      scheduledAt?: Date
      attachments?: EmailAttachment[]
      tags?: Record<string, string>
      metadata?: Record<string, unknown>
      cc?: string | string[]
      bcc?: string | string[]
    }
  ): Promise<string> {
    const id = this.generateId()
    const emailService = getEmailService()
    
    // Pre-render subject for logging
    const subject = this.extractSubject(templateType, templateProps)
    
    const queuedEmail: QueuedEmail = {
      id,
      status: options?.scheduledAt ? 'pending' : 'pending',
      priority: options?.priority || 'normal',
      attempts: 0,
      maxAttempts: this.config.maxAttempts,
      createdAt: new Date(),
      nextAttemptAt: options?.scheduledAt || new Date(),
      
      templateType,
      templateProps: templateProps as Record<string, unknown>,
      
      recipient: to,
      subject,
      tags: options?.tags,
      metadata: options?.metadata
    }

    this.storage.add(queuedEmail)
    
    return id
  }

  /**
   * Queue a raw email message
   */
  async queueRaw(
    email: EmailMessage,
    options?: {
      priority?: EmailPriority
      scheduledAt?: Date
      metadata?: Record<string, unknown>
    }
  ): Promise<string> {
    const id = this.generateId()
    
    const queuedEmail: QueuedEmail = {
      id,
      status: 'pending',
      priority: options?.priority || 'normal',
      attempts: 0,
      maxAttempts: this.config.maxAttempts,
      createdAt: new Date(),
      nextAttemptAt: options?.scheduledAt || new Date(),
      
      rawEmail: email,
      
      recipient: Array.isArray(email.to) ? email.to[0] : email.to,
      subject: email.subject,
      tags: email.tags,
      metadata: options?.metadata
    }

    this.storage.add(queuedEmail)
    
    return id
  }

  /**
   * Extract subject from template type and props
   */
  private extractSubject(templateType: EmailTemplateType, props: Record<string, unknown>): string {
    const locale = (props.locale as EmailLocale) || 'fr'
    
    const subjects: Record<EmailTemplateType, Record<EmailLocale, string>> = {
      welcome: { fr: 'Bienvenue sur DataSphere Innovation', en: 'Welcome to DataSphere Innovation' },
      verification: { fr: 'Vérifiez votre adresse email', en: 'Verify your email address' },
      passwordReset: { fr: 'Réinitialisation du mot de passe', en: 'Password Reset Request' },
      subscriptionCreated: { fr: 'Bienvenue !', en: 'Welcome!' },
      subscriptionCancelled: { fr: 'Annulation de votre abonnement', en: 'Subscription Cancelled' },
      paymentFailed: { fr: 'Échec de paiement', en: 'Payment Failed' },
      projectCompleted: { fr: 'Projet terminé', en: 'Project Completed' },
      agentExecution: { fr: 'Rapport d\'exécution', en: 'Execution Report' },
      invoice: { fr: 'Votre facture', en: 'Your Invoice' }
    }

    return subjects[templateType][locale]
  }

  /**
   * Process a single email from the queue
   */
  private async processEmail(email: QueuedEmail): Promise<EmailResult> {
    const emailService = getEmailService()
    
    // Update status to processing
    this.storage.update(email.id, { 
      status: 'processing',
      lastAttemptAt: new Date()
    })
    this.storage.addLog(email.id, 'attempt', `Attempt ${email.attempts + 1}/${email.maxAttempts}`)

    try {
      let result: EmailResult

      if (email.templateType && email.templateProps) {
        // Send using template
        result = await emailService.sendTemplate(
          email.templateType as any,
          email.recipient,
          email.templateProps as any
        )
      } else if (email.rawEmail) {
        // Send raw email
        result = await emailService.send(email.rawEmail)
      } else {
        throw new Error('No email content provided')
      }

      if (result.success) {
        // Mark as sent
        this.storage.update(email.id, {
          status: 'sent',
          sentAt: new Date()
        })
        this.storage.addLog(email.id, 'sent', `Email sent successfully. Message ID: ${result.messageId}`)
        return result
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Check if we should retry
      if (email.attempts + 1 < email.maxAttempts) {
        // Schedule retry
        const nextAttemptAt = this.getNextRetryTime(email.attempts + 1)
        this.storage.update(email.id, {
          attempts: email.attempts + 1,
          status: 'pending',
          nextAttemptAt,
          error: errorMessage
        })
        this.storage.addLog(email.id, 'retry', `Retry scheduled for ${nextAttemptAt.toISOString()}`, errorMessage)
        return { success: false, error: errorMessage }
      } else {
        // Max attempts reached, mark as failed
        this.storage.update(email.id, {
          status: 'failed',
          error: errorMessage
        })
        this.storage.addLog(email.id, 'failed', 'Max attempts reached', errorMessage)
        return { success: false, error: errorMessage }
      }
    }
  }

  /**
   * Process the queue
   */
  async processQueue(): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (this.processing) {
      return { processed: 0, succeeded: 0, failed: 0 }
    }

    this.processing = true
    const stats = { processed: 0, succeeded: 0, failed: 0 }

    try {
      const pending = this.storage.getPending(this.config.batchSize)
        .filter(e => 
          e.status === 'pending' &&
          (!e.nextAttemptAt || e.nextAttemptAt <= new Date()) &&
          !this.currentProcessing.has(e.id)
        )

      // Process in batches with concurrency limit
      for (let i = 0; i < pending.length; i += this.config.concurrency) {
        const batch = pending.slice(i, i + this.config.concurrency)
        
        const results = await Promise.all(
          batch.map(async email => {
            this.currentProcessing.add(email.id)
            try {
              const result = await this.processEmail(email)
              return { email, result }
            } finally {
              this.currentProcessing.delete(email.id)
            }
          })
        )

        for (const { result } of results) {
          stats.processed++
          if (result.success) {
            stats.succeeded++
          } else {
            stats.failed++
          }
        }
      }
    } finally {
      this.processing = false
    }

    return stats
  }

  /**
   * Start automatic queue processing
   */
  startProcessing(): void {
    if (this.processTimer) return

    this.processTimer = setInterval(() => {
      this.processQueue().catch(console.error)
    }, this.config.processInterval)

    console.log(`Email queue processing started (interval: ${this.config.processInterval}ms)`)
  }

  /**
   * Stop automatic queue processing
   */
  stopProcessing(): void {
    if (this.processTimer) {
      clearInterval(this.processTimer)
      this.processTimer = undefined
      console.log('Email queue processing stopped')
    }
  }

  // ==========================================
  // Queue Management Methods
  // ==========================================

  /**
   * Get email by ID
   */
  get(id: string): QueuedEmail | undefined {
    return this.storage.get(id)
  }

  /**
   * Cancel a queued email
   */
  cancel(id: string): boolean {
    const email = this.storage.get(id)
    if (email && email.status === 'pending') {
      this.storage.update(id, { status: 'cancelled' })
      this.storage.addLog(id, 'cancelled', 'Email cancelled by user')
      return true
    }
    return false
  }

  /**
   * Retry a failed email
   */
  retry(id: string): boolean {
    const email = this.storage.get(id)
    if (email && email.status === 'failed') {
      this.storage.update(id, {
        status: 'pending',
        attempts: 0,
        nextAttemptAt: new Date(),
        error: undefined
      })
      this.storage.addLog(id, 'retry', 'Manual retry triggered')
      return true
    }
    return false
  }

  /**
   * Get queue statistics
   */
  getStats(): EmailQueueStats {
    return this.storage.getStats()
  }

  /**
   * Get emails by recipient
   */
  getByRecipient(recipient: string): QueuedEmail[] {
    return this.storage.getByRecipient(recipient)
  }

  /**
   * Get logs for an email
   */
  getLogs(emailId?: string, limit?: number): EmailLogEntry[] {
    return this.storage.getLogs(emailId, limit)
  }

  /**
   * Cleanup old emails
   */
  cleanup(olderThanDays?: number): number {
    return this.storage.cleanup(olderThanDays)
  }

  // ==========================================
  // Convenience Methods
  // ==========================================

  async queueWelcomeEmail(
    to: string,
    props: Omit<WelcomeEmailProps, 'locale'>,
    options?: SendEmailOptions & { priority?: EmailPriority; scheduledAt?: Date }
  ): Promise<string> {
    return this.queueTemplate(to, 'welcome', { ...props, locale: options?.locale }, options)
  }

  async queueVerificationEmail(
    to: string,
    props: Omit<VerificationEmailProps, 'locale'>,
    options?: SendEmailOptions & { priority?: EmailPriority; scheduledAt?: Date }
  ): Promise<string> {
    return this.queueTemplate(to, 'verification', { ...props, locale: options?.locale }, options)
  }

  async queuePasswordResetEmail(
    to: string,
    props: Omit<PasswordResetEmailProps, 'locale'>,
    options?: SendEmailOptions & { priority?: EmailPriority; scheduledAt?: Date }
  ): Promise<string> {
    return this.queueTemplate(to, 'passwordReset', { ...props, locale: options?.locale }, options)
  }

  async queueSubscriptionCreatedEmail(
    to: string,
    props: Omit<SubscriptionCreatedEmailProps, 'locale'>,
    options?: SendEmailOptions & { priority?: EmailPriority; scheduledAt?: Date }
  ): Promise<string> {
    return this.queueTemplate(to, 'subscriptionCreated', { ...props, locale: options?.locale }, options)
  }

  async queueSubscriptionCancelledEmail(
    to: string,
    props: Omit<SubscriptionCancelledEmailProps, 'locale'>,
    options?: SendEmailOptions & { priority?: EmailPriority; scheduledAt?: Date }
  ): Promise<string> {
    return this.queueTemplate(to, 'subscriptionCancelled', { ...props, locale: options?.locale }, options)
  }

  async queuePaymentFailedEmail(
    to: string,
    props: Omit<PaymentFailedEmailProps, 'locale'>,
    options?: SendEmailOptions & { priority?: EmailPriority; scheduledAt?: Date }
  ): Promise<string> {
    return this.queueTemplate(to, 'paymentFailed', { ...props, locale: options?.locale }, options)
  }

  async queueProjectCompletedEmail(
    to: string,
    props: Omit<ProjectCompletedEmailProps, 'locale'>,
    options?: SendEmailOptions & { priority?: EmailPriority; scheduledAt?: Date }
  ): Promise<string> {
    return this.queueTemplate(to, 'projectCompleted', { ...props, locale: options?.locale }, options)
  }

  async queueAgentExecutionEmail(
    to: string,
    props: Omit<AgentExecutionEmailProps, 'locale'>,
    options?: SendEmailOptions & { priority?: EmailPriority; scheduledAt?: Date }
  ): Promise<string> {
    return this.queueTemplate(to, 'agentExecution', { ...props, locale: options?.locale }, options)
  }

  async queueInvoiceEmail(
    to: string,
    props: Omit<InvoiceEmailProps, 'locale'>,
    options?: SendEmailOptions & { priority?: EmailPriority; scheduledAt?: Date }
  ): Promise<string> {
    return this.queueTemplate(to, 'invoice', { ...props, locale: options?.locale }, options)
  }
}

// ==========================================
// Singleton Instance
// ==========================================

let emailQueueInstance: EmailQueue | null = null

export function getEmailQueue(): EmailQueue {
  if (!emailQueueInstance) {
    emailQueueInstance = new EmailQueue()
  }
  return emailQueueInstance
}

// Reset singleton (useful for testing)
export function resetEmailQueue(): void {
  if (emailQueueInstance) {
    emailQueueInstance.stopProcessing()
    emailQueueInstance = null
  }
}

// Default export
export default EmailQueue
