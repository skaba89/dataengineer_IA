// @ts-nocheck
// AI Data Engineering System - Billing & Subscription Management
// Stripe Integration for SaaS monetization

import Stripe from "stripe"
import { db } from "@/lib/db"

// ============================================
// Types & Interfaces
// ============================================

export type SubscriptionPlan = "starter" | "professional" | "enterprise" | "agency"
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing" | "incomplete"

export interface SubscriptionLimits {
  projects: number // -1 = unlimited
  dataSources: number
  executions: number // per month
  exports: number // per month
  teamMembers: number
  templates: "basic" | "all" | string[]
  features: string[]
  storage: number // in GB
  apiCalls: number // per month
  support: "email" | "priority" | "dedicated"
  sla?: string
  sso?: boolean
  whiteLabel?: boolean
  customDomain?: boolean
  auditLogs?: boolean
}

export interface Subscription {
  id: string
  organizationId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  seats: number
  limits: SubscriptionLimits
  usage: UsageMetrics
}

export interface UsageMetrics {
  projects: number
  dataSources: number
  executions: number
  exports: number
  teamMembers: number
  storage: number
  apiCalls: number
  periodStart: Date
  periodEnd: Date
}

// ============================================
// Subscription Plans Configuration
// ============================================

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, {
  name: string
  description: string
  price: number
  priceYearly: number
  limits: SubscriptionLimits
  features: string[]
  recommended?: boolean
}> = {
  starter: {
    name: "Starter",
    description: "Pour les startups et TPE qui débutent leur transformation data",
    price: 499,
    priceYearly: 4784, // 20% off
    limits: {
      projects: 1,
      dataSources: 3,
      executions: 50,
      exports: 5,
      teamMembers: 1,
      templates: ["retail", "saas", "ecommerce"],
      features: ["basic_connectors", "dbt_generation", "export_pdf"],
      storage: 5,
      apiCalls: 1000,
      support: "email",
    },
    features: [
      "1 projet actif",
      "3 sources de données",
      "50 exécutions/mois",
      "Templates basiques",
      "Support email",
      "Export PDF",
    ],
  },
  professional: {
    name: "Professional",
    description: "Pour les PME qui veulent accélérer leurs projets data",
    price: 1499,
    priceYearly: 14390, // 20% off
    limits: {
      projects: 5,
      dataSources: 10,
      executions: 500,
      exports: 50,
      teamMembers: 5,
      templates: "all",
      features: [
        "all_connectors",
        "dbt_generation",
        "airflow_generation",
        "dagster_generation",
        "export_pdf",
        "export_zip",
        "roi_calculator",
        "quality_reports",
        "scheduling",
      ],
      storage: 50,
      apiCalls: 10000,
      support: "priority",
    },
    features: [
      "5 projets actifs",
      "10 sources de données",
      "500 exécutions/mois",
      "Tous les templates",
      "Support prioritaire",
      "Export PDF & ZIP",
      "Calculateur ROI",
      "Orchestration (Airflow/Dagster)",
      "API Access",
    ],
    recommended: true,
  },
  enterprise: {
    name: "Enterprise",
    description: "Pour les grandes entreprises avec besoins avancés",
    price: 4999,
    priceYearly: 47990,
    limits: {
      projects: -1,
      dataSources: -1,
      executions: -1,
      exports: -1,
      teamMembers: -1,
      templates: "all",
      features: ["all"],
      storage: 500,
      apiCalls: -1,
      support: "dedicated",
      sla: "99.9%",
      sso: true,
      customDomain: true,
      auditLogs: true,
    },
    features: [
      "Projets illimités",
      "Sources illimitées",
      "Exécutions illimitées",
      "SSO (SAML, OIDC)",
      "Domaine personnalisé",
      "Audit logs",
      "SLA 99.9%",
      "Account manager dédié",
      "Formation incluse",
      "Support 24/7",
    ],
  },
  agency: {
    name: "Agency",
    description: "Pour les cabinets conseil et intégrateurs",
    price: 2999,
    priceYearly: 28790,
    limits: {
      projects: -1,
      dataSources: -1,
      executions: -1,
      exports: -1,
      teamMembers: -1,
      templates: "all",
      features: ["all"],
      storage: 200,
      apiCalls: -1,
      support: "dedicated",
      whiteLabel: true,
      customDomain: true,
    },
    features: [
      "Multi-clients",
      "White-label",
      "Facturation intégrée",
      "Portail client",
      "Templates personnalisés",
      "Commission marketplace",
      "Support dédié",
    ],
  },
}

// ============================================
// Stripe Configuration
// ============================================

// Initialize Stripe (only if secret key is available)
let stripe: Stripe | null = null
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-18.acacia' as Stripe.LatestApiVersion,
  })
}

