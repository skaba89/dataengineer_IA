// AI Data Engineering System - API: Data Quality Monitoring
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { QualityMonitoringService } from '@/lib/quality';

// GET - Get quality report for a source or dashboard summary
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');
    const organizationId = searchParams.get('organizationId');

    if (sourceId) {
      // Get quality report for specific source
      const report = await QualityMonitoringService.runQualityCheck(sourceId);
      return NextResponse.json({ success: true, report });
    }

    if (organizationId) {
      // Get dashboard summary
      const summary = await QualityMonitoringService.getDashboardSummary(organizationId);
      return NextResponse.json({ success: true, summary });
    }

    return NextResponse.json({ success: false, error: 'Missing sourceId or organizationId' }, { status: 400 });

  } catch (error) {
    console.error('Quality API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// POST - Run quality check on demand
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sourceId, rules } = body;

    if (!sourceId) {
      return NextResponse.json({ success: false, error: 'sourceId is required' }, { status: 400 });
    }

    const report = await QualityMonitoringService.runQualityCheck(sourceId);
    return NextResponse.json({ success: true, report });

  } catch (error) {
    console.error('Quality check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
