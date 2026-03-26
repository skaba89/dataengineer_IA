// AI Data Engineering System - ROI Calculator API

import { NextRequest, NextResponse } from 'next/server';
import { calculateROI, getBenchmark, generateBusinessCase, type ROIInputs } from '@/lib/roi-calculator';
import { auth } from '@/lib/auth';

// POST /api/roi/calculate - Calculate ROI
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Allow unauthenticated access for demo purposes
    const body = await request.json();
    const {
      currentDataTeamSize,
      avgSalary,
      externalConsultants,
      currentToolsCost,
      manualHoursPerWeek,
      hourlyRate,
      projectInvestment,
      annualSupportCost,
      timeSavingsPercent,
      productivityGainPercent,
      errorReductionPercent,
      revenueImpact,
      industry,
    } = body;

    // Use benchmarks if not provided
    const benchmark = industry ? getBenchmark(industry) : null;

    const inputs: ROIInputs = {
      currentDataTeamSize: currentDataTeamSize || 3,
      avgSalary: avgSalary || 65000,
      externalConsultants: externalConsultants || 50000,
      currentToolsCost: currentToolsCost || 30000,
      manualHoursPerWeek: manualHoursPerWeek || 40,
      hourlyRate: hourlyRate || 75,
      projectInvestment: projectInvestment || 85000,
      annualSupportCost: annualSupportCost || 12000,
      timeSavingsPercent: timeSavingsPercent || benchmark?.avgTimeSavings || 40,
      productivityGainPercent: productivityGainPercent || benchmark?.avgProductivityGain || 35,
      errorReductionPercent: errorReductionPercent || benchmark?.avgErrorReduction || 60,
      revenueImpact: revenueImpact || 0,
    };

    const result = calculateROI(inputs);

    return NextResponse.json({
      success: true,
      inputs,
      result,
      benchmark: benchmark ? {
        industry,
        ...benchmark,
      } : null,
    });

  } catch (error) {
    console.error('ROI calculation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate ROI' },
      { status: 500 }
    );
  }
}

// GET /api/roi/benchmarks - Get industry benchmarks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');

    if (industry) {
      const benchmark = getBenchmark(industry);
      return NextResponse.json({
        success: true,
        industry,
        benchmark,
      });
    }

    // Return all benchmarks
    const allBenchmarks = {
      retail: getBenchmark('retail'),
      finance: getBenchmark('finance'),
      healthcare: getBenchmark('healthcare'),
      saas: getBenchmark('saas'),
      manufacturing: getBenchmark('manufacturing'),
      logistics: getBenchmark('logistics'),
    };

    return NextResponse.json({
      success: true,
      benchmarks: allBenchmarks,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch benchmarks' },
      { status: 500 }
    );
  }
}

// PUT /api/roi/business-case - Generate business case document
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputs } = body as { inputs: ROIInputs };

    const result = calculateROI(inputs);
    const businessCase = generateBusinessCase(inputs, result);

    return NextResponse.json({
      success: true,
      businessCase,
      result,
    });

  } catch (error) {
    console.error('Business case generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate business case' },
      { status: 500 }
    );
  }
}