export const STRIPE_PRODUCTS: Record<SubscriptionPlan, { productId: string; priceIds: { monthly: string; yearly: string } }> = {
  starter: {
    productId: "prod_starter",
    priceIds: {
      monthly: "price_starter_monthly",
      yearly: "price_starter_yearly",
    },
  },
  professional: {
    productId: "prod_professional",
    priceIds: {
      monthly: "price_professional_monthly",
      yearly: "price_professional_yearly",
    },
  },
  enterprise: {
    productId: "prod_enterprise",
    priceIds: {
      monthly: "price_enterprise_monthly",
      yearly: "price_enterprise_yearly",
    },
  },
  agency: {
    productId: "prod_agency",
    priceIds: {
      monthly: "price_agency_monthly",
      yearly: "price_agency_yearly",
    },
  },
}

// ============================================
// Billing Service
// ============================================

export class BillingService {
  /**
   * Create a new subscription for an organization
   */
  static async createSubscription(params: {
    organizationId: string
    plan: SubscriptionPlan
    billingPeriod: "monthly" | "yearly"
    email: string
    name: string
    paymentMethodId?: string
    trialDays?: number
  }): Promise<{ subscription: Subscription; checkoutUrl?: string }> {
    const { organizationId, plan, billingPeriod, email, name, paymentMethodId, trialDays } = params

    // Get plan configuration
    const planConfig = SUBSCRIPTION_PLANS[plan]
    if (!planConfig) {
      throw new Error(`Invalid plan: ${plan}`)
    }

    // Create Stripe customer if Stripe is configured
    let stripeCustomerId: string | undefined
    let stripeSubscriptionId: string | undefined
    let checkoutUrl: string | undefined

    if (stripe) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          organizationId,
        },
      })
      stripeCustomerId = customer.id

      // Create checkout session or subscription
      const priceId = STRIPE_PRODUCTS[plan].priceIds[billingPeriod]

      if (paymentMethodId) {
        // Direct subscription creation
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: priceId }],
          payment_behavior: "default_incomplete",
          payment_settings: {
            payment_method_types: ["card"],
            save_default_payment_method: "on_subscription",
          },
          expand: ["latest_invoice.payment_intent"],
          trial_period_days: trialDays,
        })
        stripeSubscriptionId = subscription.id
      } else {
        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customer.id,
          mode: "subscription",
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?subscription=canceled`,
          metadata: {
            organizationId,
            plan,
          },
        })
        checkoutUrl = session.url || undefined
      }
    }

    // Calculate period dates
    const now = new Date()
    const periodEnd = new Date(now)
    if (billingPeriod === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }

    // Create subscription in database
    const subscription = await db.subscription.create({
      data: {
        organizationId,
        plan,
        status: stripe ? "incomplete" : "active", // Without Stripe, auto-activate
        stripeCustomerId,
        stripeSubscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        trialEnd: trialDays ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : undefined,
        seats: 1,
        limits: planConfig.limits as any,
      },
    })

    // Update organization plan
    await db.organization.update({
      where: { id: organizationId },
      data: { plan },
    })

    return {
      subscription: {
        ...subscription,
        usage: await this.getUsageMetrics(organizationId),
      },
      checkoutUrl,
    }
  }

  /**
   * Upgrade or downgrade a subscription
   */
  static async changePlan(params: {
    organizationId: string
    newPlan: SubscriptionPlan
    billingPeriod?: "monthly" | "yearly"
  }): Promise<Subscription> {
    const { organizationId, newPlan, billingPeriod } = params

    // Get current subscription
    const currentSub = await db.subscription.findFirst({
      where: { organizationId, status: "active" },
    })

    if (!currentSub) {
      throw new Error("No active subscription found")
    }

    const planConfig = SUBSCRIPTION_PLANS[newPlan]

    // Update Stripe subscription if configured
    if (stripe && currentSub.stripeSubscriptionId) {
      const priceId = STRIPE_PRODUCTS[newPlan].priceIds[billingPeriod || "monthly"]

      const stripeSub = await stripe.subscriptions.retrieve(currentSub.stripeSubscriptionId)
      await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
        items: [
          {
            id: stripeSub.items.data[0].id,
            price: priceId,
          },
        ],
        proration_behavior: "always_invoice",
      })
    }

    // Update subscription in database
    const updated = await db.subscription.update({
      where: { id: currentSub.id },
      data: {
        plan: newPlan,
        limits: planConfig.limits as any,
      },
    })

    // Update organization plan
    await db.organization.update({
      where: { id: organizationId },
      data: { plan: newPlan },
    })

    return {
      ...updated,
      usage: await this.getUsageMetrics(organizationId),
    } as Subscription
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(params: {
    organizationId: string
    immediately?: boolean
    reason?: string
  }): Promise<Subscription> {
    const { organizationId, immediately, reason } = params

    const subscription = await db.subscription.findFirst({
      where: { organizationId, status: "active" },
    })

    if (!subscription) {
      throw new Error("No active subscription found")
    }

    // Cancel in Stripe
    if (stripe && subscription.stripeSubscriptionId) {
      if (immediately) {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
      } else {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        })
      }
    }

    // Update in database
    const updated = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: immediately ? "canceled" : subscription.status,
        cancelAtPeriodEnd: !immediately,
      },
    })

    return {
      ...updated,
      usage: await this.getUsageMetrics(organizationId),
    } as Subscription
  }

  /**
   * Reactivate a canceled subscription
   */
  static async reactivateSubscription(organizationId: string): Promise<Subscription> {
    const subscription = await db.subscription.findFirst({
      where: { organizationId },
    })

    if (!subscription) {
      throw new Error("No subscription found")
    }

    // Reactivate in Stripe
    if (stripe && subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      })
    }

    // Update in database
    const updated = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        status: "active",
      },
    })

    return {
      ...updated,
      usage: await this.getUsageMetrics(organizationId),
    } as Subscription
  }

  /**
   * Get subscription for an organization
   */
  static async getSubscription(organizationId: string): Promise<Subscription | null> {
    const subscription = await db.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    })

    if (!subscription) return null
    
    return {
      ...subscription,
      usage: await this.getUsageMetrics(organizationId),
    } as Subscription
  }

  /**
   * Get usage metrics for an organization
   */
  static async getUsageMetrics(organizationId: string): Promise<UsageMetrics> {
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [projects, dataSources, executions, exports, teamMembers] = await Promise.all([
      db.project.count({ where: { organizationId } }),
      db.dataSource.count({
        where: { project: { organizationId } },
      }),
      db.agentExecution.count({
        where: {
          project: { organizationId },
          createdAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      db.deliverable.count({
        where: {
          project: { organizationId },
          createdAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      db.user.count({ where: { organizationId } }),
    ])

    return {
      projects,
      dataSources,
      executions,
      exports,
      teamMembers,
      storage: 0, // TODO: Calculate actual storage
      apiCalls: 0, // TODO: Track API calls
      periodStart,
      periodEnd,
    }
  }

  /**
   * Check if organization has reached a limit
   */
  static async checkLimit(
    organizationId: string,
    limitType: keyof SubscriptionLimits
  ): Promise<{ allowed: boolean; current: number; limit: number; remaining: number }> {
    const subscription = await this.getSubscription(organizationId)
    if (!subscription) {
      return { allowed: false, current: 0, limit: 0, remaining: 0 }
    }

    const usage = await this.getUsageMetrics(organizationId)
    const limit = subscription.limits[limitType] as number

    // -1 means unlimited
    if (limit === -1) {
      return {
        allowed: true,
        current: usage[limitType as keyof UsageMetrics] as number,
        limit: -1,
        remaining: -1,
      }
    }

    const current = usage[limitType as keyof UsageMetrics] as number
    const remaining = Math.max(0, limit - current)
    const allowed = current < limit

    return { allowed, current, limit, remaining }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const organizationId = session.metadata?.organizationId
        const plan = session.metadata?.plan as SubscriptionPlan

        if (organizationId && plan) {
          await db.subscription.updateMany({
            where: { organizationId },
            data: {
              status: "active",
              stripeSubscriptionId: session.subscription as string,
            },
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription
        const currentPeriodStart = new Date(stripeSub.current_period_start * 1000)
        const currentPeriodEnd = new Date(stripeSub.current_period_end * 1000)
        await db.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSub.id },
          data: {
            status: stripeSub.status as SubscriptionStatus,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        })
        break
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription
        await db.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSub.id },
          data: { status: "canceled" },
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string | null
        if (subscriptionId) {
          await db.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: "past_due" },
          })
        }
        break
      }
    }
  }
}

// ============================================
// Feature Flags Helper
// ============================================

export function hasFeature(subscription: Subscription | null, feature: string): boolean {
  if (!subscription) return false

  const planConfig = SUBSCRIPTION_PLANS[subscription.plan]
  if (!planConfig) return false

  const features = planConfig.limits.features

  // "all" means all features are enabled
  if (features.includes("all")) return true

  return features.includes(feature)
}

export function isFeatureEnabled(subscription: Subscription | null, feature: keyof SubscriptionLimits): boolean {
  if (!subscription) return false
  return !!subscription.limits[feature]
}

// ============================================
// Billing API Helpers
// ============================================

export function formatPrice(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateSavings(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyYearly = monthlyPrice * 12
  return Math.round(((monthlyYearly - yearlyPrice) / monthlyYearly) * 100)
}
