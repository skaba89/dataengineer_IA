// AI Data Engineering System - Team Members API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/organizations/members - List team members
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No organization found' },
        { status: 404 }
      );
    }

    // Get all members
    const members = await db.user.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      members,
    });

  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/members - Invite new member
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin/Manager only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, role } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No organization found' },
        { status: 404 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'analyst', 'viewer'];
    const memberRole = validRoles.includes(role) ? role : 'viewer';

    // Create invited user (without password - they'll need to set it)
    const newUser = await db.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        role: memberRole,
        organizationId: currentUser.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      member: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      message: 'Team member invited successfully. They will receive an email to set their password.',
    });

  } catch (error) {
    console.error('Invite member error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/members - Remove member
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Can't remove yourself
    if (memberId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove yourself' },
        { status: 400 }
      );
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    const targetMember = await db.user.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.organizationId !== currentUser?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Member not found in your organization' },
        { status: 404 }
      );
    }

    // Delete member
    await db.user.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully',
    });

  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

// PATCH /api/organizations/members - Update member role
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
    const { memberId, role } = body;

    if (!memberId || !role) {
      return NextResponse.json(
        { success: false, error: 'Member ID and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'analyst', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    const targetMember = await db.user.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.organizationId !== currentUser?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Member not found in your organization' },
        { status: 404 }
      );
    }

    // Update member role
    const updatedMember = await db.user.update({
      where: { id: memberId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      member: updatedMember,
      message: 'Member role updated successfully',
    });

  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update member' },
      { status: 500 }
    );
  }
}
