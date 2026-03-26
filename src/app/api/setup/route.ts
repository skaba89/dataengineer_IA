// API: Initialize Database with Demo Data
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST /api/setup - Initialize database with demo data
export async function POST(request: NextRequest) {
  try {
    // Check if already initialized
    const existingUser = await db.user.findFirst();
    
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Database already initialized',
        user: { email: existingUser.email }
      });
    }

    // Create demo organization
    const organization = await db.organization.create({
      data: {
        name: 'Demo Company',
        slug: 'demo-company-' + Math.random().toString(36).substring(7),
        industry: 'technology',
        plan: 'professional',
        seats: 10,
      }
    });

    // Create demo users
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    const user = await db.user.create({
      data: {
        email: 'demo@ai-data-engineering.com',
        name: 'Demo User',
        password: hashedPassword,
        role: 'admin',
        organizationId: organization.id,
      }
    });

    // Create a demo project
    const project = await db.project.create({
      data: {
        name: 'Demo E-commerce Pipeline',
        slug: 'demo-ecommerce-' + Math.random().toString(36).substring(7),
        description: 'Pipeline de données e-commerce de démonstration',
        status: 'draft',
        package: 'professional',
        organizationId: organization.id,
        ownerId: user.id,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      data: {
        organization: { name: organization.name },
        user: { email: user.email, password: 'demo123' },
        project: { name: project.name }
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/setup - Check setup status
export async function GET(request: NextRequest) {
  try {
    const userCount = await db.user.count();
    const orgCount = await db.organization.count();
    const projectCount = await db.project.count();

    return NextResponse.json({
      success: true,
      initialized: userCount > 0,
      stats: {
        users: userCount,
        organizations: orgCount,
        projects: projectCount
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}
