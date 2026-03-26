// AI Data Engineering System - API: Subscription Management
import { NextRequest, NextResponse } from 'next/server';
import { BillingService, SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/billing';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Get current subscription and usage
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
      where: { id: session.user.id },
      include: {
        organization: {
          include: {
            projects: true
          }
        }
      }
    });

    if (!user?.organizationId) {
      return NextResponse.json({
        success: true,
        subscription: null,
        usage: null,
        plans: SUBSCRIPTION_PLANS
      });
    }

    const subscription = await BillingService.getSubscription(user.organizationId);
    const usage = await BillingService.getUsageMetrics(user.organizationId);

    // Get invoices
    const invoices = subscription
      ? await db.invoice.findMany({
          where: { subscriptionId: subscription.id },
          orderBy: { createdAt: 'desc' },
          take: 12
        })
      : [];

    return NextResponse.json({
      success: true,
      subscription,
      usage,
      invoices,
      plans: SUBSCRIPTION_PLANS,
      organization: user.organization
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

// PATCH - Update subscription (upgrade/downgrade)
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
    const { action, newPlan, billingPeriod } = body;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    let result;

    switch (action) {
      case 'change_plan':
        result = await BillingService.changePlan({
          organizationId: user.organizationId,
          newPlan: newPlan as SubscriptionPlan,
          billingPeriod
        });
        break;

      case 'cancel':
        result = await BillingService.cancelSubscription({
          organizationId: user.organizationId,
          immediately: false
        });
        break;

      case 'reactivate':
        result = await BillingService.reactivateSubscription(user.organizationId);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Action invalide' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      subscription: result
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
