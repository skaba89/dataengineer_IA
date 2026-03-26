// AI Data Engineering System - ROI Calculator

export interface ROIInputs {
  // Current costs
  currentDataTeamSize: number; // Number of people
  avgSalary: number; // Average annual salary in €
  externalConsultants: number; // Annual external consultant costs in €
  currentToolsCost: number; // Annual tools cost in €
  manualHoursPerWeek: number; // Hours spent on manual data tasks per week
  hourlyRate: number; // Hourly rate for manual work in €
  
  // Project investment
  projectInvestment: number; // One-time project cost in €
  annualSupportCost: number; // Annual support/maintenance in €
  
  // Expected improvements (as percentages)
  timeSavingsPercent: number; // Expected time savings (0-100)
  productivityGainPercent: number; // Expected productivity gain (0-100)
  errorReductionPercent: number; // Expected error reduction (0-100)
  
  // Business metrics
  revenueImpact?: number; // Expected revenue impact in €
  complianceRiskReduction?: number; // Risk reduction value in €
}

export interface ROIResult {
  // Current state
  currentAnnualCost: number;
  currentLaborCost: number;
  currentToolCost: number;
  
  // Project costs
  totalYear1Investment: number;
  ongoingAnnualCost: number;
  
  // Savings
  laborSavings: number;
  efficiencySavings: number;
  errorReductionSavings: number;
  totalAnnualSavings: number;
  
  // ROI metrics
  netBenefitYear1: number;
  netBenefitOngoing: number;
  roiPercentYear1: number;
  roiPercentOngoing: number;
  paybackMonths: number;
  
  // 5-year projection
  fiveYearProjection: {
    year: number;
    investment: number;
    savings: number;
    cumulative: number;
  }[];
  
  // Summary
  summary: string;
  recommendation: string;
}

// Calculate ROI
export function calculateROI(inputs: ROIInputs): ROIResult {
  // Current costs
  const currentLaborCost = inputs.currentDataTeamSize * inputs.avgSalary;
  const manualWorkCost = inputs.manualHoursPerWeek * 52 * inputs.hourlyRate;
  const currentAnnualCost = currentLaborCost + inputs.externalConsultants + inputs.currentToolsCost + manualWorkCost;
  
  // Project costs
  const totalYear1Investment = inputs.projectInvestment + inputs.annualSupportCost;
  const ongoingAnnualCost = inputs.annualSupportCost;
  
  // Calculate savings
  const laborSavings = currentLaborCost * (inputs.productivityGainPercent / 100) * 0.3; // Assume 30% of productivity gain translates to cost savings
  const efficiencySavings = manualWorkCost * (inputs.timeSavingsPercent / 100);
  
  // Error reduction savings (assume average error cost is 5% of revenue impact)
  const errorReductionSavings = (inputs.revenueImpact || 0) * 0.05 * (inputs.errorReductionPercent / 100);
  
  const totalAnnualSavings = laborSavings + efficiencySavings + errorReductionSavings;
  
  // ROI calculations
  const netBenefitYear1 = totalAnnualSavings - totalYear1Investment;
  const netBenefitOngoing = totalAnnualSavings - ongoingAnnualCost;
  
  const roiPercentYear1 = (netBenefitYear1 / totalYear1Investment) * 100;
  const roiPercentOngoing = (netBenefitOngoing / ongoingAnnualCost) * 100;
  
  // Payback period in months
  const paybackMonths = totalYear1Investment / (totalAnnualSavings / 12);
  
  // 5-year projection
  const fiveYearProjection = [];
  let cumulative = -totalYear1Investment;
  
  for (let year = 1; year <= 5; year++) {
    const investment = year === 1 ? totalYear1Investment : ongoingAnnualCost;
    const savings = totalAnnualSavings;
    cumulative += savings - investment;
    
    fiveYearProjection.push({
      year,
      investment,
      savings,
      cumulative,
    });
  }
  
  // Generate summary
  const summary = generateSummary(inputs, {
    currentAnnualCost,
    totalAnnualSavings,
    paybackMonths,
    roiPercentYear1,
    fiveYearProjection,
  });
  
  // Generate recommendation
  const recommendation = generateRecommendation(paybackMonths, roiPercentYear1, fiveYearProjection[4].cumulative);
  
  return {
    currentAnnualCost,
    currentLaborCost,
    currentToolCost: inputs.currentToolsCost,
    totalYear1Investment,
    ongoingAnnualCost,
    laborSavings,
    efficiencySavings,
    errorReductionSavings,
    totalAnnualSavings,
    netBenefitYear1,
    netBenefitOngoing,
    roiPercentYear1,
    roiPercentOngoing,
    paybackMonths,
    fiveYearProjection,
    summary,
    recommendation,
  };
}

function generateSummary(inputs: ROIInputs, results: Partial<ROIResult>): string {
  const currentCost = inputs.currentDataTeamSize * inputs.avgSalary + inputs.externalConsultants + inputs.currentToolsCost + (inputs.manualHoursPerWeek * 52 * inputs.hourlyRate);
  const savings = results.totalAnnualSavings || 0;
  const payback = results.paybackMonths || 0;
  const cumulative = results.fiveYearProjection?.[4]?.cumulative || 0;
  const roi = results.roiPercentYear1 || 0;

  return `
**ROI Analysis Summary**

Current Annual Data Costs: €${currentCost.toLocaleString()}

With AI Data Engineering Platform:
- Annual Savings: €${savings.toLocaleString()}
- Payback Period: ${payback.toFixed(1)} months
- 5-Year Net Benefit: €${cumulative.toLocaleString()}

The investment shows a ${roi > 0 ? 'positive' : 'negative'} ROI of ${Math.abs(roi).toFixed(0)}% in Year 1.
  `.trim();
}

