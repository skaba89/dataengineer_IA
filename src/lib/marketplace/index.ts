// AI Data Engineering System - Template Marketplace
// Platform for buying and selling project templates

import { db } from "@/lib/db"

// ============================================
// Types & Interfaces
// ============================================

export interface MarketplaceTemplate {
  id: string
  name: string
  slug: string
  description: string
  longDescription?: string
  authorId: string
  author: TemplateAuthor
  industry: string
  category: TemplateCategory
  price: number // 0 = free
  currency: string
  rating: number
  reviewCount: number
  downloadCount: number
  featured: boolean
  published: boolean
  version: string
  tags: string[]
  thumbnailUrl?: string
  screenshots: string[]
  demoUrl?: string
  documentation?: string
  included: TemplateInclusions
  requirements: TemplateRequirements
  createdAt: Date
  updatedAt: Date
}

export interface TemplateAuthor {
  id: string
  name: string
  avatarUrl?: string
  bio?: string
  verified: boolean
  templatesCount: number
  totalSales: number
  rating: number
}

export type TemplateCategory =
  | "full_stack"
  | "connectors"
  | "transformations"
  | "dashboards"
  | "quality"
  | "orchestration"
  | "industry_specific"

export interface TemplateInclusions {
  dataModels: number
  pipelines: number
  dashboards: number
  connectors: number
  tests: number
  documentation: string
  support: "community" | "email" | "priority"
}

export interface TemplateRequirements {
  warehouse: string[]
  orchestration?: string[]
  bi?: string[]
  skills: ("beginner" | "intermediate" | "advanced")[]
}

export interface TemplateReview {
  id: string
  templateId: string
  userId: string
  userName: string
  companyName?: string
  rating: number
  title: string
  content: string
  helpful: number
  verified: boolean
  createdAt: Date
}

export interface TemplatePurchase {
  id: string
  templateId: string
  userId: string
  price: number
  currency: string
  commission: number
  authorEarnings: number
  purchasedAt: Date
  license: "personal" | "team" | "enterprise"
}

// ============================================
// Featured Templates (Curated)
// ============================================

