// AI Data Engineering System - API: Projects

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate a unique slug from name
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

// Get or create default user
async function getOrCreateDefaultUser() {
  let user = await db.user.findFirst();

  if (!user) {
    user = await db.user.create({
      data: {
        email: 'demo@datasphere.io',
        name: 'Demo User',
        role: 'admin',
      },
    });
  }

  return user;
}

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const projects = await db.project.findMany({
      where: {
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        organization: true,
      },
    });

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, organizationId, organizationName, industry } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Get or create default user
    const defaultUser = await getOrCreateDefaultUser();

    // Create or get organization if industry is provided
    let orgId = organizationId;
    if (!orgId && industry) {
      const org = await db.organization.create({
        data: {
          name: organizationName || `${name} Organization`,
          slug: generateSlug(organizationName || name),
          industry: industry,
        },
      });
      orgId = org.id;
    }

    // Create project with auto-generated slug
    const project = await db.project.create({
      data: {
        name,
        slug: generateSlug(name),
        description: description || '',
        status: 'draft',
        package: 'starter',
        organizationId: orgId || null,
        ownerId: defaultUser.id,
      },
      include: {
        organization: true,
      },
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
