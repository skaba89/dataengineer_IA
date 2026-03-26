// DataSphere Innovation - IP Access Control API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Security } from '@/lib/security';
import { db } from '@/lib/db';

// GET - List IP rules
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

    const organizationId = user?.organizationId;

    const rules = await db.ipRule.findMany({
      where: organizationId ? { organizationId } : {},
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      rules,
      whitelist: rules.filter(r => r.type === 'whitelist' && r.active),
      blacklist: rules.filter(r => r.type === 'blacklist' && r.active)
    });

  } catch (error) {
    console.error('Get IP rules error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des règles IP' },
      { status: 500 }
    );
  }
}

// POST - Add new IP rule
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
    const { ip, cidr, type, reason, expiresAt } = body;

    if (!ip || !type || !reason) {
      return NextResponse.json(
        { success: false, error: 'IP, type et raison requis' },
        { status: 400 }
      );
    }

    if (!['whitelist', 'blacklist'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type doit être "whitelist" ou "blacklist"' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    
    if (!ipRegex.test(ip) && !cidrRegex.test(ip)) {
      return NextResponse.json(
        { success: false, error: 'Format IP invalide' },
        { status: 400 }
      );
    }

    const rule = await Security.IpControl.addRule({
      ip,
      cidr: cidr || ip.includes('/') ? ip : undefined,
      type,
      reason,
      organizationId: user?.organizationId || undefined,
      userId: session.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    return NextResponse.json({
      success: true,
      rule
    });

  } catch (error) {
    console.error('Add IP rule error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'ajout de la règle IP' },
      { status: 500 }
    );
  }
}

// DELETE - Remove IP rule
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
    const ruleId = searchParams.get('id');

    if (!ruleId) {
      return NextResponse.json(
        { success: false, error: 'Rule ID requis' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    // Verify ownership
    const rule = await db.ipRule.findFirst({
      where: {
        id: ruleId,
        organizationId: user?.organizationId
      }
    });

    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'Règle non trouvée' },
        { status: 404 }
      );
    }

    await db.ipRule.delete({
      where: { id: ruleId }
    });

    await Security.Audit.log({
      userId: session.user.id,
      organizationId: user?.organizationId || undefined,
      action: rule.type === 'whitelist' ? 'ip.whitelist_added' : 'ip.blacklist_added',
      resource: 'ip_rule',
      resourceId: ruleId,
      details: { action: 'deleted', ip: rule.ip, type: rule.type },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'success',
      riskLevel: 'low',
      metadata: {}
    });

    return NextResponse.json({
      success: true,
      message: 'Règle supprimée avec succès'
    });

  } catch (error) {
    console.error('Delete IP rule error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la règle' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle IP rule active status
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
    const { ruleId, active } = body;

    if (!ruleId) {
      return NextResponse.json(
        { success: false, error: 'Rule ID requis' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    const rule = await db.ipRule.findFirst({
      where: {
        id: ruleId,
        organizationId: user?.organizationId
      }
    });

    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'Règle non trouvée' },
        { status: 404 }
      );
    }

    await db.ipRule.update({
      where: { id: ruleId },
      data: { active }
    });

    return NextResponse.json({
      success: true,
      message: active ? 'Règle activée' : 'Règle désactivée'
    });

  } catch (error) {
    console.error('Toggle IP rule error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification de la règle' },
      { status: 500 }
    );
  }
}
