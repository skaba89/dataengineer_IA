// AI Data Engineering System - API: Sales Prospection

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// Industry profiles for targeting
const INDUSTRY_PROFILES = {
  retail: {
    name: 'Retail & E-commerce',
    painPoints: [
      'Customer 360 view missing',
      'Inventory optimization challenges',
      'Multi-channel data silos',
      'Real-time sales analytics needed',
    ],
    dataSources: ['POS systems', 'E-commerce platforms', 'CRM', 'Inventory management', 'Marketing automation'],
    kpis: ['Customer LTV', 'Churn rate', 'Inventory turnover', 'Conversion rate', 'AOV'],
    triggerEvents: ['ERP migration', 'New e-commerce platform', 'Expansion to new markets'],
  },
  healthcare: {
    name: 'Healthcare & Life Sciences',
    painPoints: [
      'Patient data integration',
      'Regulatory compliance (HIPAA)',
      'Clinical trial data management',
      'Population health analytics',
    ],
    dataSources: ['EHR systems', 'Lab systems', 'Claims data', 'Clinical trial databases', 'Patient portals'],
    kpis: ['Patient outcomes', 'Readmission rates', 'Cost per episode', 'Clinical trial success rate'],
    triggerEvents: ['EHR implementation', 'M&A activity', 'New clinical trial launch'],
  },
  finance: {
    name: 'Financial Services',
    painPoints: [
      'Risk data aggregation',
      'Regulatory reporting (Basel, MiFID)',
      'Fraud detection gaps',
      'Customer analytics maturity',
    ],
    dataSources: ['Core banking', 'Trading systems', 'Risk systems', 'CRM', 'External market data'],
    kpis: ['Risk-adjusted ROI', 'Fraud detection rate', 'Customer acquisition cost', 'Regulatory compliance score'],
    triggerEvents: ['Regulatory change', 'New product launch', 'Digital transformation initiative'],
  },
  manufacturing: {
    name: 'Manufacturing & Industry',
    painPoints: [
      'Supply chain visibility',
      'Predictive maintenance needs',
      'Quality data integration',
      'Production optimization',
    ],
    dataSources: ['ERP', 'MES', 'SCM systems', 'IoT sensors', 'Quality systems'],
    kpis: ['OEE', 'Defect rate', 'Supply chain cycle time', 'Predictive maintenance accuracy'],
    triggerEvents: ['Industry 4.0 initiative', 'New production line', 'ERP upgrade'],
  },
  saas: {
    name: 'SaaS & Technology',
    painPoints: [
      'Product analytics gaps',
      'Customer health scoring',
      'Revenue operations alignment',
      'Usage-based pricing implementation',
    ],
    dataSources: ['Product analytics', 'CRM', 'Billing systems', 'Support tickets', 'Marketing automation'],
    kpis: ['NRR', 'CAC', 'Time to value', 'Feature adoption rate', 'Net promoter score'],
    triggerEvents: ['Series B+ funding', 'PLG transformation', 'Usage-based pricing shift'],
  },
  logistics: {
    name: 'Logistics & Supply Chain',
    painPoints: [
      'Real-time tracking gaps',
      'Route optimization',
      'Carrier performance visibility',
      'Demand forecasting',
    ],
    dataSources: ['TMS', 'WMS', 'Carrier APIs', 'GPS/Telematics', 'Order management'],
    kpis: ['On-time delivery', 'Cost per mile', 'Warehouse utilization', 'Order accuracy'],
    triggerEvents: ['Network expansion', 'New carrier onboarding', 'Last-mile initiative'],
  },
};

// POST /api/prospects - Generate prospect outreach
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, companyName, contactName, specificNeeds } = body;

    // Initialize AI
    const zai = await ZAI.create();

    const profile = INDUSTRY_PROFILES[industry as keyof typeof INDUSTRY_PROFILES] || INDUSTRY_PROFILES.retail;

    const outreachPrompt = `You are the Sales Agent. Create a personalized outreach campaign for a data engineering services prospect.

## Target Profile
- Industry: ${profile.name}
- Company: ${companyName || 'Target Company'}
- Contact: ${contactName || 'Decision Maker'}
- Specific Needs: ${specificNeeds || 'General data engineering needs'}

## Industry Insights
- Pain Points: ${profile.painPoints.join(', ')}
- Common Data Sources: ${profile.dataSources.join(', ')}
- Key KPIs: ${profile.kpis.join(', ')}

Generate:
1. PERSONALIZED EMAIL (Subject + Body)
   - Focus on 1-2 specific pain points
   - Include relevant industry metrics
   - Clear call-to-action

2. LINKEDIN CONNECTION REQUEST
   - Short, personalized message
   - Reference mutual interests/insights

3. FOLLOW-UP SEQUENCE (3 emails)
   - Day 3: Value-add content
   - Day 7: Case study share
   - Day 14: Final check-in

4. OBJECTION HANDLERS
   - Budget concerns
   - Timeline concerns
   - Internal capability concerns`;

    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert B2B sales consultant specializing in data engineering services.' },
        { role: 'user', content: outreachPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const outreach = response.choices[0]?.message?.content || '';

    // Store prospect in database
    if (companyName) {
      try {
        const org = await db.organization.create({
          data: {
            name: companyName,
            industry,
          },
        });

        return NextResponse.json({
          success: true,
          outreach,
          organizationId: org.id,
          profile,
        });
      } catch {
        // Continue without storing
      }
    }

    return NextResponse.json({
      success: true,
      outreach,
      profile,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/prospects - Get industry profiles
export async function GET() {
  return NextResponse.json({
    success: true,
    industries: Object.entries(INDUSTRY_PROFILES).map(([key, value]) => ({
      id: key,
      name: value.name,
      painPoints: value.painPoints,
      dataSources: value.dataSources,
      kpis: value.kpis,
      triggerEvents: value.triggerEvents,
    })),
  });
}
