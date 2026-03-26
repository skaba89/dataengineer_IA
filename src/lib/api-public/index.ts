// AI Data Engineering System - Public API v1
// RESTful API for external integrations

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

// ============================================
// API Types & Interfaces
// ============================================

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface APIKey {
  id: string
  key: string
  name: string
  organizationId: string
  permissions: string[]
  lastUsed?: Date
  expiresAt?: Date
  createdAt: Date
}

export interface APIRequestContext {
  apiKey: APIKey
  organizationId: string
  permissions: string[]
}

// ============================================
// Permission Definitions
// ============================================

export const API_PERMISSIONS = {
  // Read permissions
  "projects:read": "Read project information",
  "projects:write": "Create and update projects",
  "projects:delete": "Delete projects",
  "pipelines:read": "Read pipeline information",
  "pipelines:write": "Create and update pipelines",
  "pipelines:execute": "Execute pipelines",
  "datasources:read": "Read data source information",
  "datasources:write": "Create and update data sources",
  "executions:read": "Read execution history",
  "exports:read": "Export project deliverables",
  "webhooks:manage": "Create and manage webhooks",
  "templates:read": "Access marketplace templates",
  "templates:deploy": "Deploy templates to projects",

  // Admin permissions
  "admin:all": "Full administrative access",
  "admin:api_keys": "Manage API keys",
  "admin:team": "Manage team members",
} as const

export type APIPermission = keyof typeof API_PERMISSIONS

// ============================================
// API Authentication Middleware
// ============================================

export async function authenticateAPIRequest(
  request: NextRequest
): Promise<{ context: APIRequestContext } | { error: APIResponse }> {
  const authHeader = request.headers.get("authorization")
  const apiKeyHeader = request.headers.get("x-api-key")

  // Check for API key in header
  let apiKey = apiKeyHeader

  // Also check Bearer token
  if (!apiKey && authHeader?.startsWith("Bearer ")) {
    apiKey = authHeader.substring(7)
  }

  if (!apiKey) {
    return {
      error: {
        success: false,
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "API key required. Include it in X-API-Key header or Authorization: Bearer <key>",
        },
      },
    }
  }

  // Look up API key
  const keyRecord = await db.apiKey.findUnique({
    where: { key: apiKey },
    include: { organization: true },
  })

  if (!keyRecord) {
    return {
      error: {
        success: false,
        error: {
          code: "INVALID_API_KEY",
          message: "The provided API key is invalid or has been revoked",
        },
      },
    }
  }

  // Check expiration
  if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
    return {
      error: {
        success: false,
        error: {
          code: "API_KEY_EXPIRED",
          message: "The provided API key has expired",
        },
      },
    }
  }

  // Update last used
  await db.apiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsed: new Date() },
  })

  return {
    context: {
      apiKey: keyRecord as APIKey,
      organizationId: keyRecord.organizationId,
      permissions: keyRecord.permissions as string[],
    },
  }
}

// ============================================
// Permission Check Helper
// ============================================

export function hasPermission(context: APIRequestContext, permission: APIPermission): boolean {
  if (context.permissions.includes("admin:all")) return true
  return context.permissions.includes(permission)
}

export function requirePermission(context: APIRequestContext, permission: APIPermission): void {
  if (!hasPermission(context, permission)) {
    throw new APIError(403, "INSUFFICIENT_PERMISSIONS", `Missing required permission: ${permission}`)
  }
}

// ============================================
// Custom API Error
// ============================================

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "APIError"
  }

  toResponse(): NextResponse<APIResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: this.code,
          message: this.message,
          details: this.details,
        },
      },
      { status: this.statusCode }
    )
  }
}

// ============================================
// Request Validation Schemas
// ============================================

export const schemas = {
  createProject: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    industry: z.enum([
      "retail",
      "ecommerce",
      "finance",
      "healthcare",
      "saas",
      "manufacturing",
      "logistics",
      "other",
    ]),
    template: z.string().optional(),
    dataSources: z
      .array(
        z.object({
          name: z.string(),
          type: z.string(),
          config: z.record(z.unknown()).optional(),
        })
      )
      .optional(),
  }),

  createPipeline: z.object({
    name: z.string().min(1).max(100),
    type: z.enum(["extract", "transform", "load", "full_etl"]),
    framework: z.enum(["dbt", "airflow", "dagster", "prefect", "spark"]).optional(),
    schedule: z.string().optional(), // Cron expression
    config: z.record(z.unknown()).optional(),
  }),

  createDataSource: z.object({
    name: z.string().min(1).max(100),
    type: z.enum(["postgresql", "mysql", "mongodb", "bigquery", "snowflake", "api", "s3", "kafka"]),
    host: z.string().optional(),
    port: z.number().optional(),
    database: z.string().optional(),
    credentials: z
      .object({
        username: z.string().optional(),
        password: z.string().optional(),
        apiKey: z.string().optional(),
        connectionString: z.string().optional(),
      })
      .optional(),
  }),

  executePipeline: z.object({
    parameters: z.record(z.unknown()).optional(),
    async: z.boolean().default(true),
    notifyOnComplete: z.boolean().default(false),
  }),

  createWebhook: z.object({
    url: z.string().url(),
    events: z.array(z.enum([
      "project.created",
      "project.updated",
      "project.deleted",
      "pipeline.created",
      "pipeline.executed",
      "pipeline.failed",
      "execution.started",
      "execution.completed",
      "execution.failed",
      "export.ready",
    ])),
    secret: z.string().min(16).optional(),
    active: z.boolean().default(true),
  }),

  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
}

