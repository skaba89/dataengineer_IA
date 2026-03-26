/**
 * DataSphere Innovation - Email Send API
 * API route for sending transactional emails
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getEmailService, EmailResult } from '@/lib/email/email-service'
import { getEmailQueue, EmailPriority } from '@/lib/email/email-queue'
import { EmailTemplateType, EmailLocale } from '@/lib/email/templates'

// ==========================================
// Validation Schemas
// ==========================================

const SendDirectSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  replyTo: z.string().email().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(), // Base64 encoded
    contentType: z.string().optional(),
    disposition: z.enum(['attachment', 'inline']).optional(),
  })).optional(),
  tags: z.record(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
})

const SendTemplateSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  templateType: z.enum([
    'welcome',
    'verification', 
    'passwordReset',
    'subscriptionCreated',
    'subscriptionCancelled',
    'paymentFailed',
    'projectCompleted',
    'agentExecution',
    'invoice'
  ] as [EmailTemplateType, ...EmailTemplateType[]]),
  templateProps: z.record(z.unknown()),
  locale: z.enum(['fr', 'en']).optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string().optional(),
    disposition: z.enum(['attachment', 'inline']).optional(),
  })).optional(),
  tags: z.record(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
})

const QueueEmailSchema = z.object({
  to: z.string().email(),
  templateType: z.enum([
    'welcome',
    'verification',
    'passwordReset', 
    'subscriptionCreated',
    'subscriptionCancelled',
    'paymentFailed',
    'projectCompleted',
    'agentExecution',
    'invoice'
  ] as [EmailTemplateType, ...EmailTemplateType[]]),
  templateProps: z.record(z.unknown()),
  locale: z.enum(['fr', 'en']).optional(),
  priority: z.enum(['high', 'normal', 'low']).optional(),
  scheduledAt: z.string().datetime().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string().optional(),
    disposition: z.enum(['attachment', 'inline']).optional(),
  })).optional(),
  tags: z.record(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
})

const RequestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('send-direct'), data: SendDirectSchema }),
  z.object({ action: z.literal('send-template'), data: SendTemplateSchema }),
  z.object({ action: z.literal('queue'), data: QueueEmailSchema }),
  z.object({ 
    action: z.literal('queue-stats'),
    data: z.object({}).optional() 
  }),
  z.object({ 
    action: z.literal('queue-process'),
    data: z.object({}).optional() 
  }),
  z.object({
    action: z.literal('queue-get'),
    data: z.object({ emailId: z.string() })
  }),
  z.object({
    action: z.literal('queue-cancel'),
    data: z.object({ emailId: z.string() })
  }),
  z.object({
    action: z.literal('queue-retry'),
    data: z.object({ emailId: z.string() })
  }),
  z.object({
    action: z.literal('queue-logs'),
    data: z.object({ 
      emailId: z.string().optional(),
      limit: z.number().min(1).max(100).optional() 
    })
  }),
])

// ==========================================
// API Key Validation
// ==========================================

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || 
                 request.headers.get('authorization')?.replace('Bearer ', '')
  
  // Check against environment variable or allow in development
  const validApiKey = process.env.EMAIL_API_KEY
  
  if (!validApiKey) {
    // In development mode, allow requests without API key
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    return false
  }
  
  return apiKey === validApiKey
}

// ==========================================
// Response Helpers
// ==========================================

function successResponse(data: unknown) {
  return NextResponse.json({ success: true, data })
}

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// ==========================================
// API Route Handler
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return errorResponse('Unauthorized: Invalid or missing API key', 401)
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return errorResponse(`Validation error: ${parsed.error.message}`)
    }

    const { action, data } = parsed.data

    // Handle different actions
    switch (action) {
      case 'send-direct': {
        const emailService = getEmailService()
        const result = await emailService.send({
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
          cc: data.cc,
          bcc: data.bcc,
          replyTo: data.replyTo,
          attachments: data.attachments?.map(a => ({
            filename: a.filename,
            content: Buffer.from(a.content, 'base64'),
            contentType: a.contentType,
            disposition: a.disposition,
          })),
          tags: data.tags,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        })
        
        return successResponse({ 
          messageId: result.messageId,
          success: result.success,
          error: result.error 
        })
      }

      case 'send-template': {
        const emailService = getEmailService()
        
        // Add locale to template props
        const propsWithLocale = {
          ...data.templateProps,
          locale: data.locale || 'fr'
        }

        const result = await emailService.sendTemplate(
          data.templateType,
          data.to,
          propsWithLocale as any,
          {
            locale: data.locale,
            cc: data.cc,
            bcc: data.bcc,
            attachments: data.attachments?.map(a => ({
              filename: a.filename,
              content: Buffer.from(a.content, 'base64'),
              contentType: a.contentType,
              disposition: a.disposition,
            })),
            tags: data.tags,
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
          }
        )

        return successResponse({
          messageId: result.messageId,
          success: result.success,
          error: result.error
        })
      }

      case 'queue': {
        const emailQueue = getEmailQueue()
        
        const propsWithLocale = {
          ...data.templateProps,
          locale: data.locale || 'fr'
        }

        const emailId = await emailQueue.queueTemplate(
          data.to,
          data.templateType,
          propsWithLocale as any,
          {
            priority: data.priority as EmailPriority,
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            attachments: data.attachments?.map(a => ({
              filename: a.filename,
              content: Buffer.from(a.content, 'base64'),
              contentType: a.contentType,
              disposition: a.disposition,
            })),
            tags: data.tags,
            metadata: data.metadata,
          }
        )

        return successResponse({ emailId, queued: true })
      }

      case 'queue-stats': {
        const emailQueue = getEmailQueue()
        const stats = emailQueue.getStats()
        return successResponse(stats)
      }

      case 'queue-process': {
        const emailQueue = getEmailQueue()
        const result = await emailQueue.processQueue()
        return successResponse(result)
      }

      case 'queue-get': {
        const emailQueue = getEmailQueue()
        const email = emailQueue.get(data.emailId)
        if (!email) {
          return errorResponse('Email not found', 404)
        }
        return successResponse(email)
      }

      case 'queue-cancel': {
        const emailQueue = getEmailQueue()
        const cancelled = emailQueue.cancel(data.emailId)
        return successResponse({ cancelled })
      }

      case 'queue-retry': {
        const emailQueue = getEmailQueue()
        const retried = emailQueue.retry(data.emailId)
        return successResponse({ retried })
      }

      case 'queue-logs': {
        const emailQueue = getEmailQueue()
        const logs = emailQueue.getLogs(data.emailId, data.limit || 50)
        return successResponse(logs)
      }

      default:
        return errorResponse('Unknown action')
    }
  } catch (error) {
    console.error('Email API error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

// ==========================================
// GET Handler - Available Templates
// ==========================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Get available templates
  if (searchParams.get('templates') === 'true') {
    const templates = [
      {
        type: 'welcome',
        description: 'Welcome email sent after user registration',
        requiredProps: ['userName', 'loginUrl', 'supportEmail'],
        optionalProps: ['companyName']
      },
      {
        type: 'verification',
        description: 'Email verification for account activation',
        requiredProps: ['userName', 'verificationUrl', 'expiresIn'],
        optionalProps: ['verificationCode', 'companyName']
      },
      {
        type: 'passwordReset',
        description: 'Password reset request email',
        requiredProps: ['userName', 'resetUrl', 'expiresIn'],
        optionalProps: ['companyName']
      },
      {
        type: 'subscriptionCreated',
        description: 'Subscription confirmation email',
        requiredProps: ['userName', 'planName', 'amount', 'billingCycle', 'nextBillingDate', 'manageUrl', 'features'],
        optionalProps: ['companyName']
      },
      {
        type: 'subscriptionCancelled',
        description: 'Subscription cancellation confirmation',
        requiredProps: ['userName', 'planName', 'endDate', 'reactivateUrl'],
        optionalProps: ['feedbackUrl', 'companyName']
      },
      {
        type: 'paymentFailed',
        description: 'Payment failure notification',
        requiredProps: ['userName', 'amount', 'attemptDate', 'updatePaymentUrl'],
        optionalProps: ['retryDate', 'invoiceNumber', 'companyName']
      },
      {
        type: 'projectCompleted',
        description: 'Project completion notification',
        requiredProps: ['userName', 'projectName', 'completionDate', 'projectUrl', 'summary'],
        optionalProps: ['companyName']
      },
      {
        type: 'agentExecution',
        description: 'Agent execution report email',
        requiredProps: ['userName', 'agentName', 'executionId', 'status', 'startTime', 'endTime', 'duration', 'detailsUrl'],
        optionalProps: ['metrics', 'errorMessage', 'companyName']
      },
      {
        type: 'invoice',
        description: 'Invoice email with PDF attachment',
        requiredProps: ['userName', 'invoiceNumber', 'amount', 'currency', 'dueDate', 'invoiceUrl', 'items'],
        optionalProps: ['companyName']
      }
    ]

    return NextResponse.json({ 
      success: true, 
      templates,
      locales: ['fr', 'en']
    })
  }

  // Get queue stats
  if (searchParams.get('stats') === 'true') {
    if (!validateApiKey(request)) {
      return errorResponse('Unauthorized', 401)
    }
    
    const emailQueue = getEmailQueue()
    const stats = emailQueue.getStats()
    return NextResponse.json({ success: true, stats })
  }

  // Default response
  return NextResponse.json({
    success: true,
    message: 'DataSphere Innovation Email API',
    version: '1.0.0',
    endpoints: {
      'POST /api/email/send': {
        actions: [
          'send-direct - Send email directly with HTML content',
          'send-template - Send email using a template',
          'queue - Add email to queue for later processing',
          'queue-stats - Get queue statistics',
          'queue-process - Manually process the queue',
          'queue-get - Get email by ID',
          'queue-cancel - Cancel a queued email',
          'queue-retry - Retry a failed email',
          'queue-logs - Get email logs'
        ]
      },
      'GET /api/email/send?templates=true': 'Get available templates',
      'GET /api/email/send?stats=true': 'Get queue statistics'
    }
  })
}
