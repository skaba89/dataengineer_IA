// AI Data Engineering System - API: Autonomous Execution

import { NextRequest, NextResponse } from 'next/server';
import { getAutonomousEngine } from '@/lib/agents/core/autonomous-engine';
import { db } from '@/lib/db';

// POST /api/autonomous/start - Start autonomous workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, projectData, config } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project from database if not provided
    let data = projectData;
    if (!data) {
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: { organization: true },
      });
      
      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        );
      }
      
      data = {
        id: project.id,
        name: project.name,
        status: project.status,
        industry: project.organization?.industry,
      };
    }

    // Get engine and start workflow
    const engine = getAutonomousEngine(config);

    // Execute workflow asynchronously
    const workflowPromise = engine.runWorkflow(projectId, data);

    // Return immediately with workflow info
    // The actual execution happens in the background
    return NextResponse.json({
      success: true,
      message: 'Autonomous workflow started',
      projectId,
      status: 'running',
    });

  } catch (error) {
    console.error('Autonomous workflow error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/autonomous/status - Get workflow status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      // Return all active workflows
      const engine = getAutonomousEngine();
      const workflows = engine.getActiveWorkflows();
      
      return NextResponse.json({
        success: true,
        activeWorkflows: workflows.length,
        workflows: workflows.map(w => ({
          id: w.id,
          projectId: w.projectId,
          status: w.status,
          currentStep: w.currentStep,
          totalSteps: w.steps.length,
          startedAt: w.startedAt,
        })),
      });
    }

    // Get specific project status
    const executions = await db.agentExecution.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const deliverables = await db.deliverable.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate progress
    const totalSteps = 5; // Standard workflow has 5 steps
    const completedSteps = executions.filter(e => e.status === 'completed').length;
    const progress = (completedSteps / totalSteps) * 100;

    return NextResponse.json({
      success: true,
      projectId,
      progress,
      executions: executions.map(e => ({
        id: e.id,
        agentType: e.agentType,
        status: e.status,
        duration: e.duration,
        createdAt: e.createdAt,
        error: e.error,
      })),
      deliverables: deliverables.map(d => ({
        id: d.id,
        type: d.type,
        name: d.name,
        format: d.format,
        createdAt: d.createdAt,
      })),
      artifactsCount: deliverables.length,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get status' },
      { status: 500 }
    );
  }
}

// DELETE /api/autonomous/cancel - Cancel workflow
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const engine = getAutonomousEngine();
    const cancelled = await engine.cancelWorkflow(workflowId);

    return NextResponse.json({
      success: cancelled,
      message: cancelled ? 'Workflow cancelled' : 'Workflow not found',
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to cancel workflow' },
      { status: 500 }
    );
  }
}
