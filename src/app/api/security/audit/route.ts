// DataSphere Innovation - Security Audit Logs API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Security } from '@/lib/security';

// GET - Retrieve audit logs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status') as 'success' | 'failure' | 'blocked' | null;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { logs, total } = await Security.Audit.getAuditLogs({
      organizationId: session.user.organizationId || undefined,
      userId: searchParams.get('userId') || undefined,
      action: action as any,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || undefined,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      logs,
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des logs' },
      { status: 500 }
    );
  }
}

// POST - Create audit log entry (for external systems)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, resource, resourceId, details, status, riskLevel } = body;

    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const log = await Security.Audit.log({
      userId: session.user.id,
      organizationId: session.user.organizationId || undefined,
      action,
      resource,
      resourceId,
      details: details || {},
      ipAddress: ip,
      userAgent,
      status: status || 'success',
      riskLevel: riskLevel || 'low',
      metadata: {}
    });

    return NextResponse.json({
      success: true,
      log
    });

  } catch (error) {
    console.error('Create audit log error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du log' },
      { status: 500 }
    );
  }
}