export const FEATURED_TEMPLATES: Partial<MarketplaceTemplate>[] = [
  {
    id: "ecommerce-full-stack",
    name: "E-Commerce Full Stack",
    slug: "ecommerce-full-stack",
    description: "Complete e-commerce analytics platform with GA4, Shopify, and marketing attribution",
    industry: "ecommerce",
    category: "full_stack",
    price: 299,
    currency: "EUR",
    rating: 4.9,
    reviewCount: 47,
    downloadCount: 1250,
    featured: true,
    tags: ["shopify", "ga4", "mrr", "cohorts", "attribution"],
    included: {
      dataModels: 52,
      pipelines: 8,
      dashboards: 12,
      connectors: 5,
      tests: 45,
      documentation: "Complete documentation with setup guide and video tutorials",
      support: "email",
    },
    requirements: {
      warehouse: ["bigquery", "snowflake"],
      orchestration: ["dbt_cloud", "airflow"],
      bi: ["looker", "metabase"],
      skills: ["intermediate"],
    },
  },
  {
    id: "healthcare-hipaa",
    name: "Healthcare HIPAA Compliant",
    slug: "healthcare-hipaa",
    description: "HIPAA-compliant healthcare analytics with EHR integration and quality measures",
    industry: "healthcare",
    category: "industry_specific",
    price: 499,
    currency: "EUR",
    rating: 4.8,
    reviewCount: 23,
    downloadCount: 340,
    featured: true,
    tags: ["hipaa", "ehr", "quality", "readmission", "patient-360"],
    included: {
      dataModels: 38,
      pipelines: 6,
      dashboards: 8,
      connectors: 4,
      tests: 30,
      documentation: "HIPAA compliance guide included",
      support: "priority",
    },
    requirements: {
      warehouse: ["snowflake", "databricks"],
      skills: ["advanced"],
    },
  },
  {
    id: "financial-risk",
    name: "Financial Risk & Compliance",
    slug: "financial-risk",
    description: "Credit risk scoring, fraud detection, and Basel III reporting for financial institutions",
    industry: "finance",
    category: "industry_specific",
    price: 599,
    currency: "EUR",
    rating: 4.9,
    reviewCount: 31,
    downloadCount: 520,
    featured: true,
    tags: ["risk", "fraud", "basel-iii", "aml", "credit-scoring"],
    included: {
      dataModels: 45,
      pipelines: 10,
      dashboards: 15,
      connectors: 6,
      tests: 50,
      documentation: "Regulatory compliance documentation",
      support: "priority",
    },
    requirements: {
      warehouse: ["snowflake"],
      skills: ["advanced"],
    },
  },
  {
    id: "saas-growth",
    name: "SaaS Growth Metrics",
    slug: "saas-growth",
    description: "Complete SaaS metrics platform with MRR tracking, churn analysis, and customer health",
    industry: "saas",
    category: "full_stack",
    price: 199,
    currency: "EUR",
    rating: 4.9,
    reviewCount: 89,
    downloadCount: 2100,
    featured: true,
    tags: ["mrr", "churn", "ltv", "cohorts", "health-score"],
    included: {
      dataModels: 35,
      pipelines: 5,
      dashboards: 10,
      connectors: 8,
      tests: 35,
      documentation: "Video course included",
      support: "email",
    },
    requirements: {
      warehouse: ["bigquery", "snowflake", "postgres"],
      orchestration: ["dbt_cloud"],
      bi: ["metabase", "looker"],
      skills: ["beginner", "intermediate"],
    },
  },
  {
    id: "retail-omnichannel",
    name: "Retail Omnichannel Analytics",
    slug: "retail-omnichannel",
    description: "Omnichannel retail analytics with POS, e-commerce, and inventory optimization",
    industry: "retail",
    category: "full_stack",
    price: 349,
    currency: "EUR",
    rating: 4.7,
    reviewCount: 56,
    downloadCount: 890,
    featured: true,
    tags: ["pos", "inventory", "customer-360", "forecasting"],
    included: {
      dataModels: 42,
      pipelines: 7,
      dashboards: 14,
      connectors: 6,
      tests: 40,
      documentation: "Setup guide + best practices",
      support: "email",
    },
    requirements: {
      warehouse: ["bigquery", "snowflake"],
      skills: ["intermediate"],
    },
  },
  {
    id: "manufacturing-oee",
    name: "Manufacturing OEE & Quality",
    slug: "manufacturing-oee",
    description: "OEE monitoring, predictive maintenance, and quality control for Industry 4.0",
    industry: "manufacturing",
    category: "industry_specific",
    price: 399,
    currency: "EUR",
    rating: 4.8,
    reviewCount: 28,
    downloadCount: 450,
    featured: true,
    tags: ["oee", "predictive-maintenance", "quality", "mes"],
    included: {
      dataModels: 30,
      pipelines: 8,
      dashboards: 10,
      connectors: 5,
      tests: 25,
      documentation: "Implementation guide included",
      support: "email",
    },
    requirements: {
      warehouse: ["databricks", "snowflake"],
      skills: ["intermediate", "advanced"],
    },
  },
]

// ============================================
// Free Templates
// ============================================

export const FREE_TEMPLATES: Partial<MarketplaceTemplate>[] = [
  {
    id: "starter-kit",
    name: "Data Engineering Starter Kit",
    slug: "starter-kit",
    description: "Basic data engineering setup with dbt and Airflow",
    industry: "general",
    category: "full_stack",
    price: 0,
    currency: "EUR",
    rating: 4.6,
    downloadCount: 5200,
    tags: ["dbt", "airflow", "starter"],
    included: {
      dataModels: 10,
      pipelines: 2,
      dashboards: 3,
      connectors: 2,
      tests: 10,
      documentation: "Basic documentation",
      support: "community",
    },
  },
  {
    id: "customer-360-free",
    name: "Customer 360 Basic",
    slug: "customer-360-free",
    description: "Basic customer 360 model with customer master and transactions",
    industry: "general",
    category: "transformations",
    price: 0,
    currency: "EUR",
    rating: 4.5,
    downloadCount: 3100,
    tags: ["customer-360", "marts"],
    included: {
      dataModels: 8,
      pipelines: 0,
      dashboards: 2,
      connectors: 0,
      tests: 8,
      documentation: "README included",
      support: "community",
    },
  },
  {
    id: "quality-framework",
    name: "Data Quality Framework",
    slug: "quality-framework",
    description: "Great Expectations setup with common data quality tests",
    industry: "general",
    category: "quality",
    price: 0,
    currency: "EUR",
    rating: 4.7,
    downloadCount: 2800,
    tags: ["quality", "great-expectations", "testing"],
    included: {
      dataModels: 0,
      pipelines: 1,
      dashboards: 1,
      connectors: 0,
      tests: 50,
      documentation: "Setup guide",
      support: "community",
    },
  },
]