// ============================================
// API Response Helpers
// ============================================

export function successResponse<T>(data: T, meta?: APIResponse["meta"]): APIResponse<T> {
  return {
    success: true,
    data,
    meta,
  }
}

export function errorResponse(code: string, message: string, details?: Record<string, unknown>): APIResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  }
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): APIResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    },
  }
}

// ============================================
// Webhook Delivery
// ============================================

export async function deliverWebhook(params: {
  webhookId: string
  event: string
  payload: Record<string, unknown>
}): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const { webhookId, event, payload } = params

  const webhook = await db.webhook.findUnique({
    where: { id: webhookId },
  })

  if (!webhook || !webhook.active) {
    return { success: false, error: "Webhook not found or inactive" }
  }

  // Check if event is subscribed
  const events = webhook.events as string[]
  if (!events.includes(event)) {
    return { success: false, error: "Event not subscribed" }
  }

  const timestamp = Date.now()
  const body = JSON.stringify({
    id: `evt_${Buffer.from(`${webhookId}:${timestamp}`).toString("base64")}`,
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  })

  // Calculate signature
  const signature = await calculateSignature(body, webhook.secret || "")

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Event-Type": event,
        "X-Signature": signature,
        "X-Timestamp": String(timestamp),
        "User-Agent": "AI-Data-Engineering-Webhook/1.0",
      },
      body,
    })

    // Log delivery
    await db.webhookDelivery.create({
      data: {
        webhookId,
        event,
        payload: body,
        statusCode: response.status,
        success: response.ok,
        deliveredAt: new Date(),
      },
    })

    return { success: response.ok, statusCode: response.status }
  } catch (error) {
    // Log failed delivery
    await db.webhookDelivery.create({
      data: {
        webhookId,
        event,
        payload: body,
        statusCode: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        deliveredAt: new Date(),
      },
    })

    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function calculateSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const bodyData = encoder.encode(body)

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", key, bodyData)
  return Buffer.from(signature).toString("hex")
}

// ============================================
// API Rate Limiting
// ============================================

export async function checkRateLimit(
  apiKeyId: string,
  limit: number = 100,
  window: number = 60000 // 1 minute
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const key = `rate_limit:${apiKeyId}`
  const now = Date.now()
  const windowStart = now - window

  // Get current count from database or cache
  const rateLimit = await db.rateLimit.findUnique({
    where: { key },
  })

  if (!rateLimit || rateLimit.windowStart.getTime() < windowStart) {
    // Create new window
    await db.rateLimit.upsert({
      where: { key },
      update: {
        count: 1,
        windowStart: new Date(now),
      },
      create: {
        key,
        count: 1,
        windowStart: new Date(now),
      },
    })

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(now + window),
    }
  }

  if (rateLimit.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(rateLimit.windowStart.getTime() + window),
    }
  }

  // Increment count
  await db.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  })

  return {
    allowed: true,
    remaining: limit - rateLimit.count - 1,
    resetAt: new Date(rateLimit.windowStart.getTime() + window),
  }
}

// ============================================
// API Usage Tracking
// ============================================

export async function trackAPIUsage(params: {
  apiKeyId: string
  endpoint: string
  method: string
  statusCode: number
  duration: number
  organizationId: string
}): Promise<void> {
  const { apiKeyId, endpoint, method, statusCode, duration, organizationId } = params

  await db.apiUsage.create({
    data: {
      apiKeyId,
      organizationId,
      endpoint,
      method,
      statusCode,
      duration,
      timestamp: new Date(),
    },
  })

  // Update monthly usage count
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  await db.apiUsageMonthly.upsert({
    where: {
      apiKeyId_month: {
        apiKeyId,
        month: monthStart,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      apiKeyId,
      month: monthStart,
      count: 1,
    },
  })
}
