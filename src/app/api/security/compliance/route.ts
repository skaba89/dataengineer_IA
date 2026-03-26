// DataSphere Innovation - Compliance Reports API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Security } from '@/lib/security';
import { db } from '@/lib/db';

type ComplianceFramework = 'SOC2' | 'RGPD' | 'HIPAA' | 'PCI_DSS' | 'ISO27001';

// GET - Get compliance status for all frameworks
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

    const organizationId = user?.organizationId || session.user.organizationId;

    // Get existing reports
    const existingReports = await db.complianceReport.findMany({
      where: { organizationId },
      orderBy: { generatedAt: 'desc' },
      take: 10
    });

    // Calculate current status for each framework
    const frameworks: ComplianceFramework[] = ['SOC2', 'RGPD', 'HIPAA', 'PCI_DSS', 'ISO27001'];
    const status: Record<string, { score: number; status: string; lastReport?: Date }> = {};

    for (const framework of frameworks) {
      const latestReport = existingReports.find(r => r.framework === framework);
      
      if (latestReport) {
        status[framework] = {
          score: latestReport.score as number,
          status: latestReport.status as string,
          lastReport: latestReport.generatedAt
        };
      } else {
        // Generate estimated scores based on security posture
        status[framework] = {
          score: await estimateComplianceScore(framework, organizationId),
          status: 'estimated',
          lastReport: undefined
        };
      }
    }

    return NextResponse.json({
      success: true,
      compliance: status,
      reports: existingReports.map(r => ({
        id: r.id,
        framework: r.framework,
        score: r.score,
        status: r.status,
        generatedAt: r.generatedAt
      }))
    });

  } catch (error) {
    console.error('Get compliance status error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du statut de conformité' },
      { status: 500 }
    );
  }
}

// POST - Generate a new compliance report
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
    const { framework, periodStart, periodEnd } = body;

    if (!framework) {
      return NextResponse.json(
        { success: false, error: 'Framework requis' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    const organizationId = user?.organizationId || session.user.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    const report = await Security.Compliance.generateReport({
      framework: framework as ComplianceFramework,
      organizationId,
      periodStart: periodStart ? new Date(periodStart) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      periodEnd: periodEnd ? new Date(periodEnd) : new Date(),
      userId: session.user.id
    });

    // Store report
    await db.complianceReport.create({
      data: {
        id: report.id,
        framework: report.framework,
        organizationId,
        score: report.score,
        status: report.status,
        findings: JSON.stringify(report.findings),
        recommendations: JSON.stringify(report.recommendations),
        generatedAt: report.generatedAt,
        periodStart: report.period.start,
        periodEnd: report.period.end,
        nextAuditDate: report.nextAuditDate
      }
    });

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        period: undefined,
        periodStart: report.period.start,
        periodEnd: report.period.end
      }
    });

  } catch (error) {
    console.error('Generate compliance report error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    );
  }
}

// Helper function to estimate compliance score
async function estimateComplianceScore(framework: string, organizationId?: string): Promise<number> {
  // In production, this would analyze actual security controls
  // For now, return reasonable estimates based on framework complexity
  
  const baseScores: Record<string, number> = {
    SOC2: 85,
    RGPD: 88,
    HIPAA: 82,
    PCI_DSS: 78,
    ISO27001: 85
  };

  let score = baseScores[framework] || 80;

  // Adjust based on security posture
  if (organizationId) {
    try {
      // Check for MFA adoption
      const users = await db.user.count({ where: { organizationId } });
      const mfaUsers = await db.user.count({ where: { organizationId, mfaEnabled: true } });
      
      if (users > 0 && mfaUsers === users) {
        score += 5; // Bonus for full MFA adoption
      }

      // Check for recent security events
      const recentEvents = await db.securityEvent.count({
        where: {
          resolved: false,
          timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      });

      score -= Math.min(10, recentEvents * 2); // Penalty for unresolved events

    } catch {
      // Ignore errors in estimation
    }
  }

  return Math.max(0, Math.min(100, score));
}