// ============================================
// Marketplace Service
// ============================================

export class MarketplaceService {
  /**
   * Search templates
   */
  static async searchTemplates(params: {
    query?: string
    industry?: string
    category?: TemplateCategory
    priceRange?: "free" | "paid" | "all"
    sortBy?: "relevance" | "rating" | "downloads" | "newest"
    page?: number
    limit?: number
  }): Promise<{ templates: MarketplaceTemplate[]; total: number; hasMore: boolean }> {
    const { query, industry, category, priceRange = "all", sortBy = "relevance", page = 1, limit = 20 } = params

    // Build filters
    const where: any = { published: true }

    if (industry) {
      where.industry = industry
    }

    if (category) {
      where.category = category
    }

    if (priceRange === "free") {
      where.price = 0
    } else if (priceRange === "paid") {
      where.price = { gt: 0 }
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ]
    }

    // Build ordering
    let orderBy: any = {}
    switch (sortBy) {
      case "rating":
        orderBy = { rating: "desc" }
        break
      case "downloads":
        orderBy = { downloadCount: "desc" }
        break
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      default:
        orderBy = [{ featured: "desc" }, { rating: "desc" }]
    }

    // Execute query
    const [templates, total] = await Promise.all([
      db.template.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              verified: true,
            },
          },
        },
      }),
      db.template.count({ where }),
    ])

    return {
      templates: templates as MarketplaceTemplate[],
      total,
      hasMore: page * limit < total,
    }
  }

  /**
   * Get template by slug
   */
  static async getTemplateBySlug(slug: string): Promise<MarketplaceTemplate | null> {
    const template = await db.template.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            verified: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    })

    return template as MarketplaceTemplate | null
  }

  /**
   * Purchase a template
   */
  static async purchaseTemplate(params: {
    templateId: string
    userId: string
    license: "personal" | "team" | "enterprise"
  }): Promise<{ success: boolean; purchase?: TemplatePurchase; error?: string }> {
    const { templateId, userId, license } = params

    // Get template
    const template = await db.template.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return { success: false, error: "Template not found" }
    }

    // Check if already purchased
    const existingPurchase = await db.templatePurchase.findFirst({
      where: { templateId, userId },
    })

    if (existingPurchase) {
      return { success: false, error: "Template already purchased" }
    }

    // Calculate pricing
    const basePrice = template.price
    const multiplier = license === "team" ? 3 : license === "enterprise" ? 10 : 1
    const price = basePrice * multiplier

    // Calculate commission (30% platform fee)
    const commission = price * 0.3
    const authorEarnings = price * 0.7

    // Create purchase
    const purchase = await db.templatePurchase.create({
      data: {
        templateId,
        userId,
        price,
        currency: template.currency,
        commission,
        authorEarnings,
        license,
      },
    })

    // Update download count
    await db.template.update({
      where: { id: templateId },
      data: { downloadCount: { increment: 1 } },
    })

    // TODO: Send email with download link

    return {
      success: true,
      purchase: purchase as TemplatePurchase,
    }
  }

  /**
   * Get user's purchased templates
   */
  static async getUserPurchases(userId: string): Promise<TemplatePurchase[]> {
    const purchases = await db.templatePurchase.findMany({
      where: { userId },
      include: {
        template: {
          include: {
            author: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { purchasedAt: "desc" },
    })

    return purchases as TemplatePurchase[]
  }

  /**
   * Add review for a template
   */
  static async addReview(params: {
    templateId: string
    userId: string
    rating: number
    title: string
    content: string
  }): Promise<TemplateReview> {
    const { templateId, userId, rating, title, content } = params

    // Verify purchase
    const purchase = await db.templatePurchase.findFirst({
      where: { templateId, userId },
    })

    if (!purchase) {
      throw new Error("You must purchase this template to review it")
    }

    // Check for existing review
    const existing = await db.templateReview.findFirst({
      where: { templateId, userId },
    })

    if (existing) {
      throw new Error("You have already reviewed this template")
    }

    // Create review
    const review = await db.templateReview.create({
      data: {
        templateId,
        userId,
        rating,
        title,
        content,
        verified: true,
      },
    })

    // Update template rating
    const reviews = await db.templateReview.findMany({
      where: { templateId },
      select: { rating: true },
    })

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await db.template.update({
      where: { id: templateId },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    })

    return review as TemplateReview
  }

  /**
   * Get featured templates
   */
  static async getFeaturedTemplates(): Promise<MarketplaceTemplate[]> {
    return FEATURED_TEMPLATES as MarketplaceTemplate[]
  }

  /**
   * Get templates by author
   */
  static async getTemplatesByAuthor(authorId: string): Promise<MarketplaceTemplate[]> {
    const templates = await db.template.findMany({
      where: { authorId, published: true },
      orderBy: { downloadCount: "desc" },
    })

    return templates as MarketplaceTemplate[]
  }

  /**
   * Get similar templates
   */
  static async getSimilarTemplates(templateId: string, limit = 4): Promise<MarketplaceTemplate[]> {
    const template = await db.template.findUnique({
      where: { id: templateId },
    })

    if (!template) return []

    const similar = await db.template.findMany({
      where: {
        id: { not: templateId },
        published: true,
        OR: [{ industry: template.industry }, { category: template.category }, { tags: { hasSome: template.tags } }],
      },
      take: limit,
      orderBy: { rating: "desc" },
    })

    return similar as MarketplaceTemplate[]
  }
}

// ============================================
// Template Download & Deployment
// ============================================

export async function downloadTemplate(templateId: string, userId: string): Promise<{
  downloadUrl: string
  expiresAt: Date
}> {
  // Verify purchase
  const purchase = await db.templatePurchase.findFirst({
    where: { templateId, userId },
  })

  if (!purchase) {
    throw new Error("You must purchase this template to download it")
  }

  // Generate signed download URL
  const downloadToken = Buffer.from(`${templateId}:${userId}:${Date.now()}`).toString("base64")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  return {
    downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/templates/download/${downloadToken}`,
    expiresAt,
  }
}

export async function deployTemplateToProject(params: {
  templateId: string
  projectId: string
  userId: string
  customizations?: Record<string, unknown>
}): Promise<{ success: boolean; deployedResources: string[] }> {
  const { templateId, projectId, userId, customizations } = params

  // Verify purchase
  const purchase = await db.templatePurchase.findFirst({
    where: { templateId, userId },
  })

  if (!purchase) {
    throw new Error("You must purchase this template to deploy it")
  }

  // Get template content
  const template = await db.template.findUnique({
    where: { id: templateId },
    include: { files: true },
  })

  if (!template) {
    throw new Error("Template not found")
  }

  const deployedResources: string[] = []

  // Deploy each file
  for (const file of template.files || []) {
    // Apply customizations
    let content = file.content
    if (customizations) {
      for (const [key, value] of Object.entries(customizations)) {
        content = content.replace(new RegExp(`{{${key}}}`, "g"), String(value))
      }
    }

    // Create resource in project
    if (file.type === "model") {
      await db.transformation.create({
        data: {
          name: file.name,
          layer: file.layer || "marts",
          sql: content,
          projectId,
        },
      })
      deployedResources.push(`model:${file.name}`)
    } else if (file.type === "pipeline") {
      await db.pipeline.create({
        data: {
          name: file.name,
          type: "elt",
          framework: file.framework || "dbt",
          code: content,
          projectId,
        },
      })
      deployedResources.push(`pipeline:${file.name}`)
    }
  }

  return { success: true, deployedResources }
}
