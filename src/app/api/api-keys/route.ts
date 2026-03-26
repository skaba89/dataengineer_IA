// AI Data Engineering System - API: API Key Management
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import crypto from 'crypto';

// GET - List API keys for organization
export async function GET() {
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
        apiKeys: []
      });
    }

    const apiKeys = await db.apiKey.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        name: true,
        key: true,
        lastUsed: true,
        expiresAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mask API keys for security
    const maskedKeys = apiKeys.map(key => ({
      ...key,
      key: key.key.slice(0, 8) + '...' + key.key.slice(-4)
    }));

    return NextResponse.json({
      success: true,
      apiKeys: maskedKeys
    });

  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

// POST - Create new API key
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
    const { name, permissions, expiresInDays } = body;

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    // Generate API key
    const key = `ade_${crypto.randomBytes(32).toString('hex')}`;

    // Calculate expiration
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = await db.apiKey.create({
      data: {
        name: name || 'API Key',
        key,
        organizationId: user.organizationId,
        expiresAt
      }
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key, // Return full key only on creation
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt
      },
      warning: 'Cette clé ne sera affichée qu\'une seule fois. Veuillez la copier en lieu sûr.'
    });

  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke API key
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
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'ID de clé requis' },
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

    // Verify the key belongs to user's organization
    const apiKey = await db.apiKey.findFirst({
      where: {
        id: keyId,
        organizationId: user.organizationId
      }
    });

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Clé API non trouvée' },
        { status: 404 }
      );
    }

    await db.apiKey.delete({
      where: { id: keyId }
    });

    return NextResponse.json({
      success: true,
      message: 'Clé API révoquée avec succès'
    });

  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
