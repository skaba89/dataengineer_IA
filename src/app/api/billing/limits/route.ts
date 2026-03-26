// AI Data Engineering System - API: Usage Limits Check
import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/billing';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// POST - Check if action is allowed within limits
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
    const { limitType } = body as { limitType: 'projects' | 'dataSources' | 'executions' | 'exports' | 'teamMembers' };

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.organizationId) {
      return NextResponse.json({
        success: true,
        allowed: false,
        reason: 'no_organization'
      });
    }

    const limitCheck = await BillingService.checkLimit(user.organizationId, limitType);

    return NextResponse.json({
      success: true,
      ...limitCheck
    });

  } catch (error) {
    console.error('Limit check error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

// GET - Get all limits for current organization
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.organizationId) {
      return NextResponse.json({
        success: true,
        limits: null,
        usage: null
      });
    }

    const subscription = await BillingService.getSubscription(user.organizationId);
    const usage = await BillingService.getUsageMetrics(user.organizationId);

    if (!subscription) {
      return NextResponse.json({
        success: true,
        limits: null,
        usage
      });
    }

    // Calculate all limits
    const limitTypes = ['projects', 'dataSources', 'executions', 'exports', 'teamMembers'] as const;
    const limits = await Promise.all(
      limitTypes.map(async (type) => {
        const check = await BillingService.checkLimit(user.organizationId!, type);
        return { type, ...check };
      })
    );

    return NextResponse.json({
      success: true,
      subscription,
      limits: Object.fromEntries(limits.map(l => [l.type, l])),
      usage
    });

  } catch (error) {
    console.error('Get limits error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
