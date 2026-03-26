// AI Data Engineering System - API: Stripe Webhook Handler
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { BillingService } from '@/lib/billing';
import { db } from '@/lib/db';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    // Handle the event
    await BillingService.handleWebhookEvent(event);

    // Additional custom handling
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organizationId;

        if (organizationId) {
          // Send welcome email or notification
          await db.notification.create({
            data: {
              type: 'subscription_created',
              title: 'Abonnement activé',
              message: 'Votre abonnement a été activé avec succès. Bienvenue !',
              userId: session.metadata?.userId || '',
              metadata: JSON.stringify({
                plan: session.metadata?.plan,
                subscriptionId: session.subscription
              })
            }
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;

        // Store invoice in database
        if (invoice.subscription) {
          const subscription = await db.subscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string }
          });

          if (subscription) {
            await db.invoice.create({
              data: {
                subscriptionId: subscription.id,
                stripeInvoiceId: invoice.id,
                amount: (invoice.amount_paid / 100),
                currency: invoice.currency.toUpperCase(),
                status: 'paid',
                invoicePdf: invoice.invoice_pdf || undefined,
                hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
                paidAt: new Date()
              }
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;

        // Send cancellation notification
        const subscription = await db.subscription.findFirst({
          where: { stripeSubscriptionId: stripeSub.id },
          include: { organization: { include: { members: true } } }
        });

        if (subscription?.organization.members[0]) {
          await db.notification.create({
            data: {
              type: 'subscription_canceled',
              title: 'Abonnement annulé',
              message: 'Votre abonnement a été annulé. Vos données seront conservées pendant 30 jours.',
              userId: subscription.organization.members[0].id
            }
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handling error:', error);
    return NextResponse.json(
      { error: 'Webhook handling failed' },
      { status: 500 }
    );
  }
}
