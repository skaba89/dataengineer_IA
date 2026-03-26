// AI Data Engineering System - API: Scheduler for Automated Workflows

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Schedule types
export type ScheduleType = 'once' | 'daily' | 'weekly' | 'monthly' | 'on_demand';
export type ScheduleStatus = 'active' | 'paused' | 'completed' | 'failed';

export interface ScheduledWorkflow {
  id: string;
  name: string;
  projectId: string;
  scheduleType: ScheduleType;
  cronExpression?: string;
  nextRunAt?: Date;
  lastRunAt?: Date;
  lastStatus?: string;
  status: ScheduleStatus;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  runCount: number;
  successCount: number;
  failureCount: number;
}

// In-memory schedules store (in production, use database)
const schedulesStore: ScheduledWorkflow[] = [];

// Helper to calculate next run time
function calculateNextRun(scheduleType: ScheduleType, cronExpression?: string): Date {
  const now = new Date();
  
  switch (scheduleType) {
    case 'once':
      return now;
    case 'daily':
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0); // 6 AM next day
      return tomorrow;
    case 'weekly':
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(6, 0, 0, 0);
      return nextWeek;
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(6, 0, 0, 0);
      return nextMonth;
    case 'on_demand':
      return now;
    default:
      return now;
  }
}

// POST /api/scheduler - Create scheduled workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, projectId, scheduleType, cronExpression, config } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const schedule: ScheduledWorkflow = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || `Workflow for ${project.name}`,
      projectId,
      scheduleType: scheduleType || 'on_demand',
      cronExpression,
      nextRunAt: scheduleType !== 'on_demand' ? calculateNextRun(scheduleType, cronExpression) : undefined,
      status: 'active',
      config: config || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      runCount: 0,
      successCount: 0,
      failureCount: 0,
    };

    schedulesStore.push(schedule);

    return NextResponse.json({
      success: true,
      schedule,
      message: `Schedule created. ${scheduleType === 'on_demand' ? 'Ready to run on demand.' : `Next run: ${schedule.nextRunAt?.toISOString()}`}`,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

// GET /api/scheduler - List schedules or get specific schedule
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    if (scheduleId) {
      const schedule = schedulesStore.find(s => s.id === scheduleId);
      if (!schedule) {
        return NextResponse.json(
          { success: false, error: 'Schedule not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, schedule });
    }

    let schedules = [...schedulesStore];

    if (projectId) {
      schedules = schedules.filter(s => s.projectId === projectId);
    }

    if (status) {
      schedules = schedules.filter(s => s.status === status);
    }

    // Stats
    const stats = {
      total: schedulesStore.length,
      active: schedulesStore.filter(s => s.status === 'active').length,
      paused: schedulesStore.filter(s => s.status === 'paused').length,
      totalRuns: schedulesStore.reduce((sum, s) => sum + s.runCount, 0),
      totalSuccess: schedulesStore.reduce((sum, s) => sum + s.successCount, 0),
      totalFailures: schedulesStore.reduce((sum, s) => sum + s.failureCount, 0),
    };

    return NextResponse.json({
      success: true,
      schedules,
      stats,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// PATCH /api/scheduler - Update schedule status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId, status, action } = body;

    const schedule = schedulesStore.find(s => s.id === scheduleId);
    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Handle actions
    if (action === 'run_now') {
      // Trigger immediate execution
      schedule.lastRunAt = new Date();
      schedule.runCount += 1;
      schedule.updatedAt = new Date();
      
      // In production, this would trigger the actual workflow
      // For now, we'll update the schedule and return
      
      return NextResponse.json({
        success: true,
        message: 'Workflow triggered',
        schedule,
        executionId: `exec_${Date.now()}`,
      });
    }

    if (action === 'pause') {
      schedule.status = 'paused';
      schedule.updatedAt = new Date();
    }

    if (action === 'resume') {
      schedule.status = 'active';
      schedule.nextRunAt = calculateNextRun(schedule.scheduleType, schedule.cronExpression);
      schedule.updatedAt = new Date();
    }

    if (status) {
      schedule.status = status;
      schedule.updatedAt = new Date();
    }

    return NextResponse.json({
      success: true,
      schedule,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// DELETE /api/scheduler - Delete schedule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');

    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const index = schedulesStore.findIndex(s => s.id === scheduleId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    schedulesStore.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted',
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
