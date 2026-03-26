// AI Data Engineering System - API: Stripe Checkout Session
import { NextRequest, NextResponse } from 'next/server';
import { BillingService, SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/billing';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

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
    const { plan, billingPeriod } = body as {
      plan: SubscriptionPlan;
      billingPeriod: 'monthly' | 'yearly'
    };

    // Validate plan
    if (!SUBSCRIPTION_PLANS[plan]) {
      return NextResponse.json(
        { success: false, error: 'Plan invalide' },
        { status: 400 }
      );
    }

    // Get user with organization
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Create or get organization
    let organization = user.organization;
    if (!organization) {
      organization = await db.organization.create({
        data: {
          name: `${user.name || user.email}'s Organization`,
          slug: `org-${user.id.slice(0, 8)}`,
          plan: plan,
          members: {
            connect: { id: user.id }
          }
        }
      });
    }

    // Create subscription
    const result = await BillingService.createSubscription({
      organizationId: organization.id,
      plan,
      billingPeriod,
      email: user.email!,
      name: user.name || user.email!,
      trialDays: 14, // 14-day free trial
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      subscription: result.subscription
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
