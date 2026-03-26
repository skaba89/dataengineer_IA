// AI Data Engineering System - Demo Center
// Generates personalized proof-of-concept environments for prospects

import { db } from "@/lib/db"
import { nanoid } from "nanoid"

// ============================================
// Types & Interfaces
// ============================================

export interface ProspectInfo {
  companyName: string
  industry: string
  contactEmail: string
  contactName: string
  objectives: string[]
  currentTools?: string[]
  dataVolume?: "small" | "medium" | "large" | "very_large"
  timeline?: string
  budget?: string
  referralSource?: string
}

export interface DemoEnvironment {
  id: string
  prospectId: string
  organizationId: string
  userId: string
  demoUrl: string
  adminUrl: string
  expiresAt: Date
  credentials: {
    email: string
    password: string
  }
  customizations: {
    logo?: string
    primaryColor?: string
    companyName: string
  }
  sampleData: {
    projects: number
    dataSources: number
    pipelines: number
    dashboards: number
  }
  tracking: {
    visits: number
    lastVisit?: Date
    actions: string[]
    mostViewedPages: string[]
  }
}

export interface DemoTemplate {
  industry: string
  name: string
  description: string
  previewScreenshots: string[]
  sampleProjects: {
    name: string
    description: string
    dataSources: string[]
    kpis: string[]
  }[]
}

// ============================================
// Demo Templates by Industry
// ============================================

export const DEMO_TEMPLATES: Record<string, DemoTemplate> = {
  retail: {
    industry: "retail",
    name: "Retail Analytics Demo",
    description: "Complete retail analytics with POS, inventory, and customer data",
    previewScreenshots: ["/demos/retail-dashboard.png", "/demos/retail-sales.png"],
    sampleProjects: [
      {
        name: "Retail Analytics Platform",
        description: "End-to-end retail analytics with sales, inventory, and customer insights",
        dataSources: ["PostgreSQL (POS)", "Shopify", "Google Analytics"],
        kpis: ["Revenue", "AOV", "Inventory Turnover", "Customer LTV"],
      },
    ],
  },
  ecommerce: {
    industry: "ecommerce",
    name: "E-Commerce Growth Demo",
    description: "Full e-commerce stack with conversion funnel and attribution",
    previewScreenshots: ["/demos/ecommerce-funnel.png", "/demos/ecommerce-revenue.png"],
    sampleProjects: [
      {
        name: "E-Commerce Intelligence",
        description: "Conversion optimization and customer journey analytics",
        dataSources: ["Shopify", "Google Analytics 4", "Meta Ads", "Klaviyo"],
        kpis: ["Conversion Rate", "CAC", "ROAS", "LTV:CAC"],
      },
    ],
  },
  finance: {
    industry: "finance",
    name: "Financial Services Demo",
    description: "Risk analytics, fraud detection, and regulatory reporting",
    previewScreenshots: ["/demos/finance-risk.png", "/demos/finance-compliance.png"],
    sampleProjects: [
      {
        name: "Financial Risk Platform",
        description: "Credit risk scoring and fraud detection",
        dataSources: ["Core Banking", "Trading Platform", "CRM"],
        kpis: ["NPL Ratio", "Fraud Detection Rate", "VaR", "Cost-to-Income"],
      },
    ],
  },
  healthcare: {
    industry: "healthcare",
    name: "Healthcare Analytics Demo",
    description: "Patient outcomes, quality metrics, and operational efficiency",
    previewScreenshots: ["/demos/healthcare-quality.png", "/demos/healthcare-operations.png"],
    sampleProjects: [
      {
        name: "Hospital Intelligence",
        description: "Clinical outcomes and operational analytics",
        dataSources: ["EHR", "Billing System", "Quality Measures"],
        kpis: ["LOS", "Readmission Rate", "Bed Occupancy", "Patient Satisfaction"],
      },
    ],
  },
  saas: {
    industry: "saas",
    name: "SaaS Metrics Demo",
    description: "MRR/ARR tracking, cohort analysis, and customer health",
    previewScreenshots: ["/demos/saas-mrr.png", "/demos/saas-cohorts.png"],
    sampleProjects: [
      {
        name: "SaaS Analytics Platform",
        description: "Subscription metrics and customer success analytics",
        dataSources: ["Stripe", "Product Analytics", "CRM", "Support"],
        kpis: ["MRR", "Churn Rate", "NRR", "LTV"],
      },
    ],
  },
  manufacturing: {
    industry: "manufacturing",
    name: "Manufacturing Intelligence Demo",
    description: "OEE, quality control, and predictive maintenance",
    previewScreenshots: ["/demos/manufacturing-oee.png", "/demos/manufacturing-quality.png"],
    sampleProjects: [
      {
        name: "Smart Factory Analytics",
        description: "Production efficiency and quality monitoring",
        dataSources: ["MES/SCADA", "Quality System", "ERP"],
        kpis: ["OEE", "First Pass Yield", "MTBF", "Scrap Rate"],
      },
    ],
  },
}

