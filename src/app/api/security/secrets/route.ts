// DataSphere Innovation - Secrets Management API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Security } from '@/lib/security';
import { db } from '@/lib/db';

// GET - List secrets (without values)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.organizationId) {
      return NextResponse.json({
        success: true,
        secrets: []
      });
    }

    const secrets = await db.secret.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        name: true,
        type: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        lastRotatedAt: true,
        rotationDays: true,
        // Exclude encrypted value, iv, authTag
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check for expiring secrets
    const expiringSecrets = await Security.Secrets.checkExpiring(30);

    return NextResponse.json({
      success: true,
      secrets: secrets.map(s => ({
        ...s,
        isExpiring: expiringSecrets.some(es => es.id === s.id),
        daysUntilExpiry: s.expiresAt 
          ? Math.ceil((new Date(s.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null
      }))
    });

  } catch (error) {
    console.error('Get secrets error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des secrets' },
      { status: 500 }
    );
  }
}

// POST - Create a new secret
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, type, value, expiresAt, rotationDays } = body;

    if (!name || !type || !value) {
      return NextResponse.json(
        { success: false, error: 'Nom, type et valeur requis' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    // Check if secret with same name exists
    const existing = await db.secret.findFirst({
      where: {
        name,
        organizationId: user.organizationId
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Un secret avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    const secret = await Security.Secrets.store({
      name,
      type,
      value,
      organizationId: user.organizationId,
      userId: session.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      rotationDays
    });

    return NextResponse.json({
      success: true,
      secret: {
        id: secret.id,
        name: secret.name,
        type: secret.type,
        createdAt: secret.createdAt
      }
    });

  } catch (error) {
    console.error('Create secret error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du secret' },
      { status: 500 }
    );
  }
}

// PATCH - Rotate a secret
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { secretId, newValue } = body;

    if (!secretId || !newValue) {
      return NextResponse.json(
        { success: false, error: 'Secret ID et nouvelle valeur requis' },
        { status: 400 }
      );
    }

    await Security.Secrets.rotate(secretId, newValue, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Secret rotationné avec succès'
    });

  } catch (error) {
    console.error('Rotate secret error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la rotation du secret' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a secret
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const secretId = searchParams.get('id');

    if (!secretId) {
      return NextResponse.json(
        { success: false, error: 'Secret ID requis' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    // Verify ownership
    const secret = await db.secret.findFirst({
      where: {
        id: secretId,
        organizationId: user?.organizationId
      }
    });

    if (!secret) {
      return NextResponse.json(
        { success: false, error: 'Secret non trouvé' },
        { status: 404 }
      );
    }

    // Log before deletion
    await Security.Audit.log({
      userId: session.user.id,
      organizationId: user?.organizationId || undefined,
      action: 'api_key.revoked',
      resource: 'secret',
      resourceId: secretId,
      details: { name: secret.name, type: secret.type },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'success',
      riskLevel: 'medium',
      metadata: {}
    });

    await db.secret.delete({
      where: { id: secretId }
    });

    return NextResponse.json({
      success: true,
      message: 'Secret supprimé avec succès'
    });

  } catch (error) {
    console.error('Delete secret error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du secret' },
      { status: 500 }
    );
  }
}
