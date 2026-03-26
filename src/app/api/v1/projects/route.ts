// @ts-nocheck
// Public API v1 - Projects endpoint

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Rate limiting (simple in-memory, use Redis in production)
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100 // requests per hour
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(apiKey: string): boolean {
  const now = Date.now()
  const limit = rateLimits.get(apiKey)
  
  if (!limit || now > limit.resetAt) {
    rateLimits.set(apiKey, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  
  if (limit.count >= RATE_LIMIT) {
    return false
  }
  
  limit.count++
  return true
}

// GET /api/v1/projects - List projects
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  if (!checkRateLimit(apiKey)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMIT' },
      { status: 429 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const projects = await db.project.findMany({
      where,
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        industry: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { artifacts: true, workflows: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
    })

    const total = await db.project.count({ where })

    return NextResponse.json({
      success: true,
      data: projects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        industry: p.industry,
        artifacts_count: p._count.artifacts,
        workflows_count: p._count.workflows,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

// POST /api/v1/projects - Create project
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  if (!checkRateLimit(apiKey)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMIT' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { name, description, industry, organization_id } = body

    if (!name) {
      return NextResponse.json(
        { error: 'name is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const project = await db.project.create({
      data: {
        name,
        description,
        industry,
        organizationId: organization_id,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        industry: project.industry,
        created_at: project.createdAt,
      },
    }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create project', code: 'CREATE_ERROR' },
      { status: 500 }
    )
  }
}