// ============================================
// Demo Center Service
// ============================================

export class DemoCenterService {
  /**
   * Create a new demo environment for a prospect
   */
  static async createDemoEnvironment(prospect: ProspectInfo): Promise<DemoEnvironment> {
    const demoId = `demo_${nanoid(12)}`
    const prospectId = `prospect_${nanoid(8)}`

    // Generate secure password
    const password = generateSecurePassword()

    // Create demo organization
    const organization = await db.organization.create({
      data: {
        name: `${prospect.companyName} (Demo)`,
        slug: demoId,
        industry: prospect.industry,
        plan: "professional",
        settings: JSON.stringify({
          isDemo: true,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          prospectInfo: prospect,
        }),
      },
    })

    // Create demo user
    const user = await db.user.create({
      data: {
        email: `demo@${demoId}.com`,
        name: prospect.contactName || "Demo User",
        role: "admin",
        organizationId: organization.id,
        password: await hashPassword(password),
      },
    })

    // Populate with sample data
    const sampleData = await populateSampleData(organization.id, prospect.industry)

    // Track the demo request
    await db.demoTracking.create({
      data: {
        id: demoId,
        prospectId,
        organizationId: organization.id,
        userId: user.id,
        prospectInfo: JSON.stringify(prospect),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "created",
      },
    })

    return {
      id: demoId,
      prospectId,
      organizationId: organization.id,
      userId: user.id,
      demoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/demo/${demoId}`,
      adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      credentials: {
        email: `demo@${demoId}.com`,
        password,
      },
      customizations: {
        companyName: prospect.companyName,
      },
      sampleData,
      tracking: {
        visits: 0,
        actions: [],
        mostViewedPages: [],
      },
    }
  }

  /**
   * Get demo environment by ID
   */
  static async getDemoEnvironment(demoId: string): Promise<DemoEnvironment | null> {
    const tracking = await db.demoTracking.findUnique({
      where: { id: demoId },
    })

    if (!tracking) return null

    const organization = await db.organization.findUnique({
      where: { id: tracking.organizationId },
    })

    const [projects, dataSources, pipelines, dashboards] = await Promise.all([
      db.project.count({ where: { organizationId: tracking.organizationId } }),
      db.dataSource.count({
        where: { project: { organizationId: tracking.organizationId } },
      }),
      db.pipeline.count({
        where: { project: { organizationId: tracking.organizationId } },
      }),
      db.dashboard.count({
        where: { project: { organizationId: tracking.organizationId } },
      }),
    ])

    return {
      id: demoId,
      prospectId: tracking.prospectId,
      organizationId: tracking.organizationId,
      userId: tracking.userId,
      demoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/demo/${demoId}`,
      adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      expiresAt: tracking.expiresAt,
      credentials: {
        email: `demo@${demoId}.com`,
        password: "********", // Don't expose password
      },
      customizations: {
        companyName: organization?.name || "Demo",
      },
      sampleData: { projects, dataSources, pipelines, dashboards },
      tracking: {
        visits: tracking.visits,
        lastVisit: tracking.lastVisit || undefined,
        actions: JSON.parse(tracking.actions || "[]"),
        mostViewedPages: JSON.parse(tracking.mostViewedPages || "[]"),
      },
    }
  }