function generateRecommendation(paybackMonths: number, roiYear1: number, cumulative5Year: number): string {
  if (paybackMonths < 12 && roiYear1 > 100) {
    return '🌟 **Strongly Recommended** - Excellent ROI with rapid payback. This investment will generate significant value.';
  } else if (paybackMonths < 24 && roiYear1 > 50) {
    return '✅ **Recommended** - Good ROI with reasonable payback period. Positive long-term value.';
  } else if (paybackMonths < 36 && cumulative5Year > 0) {
    return '👍 **Worth Considering** - Moderate ROI but positive 5-year returns. Consider phased implementation.';
  } else {
    return '⚠️ **Needs Review** - Consider reducing scope or exploring alternatives to improve ROI.';
  }
}

// Industry benchmarks
export const INDUSTRY_BENCHMARKS = {
  retail: {
    avgTimeSavings: 40, // percent
    avgProductivityGain: 35,
    avgErrorReduction: 60,
    typicalROI: 250,
  },
  finance: {
    avgTimeSavings: 45,
    avgProductivityGain: 40,
    avgErrorReduction: 70,
    typicalROI: 320,
  },
  healthcare: {
    avgTimeSavings: 35,
    avgProductivityGain: 30,
    avgErrorReduction: 75,
    typicalROI: 280,
  },
  saas: {
    avgTimeSavings: 50,
    avgProductivityGain: 45,
    avgErrorReduction: 55,
    typicalROI: 380,
  },
  manufacturing: {
    avgTimeSavings: 38,
    avgProductivityGain: 42,
    avgErrorReduction: 65,
    typicalROI: 260,
  },
  logistics: {
    avgTimeSavings: 42,
    avgProductivityGain: 38,
    avgErrorReduction: 58,
    typicalROI: 290,
  },
};

// Get benchmark for industry
export function getBenchmark(industry: string): typeof INDUSTRY_BENCHMARKS.retail {
  return INDUSTRY_BENCHMARKS[industry as keyof typeof INDUSTRY_BENCHMARKS] || INDUSTRY_BENCHMARKS.retail;
}

// Generate business case document
export function generateBusinessCase(inputs: ROIInputs, result: ROIResult): string {
  const fmt = (n: number) => n.toLocaleString();
  
  return `
# Business Case: AI Data Engineering Platform Investment

## Executive Summary

This business case analyzes the investment in an AI-powered data engineering platform. 
The analysis shows a **${result.paybackMonths.toFixed(1)}-month payback period** with a 
**${result.roiPercentYear1.toFixed(0)}% ROI in Year 1**.

## Current State Analysis

### Current Annual Costs

| Cost Category | Annual Amount |
|--------------|---------------|
| Data Team Salaries | €${fmt(inputs.currentDataTeamSize * inputs.avgSalary)} |
| External Consultants | €${fmt(inputs.externalConsultants)} |
| Tools & Infrastructure | €${fmt(inputs.currentToolsCost)} |
| Manual Data Work | €${fmt(inputs.manualHoursPerWeek * 52 * inputs.hourlyRate)} |
| **Total** | **€${fmt(result.currentAnnualCost)}** |

## Investment Required

| Item | Year 1 | Ongoing (Annual) |
|------|--------|------------------|
| Platform Implementation | €${fmt(inputs.projectInvestment)} | - |
| Support & Maintenance | €${fmt(inputs.annualSupportCost)} | €${fmt(inputs.annualSupportCost)} |
| **Total** | **€${fmt(result.totalYear1Investment)}** | **€${fmt(result.ongoingAnnualCost)}** |

## Expected Benefits

### Annual Savings Breakdown

| Benefit Area | Annual Savings |
|-------------|----------------|
| Labor Efficiency | €${fmt(result.laborSavings)} |
| Time Savings | €${fmt(result.efficiencySavings)} |
| Error Reduction | €${fmt(result.errorReductionSavings)} |
| **Total Annual Savings** | **€${fmt(result.totalAnnualSavings)}** |

## ROI Analysis

### Key Metrics

- **Year 1 Net Benefit**: €${fmt(result.netBenefitYear1)}
- **Year 1 ROI**: ${result.roiPercentYear1.toFixed(0)}%
- **Payback Period**: ${result.paybackMonths.toFixed(1)} months
- **5-Year Cumulative Benefit**: €${fmt(result.fiveYearProjection[4].cumulative)}

### 5-Year Projection

| Year | Investment | Savings | Cumulative |
|------|------------|---------|------------|
${result.fiveYearProjection.map(p => `| ${p.year} | €${fmt(p.investment)} | €${fmt(p.savings)} | €${fmt(p.cumulative)} |`).join('\n')}

## Recommendation

${result.recommendation}

---

*Generated by AI Data Engineering System ROI Calculator*
`;
}
