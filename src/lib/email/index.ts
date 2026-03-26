/**
 * DataSphere Innovation - Email Module
 * Main entry point for email services
 */

// Export email service
export {
  EmailService,
  getEmailService,
  resetEmailService,
  type EmailConfig,
  type EmailMessage,
  type EmailResult,
  type EmailAttachment,
  type EmailProvider,
  type SendEmailOptions,
  type TemplateDataMap
} from './email-service'

// Export email queue
export {
  EmailQueue,
  getEmailQueue,
  resetEmailQueue,
  type QueuedEmail,
  type EmailQueueStatus,
  type EmailPriority,
  type EmailQueueConfig,
  type EmailQueueStats,
  type EmailLogEntry
} from './email-queue'

// Export templates
export {
  // Template components
  WelcomeEmail,
  VerificationEmail,
  PasswordResetEmail,
  SubscriptionCreatedEmail,
  SubscriptionCancelledEmail,
  PaymentFailedEmail,
  ProjectCompletedEmail,
  AgentExecutionEmail,
  InvoiceEmail,
  
  // Layout components
  EmailLayout,
  EmailHeader,
  EmailContent,
  EmailButton,
  AlertBox,
  InfoCard,
  TrackingPixel,
  
  // Template types
  emailTemplates,
  type EmailTemplateType,
  type EmailLocale,
  
  // Template props
  type BaseEmailProps,
  type WelcomeEmailProps,
  type VerificationEmailProps,
  type PasswordResetEmailProps,
  type SubscriptionCreatedEmailProps,
  type SubscriptionCancelledEmailProps,
  type PaymentFailedEmailProps,
  type ProjectCompletedEmailProps,
  type AgentExecutionEmailProps,
  type InvoiceEmailProps
} from './templates'

// Convenience re-exports
export { default as emailService } from './email-service'
export { default as emailQueue } from './email-queue'