  /**
   * Track demo visit
   */
  static async trackVisit(demoId: string, page: string): Promise<void> {
    const tracking = await db.demoTracking.findUnique({
      where: { id: demoId },
    })

    if (!tracking) return

    const mostViewedPages: string[] = JSON.parse(tracking.mostViewedPages || "[]")
    mostViewedPages.push(page)

    await db.demoTracking.update({
      where: { id: demoId },
      data: {
        visits: { increment: 1 },
        lastVisit: new Date(),
        mostViewedPages: JSON.stringify(mostViewedPages.slice(-20)), // Keep last 20
      },
    })
  }

  /**
   * Track demo action
   */
  static async trackAction(demoId: string, action: string): Promise<void> {
    const tracking = await db.demoTracking.findUnique({
      where: { id: demoId },
    })

    if (!tracking) return

    const actions: string[] = JSON.parse(tracking.actions || "[]")
    actions.push(`${new Date().toISOString()}: ${action}`)

    await db.demoTracking.update({
      where: { id: demoId },
      data: {
        actions: JSON.stringify(actions.slice(-50)), // Keep last 50 actions
      },
    })
  }

  /**
   * Convert demo to paid subscription
   */
  static async convertDemoToPaid(demoId: string, plan: string): Promise<{ success: boolean; message: string }> {
    const tracking = await db.demoTracking.findUnique({
      where: { id: demoId },
    })

    if (!tracking) {
      return { success: false, message: "Demo not found" }
    }

    // Mark demo as converted
    await db.demoTracking.update({
      where: { id: demoId },
      data: { status: "converted" },
    })

    // Update organization to remove demo flag
    await db.organization.update({
      where: { id: tracking.organizationId },
      data: {
        plan,
        settings: JSON.stringify({
          isDemo: false,
          convertedAt: new Date(),
        }),
      },
    })

    return { success: true, message: "Demo converted successfully" }
  }

  /**
   * Clean up expired demos
   */
  static async cleanupExpiredDemos(): Promise<number> {
    const expiredDemos = await db.demoTracking.findMany({
      where: {
        expiresAt: { lt: new Date() },
        status: "created",
      },
    })

    for (const demo of expiredDemos) {
      // Delete organization and all related data
      await db.organization.delete({
        where: { id: demo.organizationId },
      })

      // Mark demo as expired
      await db.demoTracking.update({
        where: { id: demo.id },
        data: { status: "expired" },
      })
    }

    return expiredDemos.length
  }

  /**
   * Get demo templates for an industry
   */
  static getDemoTemplates(industry: string): DemoTemplate[] {
    const industryTemplate = DEMO_TEMPLATES[industry]
    if (industryTemplate) {
      return [industryTemplate]
    }
    return Object.values(DEMO_TEMPLATES)
  }
}

// ============================================
// Helper Functions
// ============================================

