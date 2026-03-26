// AI Data Engineering System - Organization Management API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/organizations - List user's organizations
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with organization
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: true,
      },
    });

    return NextResponse.json({
      success: true,
      organization: user?.organization || null,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
    });

  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create organization
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, industry, website, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists
    const existing = await db.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Organization name already taken' },
        { status: 400 }
      );
    }

    // Create organization
    const organization = await db.organization.create({
      data: {
        name,
        slug,
        industry: industry || null,
        website: website || null,
        description: description || null,
        plan: 'starter',
        seats: 5,
      },
    });

    // Update user to be admin of this organization
    await db.user.update({
      where: { id: session.user.id },
      data: {
        organizationId: organization.id,
        role: 'admin',
      },
    });

    return NextResponse.json({
      success: true,
      organization,
      message: 'Organization created successfully',
    });

  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

// PATCH /api/organizations - Update organization
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, industry, website, description, settings } = body;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No organization found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (industry) updateData.industry = industry;
    if (website) updateData.website = website;
    if (description) updateData.description = description;
    if (settings) updateData.settings = JSON.stringify(settings);

    const organization = await db.organization.update({
      where: { id: user.organizationId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      organization,
    });

  } catch (error) {
    console.error('Update organization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}
