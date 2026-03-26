// Multi-Tenant Middleware - Ensures data isolation by organization
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

/**
 * Get the current user's organization ID
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.organizationId ?? null
}

/**
 * Check if user has access to a specific organization
 */
export async function hasOrganizationAccess(targetOrgId: string): Promise<boolean> {
  const session = await auth()
  if (!session?.user) return false
  
  // Admins can access all organizations
  if (session.user.role === "admin") return true
  
  // Users can only access their own organization
  return session.user.organizationId === targetOrgId
}

/**
 * Middleware to add organization filter to queries
 */
export function withOrgFilter<T extends Record<string, unknown>>(
  query: T,
  orgId: string | null
): T & { organizationId?: string } {
  if (!orgId) return query
  return { ...query, organizationId: orgId }
}

/**
 * Organization context for API routes
 */
export interface OrgContext {
  organizationId: string | null
  userId: string
  userRole: string
  isAdmin: boolean
}

/**
 * Get organization context for the current request
 */
export async function getOrgContext(): Promise<OrgContext | null> {
  const session = await auth()
  if (!session?.user) return null
  
  return {
    organizationId: session.user.organizationId ?? null,
    userId: session.user.id,
    userRole: session.user.role,
    isAdmin: session.user.role === "admin",
  }
}

/**
 * API route wrapper that adds organization filtering
 */
export function withOrgIsolation<T>(
  handler: (req: NextRequest, context: OrgContext) => Promise<T>
): (req: NextRequest) => Promise<T | NextResponse> {
  return async (req: NextRequest) => {
    const context = await getOrgContext()
    
    if (!context) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      )
    }
    
    try {
      return await handler(req, context)
    } catch (error) {
      console.error("API Error:", error)
      return NextResponse.json(
        { success: false, error: "Erreur serveur" },
        { status: 500 }
      )
    }
  }
}

/**
 * Filter projects by organization
 */
export async function getProjectsForOrg(context: OrgContext) {
  const where = context.isAdmin 
    ? {} // Admins see all projects
    : { organizationId: context.organizationId }
  
  return db.project.findMany({
    where,
    include: {
      organization: {
        select: { id: true, name: true, slug: true }
      },
      owner: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: {
          dataSources: true,
          pipelines: true,
          dashboards: true,
          executions: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Filter executions by organization
 */
export async function getExecutionsForOrg(context: OrgContext, limit = 50) {
  const where = context.isAdmin
    ? {}
    : { project: { organizationId: context.organizationId } }
  
  return db.agentExecution.findMany({
    where,
    include: {
      project: {
        select: { id: true, name: true }
      },
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

/**
 * Get organization stats
 */
export async function getOrgStats(context: OrgContext) {
  const projectWhere = context.isAdmin
    ? {}
    : { organizationId: context.organizationId }
  
  const executionWhere = context.isAdmin
    ? {}
    : { project: { organizationId: context.organizationId } }
  
  const [projects, executions, deliverables] = await Promise.all([
    db.project.count({ where: projectWhere }),
    db.agentExecution.count({ where: executionWhere }),
    db.deliverable.count({
      where: context.isAdmin
        ? {}
        : { project: { organizationId: context.organizationId } }
    }),
  ])
  
  return {
    projects,
    executions,
    deliverables,
  }
}

/**
 * Validate user owns the resource
 */
export async function validateResourceOwnership(
  resourceType: "project" | "pipeline" | "dashboard",
  resourceId: string,
  context: OrgContext
): Promise<boolean> {
  if (context.isAdmin) return true
  
  const resource = await (resourceType === "project" 
    ? db.project.findUnique({ where: { id: resourceId }, select: { organizationId: true } })
    : resourceType === "pipeline"
    ? db.pipeline.findUnique({ where: { id: resourceId }, include: { project: { select: { organizationId: true } } } })
    : db.dashboard.findUnique({ where: { id: resourceId }, include: { project: { select: { organizationId: true } } } })
  )
  
  if (!resource) return false
  
  const orgId = resourceType === "project"
    ? (resource as { organizationId: string | null }).organizationId
    : ((resource as { project: { organizationId: string | null } }).project)?.organizationId
  
  return orgId === context.organizationId
}
