// AI Data Engineering System - Public Share API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/share/[token] - Get project by share token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Share token is required' },
        { status: 400 }
      );
    }

    // Find project by share token (stored in metadata)
    const projects = await db.project.findMany({
      where: {
        status: { not: 'draft' },
      },
      include: {
        organization: true,
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        deliverables: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Find project with matching token
    const project = projects.find(p => {
      // Generate deterministic token from project ID
      const expectedToken = Buffer.from(`share_${p.id}`).toString('base64url');
      return expectedToken === token;
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired share link' },
        { status: 404 }
      );
    }

    // Calculate progress
    const totalPhases = 5;
    const completedPhases = project.executions.filter(e => e.status === 'completed').length;
    const progress = (completedPhases / totalPhases) * 100;

    // Get latest execution for each phase
    const latestExecutions: Record<string, typeof project.executions[0]> = {};
    for (const exec of project.executions) {
      if (!latestExecutions[exec.agentType]) {
        latestExecutions[exec.agentType] = exec;
      }
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        industry: project.organization?.industry,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      progress: {
        percent: progress,
        completedPhases,
        totalPhases,
      },
      executions: Object.entries(latestExecutions).map(([agentType, exec]) => ({
        agentType,
        status: exec.status,
        duration: exec.duration,
        timestamp: exec.createdAt,
      })),
      deliverables: project.deliverables.map(d => ({
        id: d.id,
        type: d.type,
        name: d.name,
        format: d.format,
        createdAt: d.createdAt,
      })),
    });

  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shared project' },
      { status: 500 }
    );
  }
}

// POST /api/share - Generate share link for project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Generate share token
    const token = Buffer.from(`share_${projectId}`).toString('base64url');
    const shareUrl = `/share?token=${token}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      token,
    });

  } catch (error) {
    console.error('Generate share link error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}
