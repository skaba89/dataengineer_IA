// AI Data Engineering System - API: Executions History

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/executions - Get execution history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const agentType = searchParams.get('agentType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where = {
      ...(projectId && { projectId }),
      ...(agentType && { agentType }),
      ...(status && { status }),
    };

    const executions = await db.agentExecution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Calculate stats
    const stats = {
      total: executions.length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      running: executions.filter(e => e.status === 'running').length,
      avgDuration: executions
        .filter(e => e.duration)
        .reduce((sum, e) => sum + (e.duration || 0), 0) / executions.filter(e => e.duration).length || 0,
    };

    // Group by agent type
    const byAgent: Record<string, number> = {};
    executions.forEach(e => {
      byAgent[e.agentType] = (byAgent[e.agentType] || 0) + 1;
    });

    // Group by day (last 7 days)
    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      last7Days[key] = 0;
    }
    executions.forEach(e => {
      const key = e.createdAt.toISOString().split('T')[0];
      if (last7Days[key] !== undefined) {
        last7Days[key]++;
      }
    });

    return NextResponse.json({
      success: true,
      executions,
      stats,
      byAgent,
      last7Days,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}

// DELETE /api/executions - Clear execution history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const before = searchParams.get('before');

    const where = {
      ...(projectId && { projectId }),
      ...(before && { createdAt: { lt: new Date(before) } }),
    };

    const result = await db.agentExecution.deleteMany({ where });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete executions' },
      { status: 500 }
    );
  }
}
