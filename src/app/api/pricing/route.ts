// AI Data Engineering System - API: Pricing & Proposal Generation

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Package definitions
const PACKAGES = {
  starter: {
    name: 'Starter',
    priceMin: 25000,
    priceMax: 40000,
    duration: '4-6 weeks',
    features: [
      'Up to 5 data sources',
      'Up to 10 pipelines',
      'Single data warehouse',
      '3 dashboards',
      'Basic documentation',
      '2 months support',
    ],
    included: [
      'Data discovery & profiling',
      'Architecture design',
      'ETL pipeline development',
      'Data quality framework',
      'Dashboard development',
    ],
    notIncluded: [
      'Real-time streaming',
      'ML pipeline integration',
      'Advanced security features',
      'Data governance suite',
    ],
  },
  professional: {
    name: 'Professional',
    priceMin: 75000,
    priceMax: 150000,
    duration: '8-14 weeks',
    features: [
      'Up to 20 data sources',
      'Up to 50 pipelines',
      'Multi-warehouse support',
      '10 dashboards',
      'Comprehensive documentation',
      '6 months support',
    ],
    included: [
      'Everything in Starter',
      'Real-time streaming',
      'Advanced transformations',
      'Data catalog implementation',
      'CI/CD pipeline setup',
      'Monitoring & alerting',
    ],
    notIncluded: [
      'ML pipeline integration',
      'Custom ML models',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    priceMin: 200000,
    priceMax: 500000,
    duration: '4-8 months',
    features: [
      'Unlimited data sources',
      'Unlimited pipelines',
      'Full multi-cloud support',
      'Unlimited dashboards',
      'Enterprise documentation',
      '12 months support',
    ],
    included: [
      'Everything in Professional',
      'ML pipeline integration',
      'Custom ML models',
      'Data governance suite',
      'Security hardening',
      'Dedicated support team',
      'Training & knowledge transfer',
    ],
    notIncluded: [],
  },
};

// POST /api/pricing - Generate pricing proposal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectData, requirements } = body;

    // Initialize AI
    const zai = await ZAI.create();

    // Determine recommended package
    const recommendedPackage = determinePackage(requirements);

    // Generate detailed proposal
    const proposalPrompt = `You are the Pricing Agent. Generate a comprehensive pricing proposal.

## Client Requirements
- Industry: ${projectData?.industry || 'General'}
- Project Name: ${projectData?.name || 'New Project'}
- Data Sources: ${requirements?.dataSources || 'Not specified'}
- Pipelines Needed: ${requirements?.pipelines || 'Not specified'}
- Timeline: ${requirements?.timeline || 'Flexible'}
- Budget Range: ${requirements?.budget || 'Not specified'}

## Recommended Package: ${recommendedPackage.name}
- Price Range: €${recommendedPackage.priceMin.toLocaleString()} - €${recommendedPackage.priceMax.toLocaleString()}
- Duration: ${recommendedPackage.duration}

Generate a professional proposal including:
1. EXECUTIVE SUMMARY
2. SCOPE OF WORK
3. DELIVERABLES
4. TIMELINE & MILESTONES
5. INVESTMENT BREAKDOWN
6. ROI PROJECTIONS
7. TERMS & CONDITIONS
8. NEXT STEPS`;

    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional sales consultant specializing in data engineering projects.' },
        { role: 'user', content: proposalPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const proposal = response.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      pricing: {
        recommendedPackage: recommendedPackage.name.toLowerCase(),
        priceMin: recommendedPackage.priceMin,
        priceMax: recommendedPackage.priceMax,
        duration: recommendedPackage.duration,
        features: recommendedPackage.features,
        included: recommendedPackage.included,
        notIncluded: recommendedPackage.notIncluded,
      },
      proposal,
      packages: PACKAGES,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/pricing - Get package options
export async function GET() {
  return NextResponse.json({
    success: true,
    packages: PACKAGES,
  });
}

// Determine appropriate package based on requirements
function determinePackage(requirements: {
  dataSources?: number | string;
  pipelines?: number | string;
  budget?: string;
}): { name: string; priceMin: number; priceMax: number; duration: string; features: string[]; included: string[]; notIncluded: string[] } {
  const dataSources = Number(requirements.dataSources) || 0;
  const pipelines = Number(requirements.pipelines) || 0;
  const budget = requirements.budget?.toLowerCase() || '';

  // Check budget hints
  if (budget.includes('enterprise') || budget.includes('200k') || budget.includes('500k')) {
    return PACKAGES.enterprise;
  }
  if (budget.includes('professional') || budget.includes('75k') || budget.includes('150k')) {
    return PACKAGES.professional;
  }
  if (budget.includes('starter') || budget.includes('25k') || budget.includes('40k')) {
    return PACKAGES.starter;
  }

  // Check complexity
  if (dataSources > 15 || pipelines > 40) {
    return PACKAGES.enterprise;
  }
  if (dataSources > 5 || pipelines > 10) {
    return PACKAGES.professional;
  }

  return PACKAGES.starter;
}
