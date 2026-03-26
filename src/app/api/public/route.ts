// AI Data Engineering System - Public API Entry Point
// This is the main public API that external applications can use
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BillingService } from '@/lib/billing';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMITS: Record<string, number> = {
  starter: 100,
  professional: 1000,
  enterprise: 10000,
  agency: 5000
};

// Verify API key and get organization
async function verifyApiKey(authHeader: string | null): Promise<{
  valid: boolean;
  organization?: { id: string; plan: string };
  error?: string
}> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header' };
  }

  const key = authHeader.replace('Bearer ', '');

  const apiKey = await db.apiKey.findUnique({
    where: { key },
    include: { organization: true }
  });

  if (!apiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  // Check expiration
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
    return { valid: false, error: 'API key expired' };
  }

  // Update last used
  await db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() }
  });

  return { valid: true, organization: apiKey.organization };
}

// Check rate limit
async function checkRateLimit(organizationId: string, plan: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date
}> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);
  const limit = RATE_LIMITS[plan] || 100;

  // Count requests in current window
  const count = await db.apiUsage.count({
    where: {
      organizationId,
      timestamp: { gte: windowStart }
    }
  });

  const remaining = Math.max(0, limit - count);
  const resetAt = new Date(windowStart.getTime() + RATE_LIMIT_WINDOW);

  return {
    allowed: count < limit,
    remaining,
    resetAt
  };
}

// Log API usage
async function logApiUsage(
  apiKeyId: string,
  organizationId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number
) {
  await db.apiUsage.create({
    data: {
      apiKeyId,
      organizationId,
      endpoint,
      method,
      statusCode,
      duration,
      timestamp: new Date()
    }
  });
}

// Main API handler
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const authHeader = request.headers.get('authorization');
  const { pathname } = new URL(request.url);

  // Verify API key
  const { valid, organization, error } = await verifyApiKey(authHeader);

  if (!valid) {
    return NextResponse.json(
      { success: false, error },
      { status: 401 }
    );
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(organization!.id, organization!.plan);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: rateLimit.resetAt
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS[organization!.plan].toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetAt.toISOString()
        }
      }
    );
  }

  // Route to specific endpoints
  try {
    const path = pathname.replace('/api/public/', '');
    let response;

    switch (path) {
      case 'projects':
        response = await getProjects(organization!.id);
        break;
      case 'data-sources':
        response = await getDataSources(organization!.id);
        break;
      case 'pipelines':
        response = await getPipelines(organization!.id);
        break;
      case 'executions':
        response = await getExecutions(organization!.id);
        break;
      case 'usage':
        response = await getUsage(organization!.id);
        break;
      default:
        response = NextResponse.json(
          { success: false, error: 'Endpoint not found' },
          { status: 404 }
        );
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMITS[organization!.plan].toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toISOString());

    return response;

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

// POST handler for creating resources
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const authHeader = request.headers.get('authorization');

  // Verify API key
  const { valid, organization, error } = await verifyApiKey(authHeader);

  if (!valid) {
    return NextResponse.json(
      { success: false, error },
      { status: 401 }
    );
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(organization!.id, organization!.plan);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/public/', '');

    let response;

    switch (path) {
      case 'projects':
        response = await createProject(organization!.id, body);
        break;
      case 'trigger':
        response = await triggerExecution(organization!.id, body);
        break;
      default:
        response = NextResponse.json(
          { success: false, error: 'Endpoint not found' },
          { status: 404 }
        );
    }

    return response;

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

// API endpoint handlers
async function getProjects(organizationId: string) {
  const projects = await db.project.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return NextResponse.json({ success: true, projects });
}

async function getDataSources(organizationId: string) {
  const dataSources = await db.dataSource.findMany({
    where: { project: { organizationId } },
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      lastSync: true
    }
  });

  return NextResponse.json({ success: true, dataSources });
}

async function getPipelines(organizationId: string) {
  const pipelines = await db.pipeline.findMany({
    where: { project: { organizationId } },
    select: {
      id: true,
      name: true,
      type: true,
      framework: true,
      status: true,
      schedule: true
    }
  });

  return NextResponse.json({ success: true, pipelines });
}

async function getExecutions(organizationId: string) {
  const executions = await db.agentExecution.findMany({
    where: { project: { organizationId } },
    select: {
      id: true,
      agentType: true,
      status: true,
      duration: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return NextResponse.json({ success: true, executions });
}

async function getUsage(organizationId: string) {
  const usage = await BillingService.getUsageMetrics(organizationId);
  return NextResponse.json({ success: true, usage });
}

async function createProject(organizationId: string, data: any) {
  // Check project limit
  const limitCheck = await BillingService.checkLimit(organizationId, 'projects');

  if (!limitCheck.allowed) {
    return NextResponse.json(
      { success: false, error: 'Project limit reached' },
      { status: 403 }
    );
  }

  const project = await db.project.create({
    data: {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      organizationId,
      ownerId: data.ownerId || ''
    }
  });

  return NextResponse.json({ success: true, project });
}

async function triggerExecution(organizationId: string, data: any) {
  // Check execution limit
  const limitCheck = await BillingService.checkLimit(organizationId, 'executions');

  if (!limitCheck.allowed) {
    return NextResponse.json(
      { success: false, error: 'Execution limit reached' },
      { status: 403 }
    );
  }

  const execution = await db.agentExecution.create({
    data: {
      agentType: data.agentType || 'discovery',
      projectId: data.projectId,
      input: JSON.stringify(data.input || {}),
      status: 'running'
    }
  });

  return NextResponse.json({ success: true, execution });
}