async function populateSampleData(
  organizationId: string,
  industry: string
): Promise<{ projects: number; dataSources: number; pipelines: number; dashboards: number }> {
  const template = DEMO_TEMPLATES[industry] || DEMO_TEMPLATES.saas

  // Create sample project
  const project = await db.project.create({
    data: {
      name: template.sampleProjects[0].name,
      description: template.sampleProjects[0].description,
      status: "deployed",
      organizationId,
      ownerId: (await db.user.findFirst({ where: { organizationId } }))!.id,
    },
  })

  // Create sample data sources
  for (const source of template.sampleProjects[0].dataSources) {
    await db.dataSource.create({
      data: {
        name: source,
        type: source.includes("PostgreSQL") ? "postgresql" : "api",
        status: "connected",
        projectId: project.id,
      },
    })
  }

  // Create sample pipeline
  await db.pipeline.create({
    data: {
      name: `${template.sampleProjects[0].name} - Main Pipeline`,
      type: "elt",
      framework: "dbt",
      status: "deployed",
      schedule: "0 6 * * *",
      code: `# Sample dbt model generated for ${industry} demo\n\nSELECT * FROM source_table`,
      projectId: project.id,
    },
  })

  // Create sample dashboard
  await db.dashboard.create({
    data: {
      name: `${template.sampleProjects[0].name} Dashboard`,
      type: "metabase",
      status: "deployed",
      url: "#",
      config: JSON.stringify({
        charts: template.sampleProjects[0].kpis.map((kpi) => ({
          title: kpi,
          type: "kpi",
        })),
      }),
      projectId: project.id,
    },
  })

  // Create sample executions
  for (let i = 0; i < 5; i++) {
    await db.agentExecution.create({
      data: {
        agentType: ["discovery", "architecture", "pipeline", "transformation", "bi"][i],
        status: "completed",
        duration: Math.floor(Math.random() * 5000) + 1000,
        projectId: project.id,
        userId: (await db.user.findFirst({ where: { organizationId } }))!.id,
      },
    })
  }

  return {
    projects: 1,
    dataSources: template.sampleProjects[0].dataSources.length,
    pipelines: 1,
    dashboards: 1,
  }
}

function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%"
  let password = ""
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.hash(password, 10)
}

// ============================================
// Demo Landing Page Content Generator
// ============================================

export function generateDemoLandingContent(industry: string): {
  headline: string
  subheadline: string
  features: string[]
  cta: string
} {
  const template = DEMO_TEMPLATES[industry] || DEMO_TEMPLATES.saas

  const contents: Record<string, { headline: string; subheadline: string; features: string[]; cta: string }> = {
    retail: {
      headline: "Transformez vos données retail en insights actionnables",
      subheadline: "En 7 jours, voyez comment notre plateforme peut révolutionner votre analytique retail",
      features: [
        "Analyse des ventes en temps réel",
        "Optimisation des stocks automatique",
        "Segmentation client prédictive",
        "Prévision de la demande IA",
      ],
      cta: "Obtenir ma démo personnalisée",
    },
    ecommerce: {
      headline: "Multipliez votre taux de conversion par 3",
      subheadline: "Découvrez comment optimiser votre funnel e-commerce avec l'IA",
      features: [
        "Attribution multi-touch complète",
        "Analyse de cohortes avancée",
        "Détection de friction UX",
        "Recommandations personnalisées",
      ],
      cta: "Voir la démo e-commerce",
    },
    finance: {
      headline: "Réduisez vos risques de 40%",
      subheadline: "Plateforme analytique conforme et sécurisée pour les services financiers",
      features: [
        "Scoring crédit automatisé",
        "Détection de fraude temps réel",
        "Reporting réglementaire automatisé",
        "Analyse de portefeuille",
      ],
      cta: "Demander une démo sécurisée",
    },
    healthcare: {
      headline: "Améliorez les résultats patients de 25%",
      subheadline: "Analytics healthcare conformes HIPAA avec IA prédictive",
      features: [
        "Prédiction de réadmission",
        "Optimisation des lits",
        "Qualité et conformité",
        "Parcours patient 360°",
      ],
      cta: "Voir la démo healthcare",
    },
    saas: {
      headline: "Passez de $1M à $10M ARR",
      subheadline: "La plateforme analytics qui vous aide à scaler votre SaaS",
      features: [
        "MRR/ARR tracking automatisé",
        "Analyse de churn prédictive",
        "Customer health scoring",
        "Expansion revenue insights",
      ],
      cta: "Obtenir ma démo SaaS",
    },
    manufacturing: {
      headline: "Augmentez votre OEE de 15 points",
      subheadline: "L'intelligence manufacturière pour l'Industrie 4.0",
      features: [
        "OEE monitoring temps réel",
        "Maintenance prédictive",
        "Contrôle qualité automatisé",
        "Optimisation énergétique",
      ],
      cta: "Voir la démo manufacturing",
    },
  }

  return contents[industry] || contents.saas
}
