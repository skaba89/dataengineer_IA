// DataSphere Innovation - Security Alerts API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Security } from '@/lib/security';
import { db } from '@/lib/db';

// GET - Get active security alerts
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
    const severity = searchParams.get('severity');
    const resolved = searchParams.get('resolved');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    if (severity) {
      where.severity = severity;
    }
    
    if (resolved !== null) {
      where.resolved = resolved === 'true';
    }

    const [events, total] = await Promise.all([
      db.securityEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      }),
      db.securityEvent.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      events: events.map(e => ({
        ...e,
        metadata: JSON.parse(e.metadata as string || '{}')
      })),
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('Get security alerts error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}

// POST - Create a security event/alert
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
    const { type, severity, message, source, metadata } = body;

    if (!type || !severity || !message) {
      return NextResponse.json(
        { success: false, error: 'Type, severity et message requis' },
        { status: 400 }
      );
    }

    const event = await Security.Events.create({
      type,
      severity,
      message,
      source: source || 'api',
      metadata: {
        ...metadata,
        userId: session.user.id,
        organizationId: session.user.organizationId
      }
    });

    return NextResponse.json({
      success: true,
      event
    });

  } catch (error) {
    console.error('Create security event error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'alerte' },
      { status: 500 }
    );
  }
}

// PATCH - Resolve a security event
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, notes } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID requis' },
        { status: 400 }
      );
    }

    await Security.Events.resolve(eventId, session.user.id);

    // Log the resolution
    await Security.Audit.log({
      userId: session.user.id,
      organizationId: session.user.organizationId || undefined,
      action: 'security.alert',
      resource: 'security_event',
      resourceId: eventId,
      details: { action: 'resolved', notes },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'success',
      riskLevel: 'low',
      metadata: {}
    });

    return NextResponse.json({
      success: true,
      message: 'Alerte résolue avec succès'
    });

  } catch (error) {
    console.error('Resolve security event error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la résolution de l\'alerte' },
      { status: 500 }
    );
  }
}
