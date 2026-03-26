// @ts-nocheck
// Public API v1 - Workflows endpoint

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAutonomousEngine } from '@/lib/agents/core/autonomous-engine'

// Helper to start a workflow
async function startAutonomousWorkflow(params: {
  workflowType: string
  projectId: string
  input: Record<string, unknown>
  context?: Record<string, unknown>
}): Promise<string> {
  const engine = getAutonomousEngine()
  const project = await db.project.findUnique({
    where: { id: params.projectId }
  })
  
  if (!project) {
    throw new Error('Project not found')
  }
  
  const execution = await engine.runWorkflow(
    params.projectId,
    { ...project, ...params.input, ...params.context }
  )
  
  return execution.id
}

// GET /api/v1/workflows - List workflows
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (status) where.status = status

    const workflows = await db.workflowExecution.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        agentResults: {
          select: {
            agentType: true,
            success: true,
            confidence: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: workflows.map(w => ({
        id: w.id,
        project_id: w.projectId,
        type: w.type,
        status: w.status,
        progress: w.progress,
        created_at: w.createdAt,
        started_at: w.startedAt,
        completed_at: w.completedAt,
        agents: w.agentResults.map(a => ({
          type: a.agentType,
          success: a.success,
          confidence: a.confidence,
        }))
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

// POST /api/v1/workflows - Start a new workflow
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { project_id, type, input, context } = body

    if (!project_id || !input) {
      return NextResponse.json(
        { error: 'project_id and input are required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: project_id },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const workflowId = await startAutonomousWorkflow({
      workflowType: type || 'FULL_ANALYSIS',
      projectId: project_id,
      input,
      context,
    })

    return NextResponse.json({
      success: true,
      data: {
        workflow_id: workflowId,
        project_id: project_id,
        type: type || 'FULL_ANALYSIS',
        status: 'PENDING',
        message: 'Workflow started successfully',
      },
      links: {
        status: `/api/v1/workflows/${workflowId}`,
        cancel: `/api/v1/workflows/${workflowId}/cancel`,
      }
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start workflow', code: 'WORKFLOW_ERROR' },
      { status: 500 }
    )
  }
}
