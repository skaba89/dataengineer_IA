// AI Data Engineering System - API: Workflow Execution (using Autonomous Engine)

import { NextRequest, NextResponse } from 'next/server';
import { getAutonomousEngine, type ExecutionStep } from '@/lib/agents/core/autonomous-engine';
import { db } from '@/lib/db';

// Workflow phases
const WORKFLOW_PHASES = [
  { id: 'business', name: 'Business Analysis', agent: 'business' },
  { id: 'discovery', name: 'Data Discovery', agent: 'discovery' },
  { id: 'architecture', name: 'Architecture Design', agent: 'architecture' },
  { id: 'pipeline', name: 'Pipeline Generation', agent: 'pipeline' },
  { id: 'transformation', name: 'Data Transformation', agent: 'transformation' },
  { id: 'bi', name: 'Dashboard Creation', agent: 'bi' },
];

// POST /api/workflow - Execute full workflow (synchronous with progress)
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

    // Store results
    const phases: Array<{
      phase: string;
      status: string;
      output?: string;
      artifacts?: Array<{ type: string; name: string; content: string }>;
      error?: string;
      duration?: number;
    }> = [];

    // Get engine
    const engine = getAutonomousEngine(config);

    // Execute workflow with progress callback
    const workflow = await engine.runWorkflow(
      projectId,
      data,
      (step: ExecutionStep, _index: number) => {
        // Progress callback - in a real implementation, this would use WebSockets
        console.log(`Step ${step.agentType}: ${step.status}`);
      }
    );

    // Convert workflow result to phases format
    for (const step of workflow.steps) {
      const phaseInfo = WORKFLOW_PHASES.find(p => p.agent === step.agentType);
      
      phases.push({
        phase: phaseInfo?.name || step.agentType,
        status: step.status,
        output: step.output?.rawResponse as string | undefined,
        artifacts: step.artifacts?.map(a => ({
          type: a.type,
          name: a.name,
          content: a.content.slice(0, 500) + '...', // Truncate for response
        })),
        error: step.error,
        duration: step.duration,
      });
    }

    // Calculate stats
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const totalDuration = workflow.totalDuration || 0;

    return NextResponse.json({
      success: workflow.status === 'completed',
      workflow: {
        id: workflow.id,
        projectId,
        status: workflow.status,
        phases,
        completedPhases,
        totalPhases: phases.length,
        totalDuration,
        error: workflow.error,
      },
    });

  } catch (error) {
    console.error('Workflow error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/workflow - Get workflow status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({
      success: true,
      phases: WORKFLOW_PHASES,
    });
  }

  try {
    const executions = await db.agentExecution.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const deliverables = await db.deliverable.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    // Get latest execution for each agent type
    const latestExecutions = new Map<string, typeof executions[0]>();
    for (const exec of executions) {
      if (!latestExecutions.has(exec.agentType)) {
        latestExecutions.set(exec.agentType, exec);
      }
    }

    // Build phase status
    const phasesWithStatus = WORKFLOW_PHASES.map(phase => {
      const exec = latestExecutions.get(phase.agent);
      return {
        ...phase,
        status: exec?.status || 'pending',
        duration: exec?.duration,
        lastRun: exec?.createdAt,
        error: exec?.error,
      };
    });

    // Calculate progress
    const completedCount = phasesWithStatus.filter(p => p.status === 'completed').length;
    const progress = (completedCount / WORKFLOW_PHASES.length) * 100;

    return NextResponse.json({
      success: true,
      projectId,
      progress,
      phases: phasesWithStatus,
      executions,
      deliverables,
      artifactsCount: deliverables.length,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflow status' },
      { status: 500 }
    );
  }
}
