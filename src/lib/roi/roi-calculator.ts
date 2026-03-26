// ROI Calculator Service - Business case and investment analysis

export interface ProjectParameters {
  projectName: string
  industry: string
  dataVolumeGB: number
  dataSources: number
  users: number
  complexity: 'low' | 'medium' | 'high'
  timeline: number // weeks
  teamSize: number
  cloudProvider: 'aws' | 'gcp' | 'azure' | 'multi'
  features: string[]
}

export interface CostBreakdown {
  development: {
    dataEngineerDays: number
    architectDays: number
    biDeveloperDays: number
    pmDays: number
    qaDays: number
    totalDays: number
    averageDailyRate: number
    totalCost: number
  }
  infrastructure: {
    compute: number
    storage: number
    networking: number
    security: number
    monitoring: number
    monthlyCost: number
    yearlyCost: number
  }
  software: {
    etlTools: number
    biTools: number
    monitoring: number
    other: number
    yearlyCost: number
  }
  maintenance: {
    supportHours: number
    hourlyRate: number
    yearlyCost: number
  }
  totalFirstYear: number
  totalThreeYears: number
}

export interface BenefitEstimate {
  efficiency: {
    hoursSavedPerWeek: number
    hourlyCost: number
    yearlySavings: number
  }
  revenue: {
    improvedDecisionMaking: number
    fasterTimeToInsight: number
    newRevenueOpportunities: number
    yearlyIncrease: number
  }
  risk: {
    reducedErrors: number
    complianceImprovement: number
    yearlySavings: number
  }
  totalYearlyBenefit: number
  totalThreeYearBenefit: number
}

export interface ROIMetrics {
  paybackPeriod: number // months
  roi: number // percentage
  npv: number // Net Present Value
  irr: number // Internal Rate of Return
  breakEvenPoint: string
  threeYearROI: number
}

export interface ROIAnalysis {
  parameters: ProjectParameters
  costs: CostBreakdown
  benefits: BenefitEstimate
  metrics: ROIMetrics
  recommendations: string[]
  riskFactors: string[]
  comparison: {
    buildVsBuy: {
      build: number
      buy: number
      recommendation: 'build' | 'buy'
    }
    cloudOptions: Array<{
      provider: string
      estimatedCost: number
      pros: string[]
      cons: string[]
    }>
  }
}

// Daily rates by role (EUR)
const DAILY_RATES = {
  dataEngineer: 700,
  architect: 900,
  biDeveloper: 600,
  projectManager: 500,
  qa: 400,
}

// Complexity multipliers
const COMPLEXITY_MULTIPLIERS = {
  low: 0.7,
  medium: 1.0,
  high: 1.5,
}

/**
 * Calculate comprehensive ROI analysis
 */
export function calculateROI(params: ProjectParameters): ROIAnalysis {
  const costs = calculateCosts(params)
  const benefits = calculateBenefits(params)
  const metrics = calculateMetrics(costs, benefits)
  const recommendations = generateRecommendations(params, metrics)
  const riskFactors = identifyRisks(params)
  const comparison = generateComparison(params, costs)

  return {
    parameters: params,
    costs,
    benefits,
    metrics,
    recommendations,
    riskFactors,
    comparison,
  }
}

/**
 * Calculate detailed cost breakdown
 */
function calculateCosts(params: ProjectParameters): CostBreakdown {
  const multiplier = COMPLEXITY_MULTIPLIERS[params.complexity]
  
  // Development effort calculation
  const baseDays = {
    dataEngineer: params.dataSources * 5 + params.dataVolumeGB * 0.1,
    architect: 10 + params.dataSources * 2,
    biDeveloper: params.users * 2 + params.features.filter(f => f.includes('dashboard')).length * 5,
    pm: params.timeline * 0.5,
    qa: params.timeline * 0.3,
  }

  const dataEngineerDays = Math.round(baseDays.dataEngineer * multiplier)
  const architectDays = Math.round(baseDays.architect * multiplier)
  const biDeveloperDays = Math.round(baseDays.biDeveloper * multiplier)
  const pmDays = Math.round(baseDays.pm)
  const qaDays = Math.round(baseDays.qa * multiplier)
  const totalDays = dataEngineerDays + architectDays + biDeveloperDays + pmDays + qaDays

  const development = {
    dataEngineerDays,
    architectDays,
    biDeveloperDays,
    pmDays,
    qaDays,
    totalDays,
    averageDailyRate: Math.round((
      dataEngineerDays * DAILY_RATES.dataEngineer +
      architectDays * DAILY_RATES.architect +
      biDeveloperDays * DAILY_RATES.biDeveloper +
      pmDays * DAILY_RATES.projectManager +
      qaDays * DAILY_RATES.qa
    ) / totalDays),
    totalCost: Math.round(
      dataEngineerDays * DAILY_RATES.dataEngineer +
      architectDays * DAILY_RATES.architect +
      biDeveloperDays * DAILY_RATES.biDeveloper +
      pmDays * DAILY_RATES.projectManager +
      qaDays * DAILY_RATES.qa
    ),
  }

  // Infrastructure costs (monthly)
  const baseCompute = params.dataVolumeGB * 0.5 + params.users * 10
  const compute = Math.round(baseCompute * multiplier)
  const storage = Math.round(params.dataVolumeGB * 0.023 * 3) // S3 pricing approximation
  const networking = Math.round(50 + params.dataSources * 20)
  const security = Math.round(100 + params.dataVolumeGB * 0.01)
  const monitoring = Math.round(50)
  const monthlyCost = compute + storage + networking + security + monitoring

  const infrastructure = {
    compute,
    storage,
    networking,
    security,
    monitoring,
    monthlyCost,
    yearlyCost: monthlyCost * 12,
  }

  // Software costs (yearly)
  const software = {
    etlTools: 12000, // Fivetran/Airbyte enterprise
    biTools: 6000, // Metabase/Tableau
    monitoring: 3000,
    other: 2000,
    yearlyCost: 23000,
  }

  // Maintenance (yearly)
  const maintenance = {
    supportHours: Math.round(params.timeline * 4),
    hourlyRate: 150,
    yearlyCost: Math.round(params.timeline * 4 * 150),
  }

  const totalFirstYear = development.totalCost + infrastructure.yearlyCost + software.yearlyCost + maintenance.yearlyCost
  const totalThreeYears = development.totalCost + (infrastructure.yearlyCost + software.yearlyCost + maintenance.yearlyCost) * 3

  return {
    development,
    infrastructure,
    software,
    maintenance,
    totalFirstYear,
    totalThreeYears,
  }
}

/**
 * Calculate benefit estimates
 */
function calculateBenefits(params: ProjectParameters): BenefitEstimate {
  const multiplier = COMPLEXITY_MULTIPLIERS[params.complexity]
  
  // Efficiency gains
  const hoursSavedPerWeek = Math.round((10 + params.dataSources * 2) * multiplier)
  const hourlyCost = 75 // Average analyst hourly cost
  const efficiencySavings = hoursSavedPerWeek * hourlyCost * 52

  const efficiency = {
    hoursSavedPerWeek,
    hourlyCost,
    yearlySavings: efficiencySavings,
  }

  // Revenue improvements
  const baseRevenueImprovement = params.industry === 'saas' ? 50000 : 
                                  params.industry === 'finance' ? 100000 :
                                  params.industry === 'healthcare' ? 75000 : 40000

  const revenue = {
    improvedDecisionMaking: Math.round(baseRevenueImprovement * multiplier),
    fasterTimeToInsight: Math.round(baseRevenueImprovement * 0.3 * multiplier),
    newRevenueOpportunities: Math.round(baseRevenueImprovement * 0.2 * multiplier),
    yearlyIncrease: Math.round(baseRevenueImprovement * 1.5 * multiplier),
  }

  // Risk reduction
  const risk = {
    reducedErrors: Math.round(20000 * multiplier),
    complianceImprovement: Math.round(15000 * multiplier),
    yearlySavings: Math.round(35000 * multiplier),
  }

  const totalYearlyBenefit = efficiencySavings + revenue.yearlyIncrease + risk.yearlySavings
  const totalThreeYearBenefit = totalYearlyBenefit * 3

  return {
    efficiency,
    revenue,
    risk,
    totalYearlyBenefit,
    totalThreeYearBenefit,
  }
}

/**
 * Calculate ROI metrics
 */
function calculateMetrics(costs: CostBreakdown, benefits: BenefitEstimate): ROIMetrics {
  const initialInvestment = costs.development.totalCost
  const yearlyNetBenefit = benefits.totalYearlyBenefit - (costs.infrastructure.yearlyCost + costs.software.yearlyCost + costs.maintenance.yearlyCost)
  
  // Payback period (months)
  const paybackPeriod = Math.round((initialInvestment / yearlyNetBenefit) * 12)
  
  // Simple ROI (3-year)
  const totalInvestment = costs.totalThreeYears
  const totalBenefit = benefits.totalThreeYearBenefit
  const roi = Math.round(((totalBenefit - totalInvestment) / totalInvestment) * 100)

  // NPV calculation (10% discount rate)
  const discountRate = 0.10
  const npv = -initialInvestment + 
    (benefits.totalYearlyBenefit - costs.infrastructure.yearlyCost - costs.software.yearlyCost - costs.maintenance.yearlyCost) / Math.pow(1 + discountRate, 1) +
    (benefits.totalYearlyBenefit - costs.infrastructure.yearlyCost - costs.software.yearlyCost - costs.maintenance.yearlyCost) / Math.pow(1 + discountRate, 2) +
    (benefits.totalYearlyBenefit - costs.infrastructure.yearlyCost - costs.software.yearlyCost - costs.maintenance.yearlyCost) / Math.pow(1 + discountRate, 3)

  // IRR approximation
  const irr = roi > 0 ? Math.min(roi / 3, 50) : 0

  // Break-even point
  const breakEvenPoint = paybackPeriod <= 12 ? 'Less than 1 year' :
                         paybackPeriod <= 18 ? '1-1.5 years' :
                         paybackPeriod <= 24 ? '1.5-2 years' : 'More than 2 years'

  return {
    paybackPeriod,
    roi,
    npv: Math.round(npv),
    irr,
    breakEvenPoint,
    threeYearROI: roi,
  }
}

/**
 * Generate recommendations
 */
function generateRecommendations(params: ProjectParameters, metrics: ROIMetrics): string[] {
  const recommendations: string[] = []

  if (metrics.paybackPeriod > 24) {
    recommendations.push('Consider a phased approach to reduce initial investment and accelerate time-to-value')
  }

  if (params.complexity === 'high' && params.teamSize < 5) {
    recommendations.push('Increase team size or consider external support for high-complexity project')
  }

  if (params.dataVolumeGB > 1000) {
    recommendations.push('Implement data lakehouse architecture for optimal cost-performance ratio')
  }

  if (params.users > 50) {
    recommendations.push('Consider dedicated BI tool licensing for better collaboration')
  }

  recommendations.push('Start with MVP to validate business case before full investment')
  recommendations.push('Establish clear KPIs and governance framework from day one')
  recommendations.push('Plan for data quality and master data management early')

  return recommendations
}

/**
 * Identify risk factors
 */
function identifyRisks(params: ProjectParameters): string[] {
  const risks: string[] = []

  if (params.dataSources > 10) {
    risks.push('High number of data sources increases integration complexity')
  }

  if (params.timeline < 8) {
    risks.push('Aggressive timeline may impact quality and team sustainability')
  }

  if (params.teamSize < 3) {
    risks.push('Small team size creates key-person dependency risk')
  }

  risks.push('Data quality issues may require additional remediation effort')
  risks.push('Stakeholder alignment critical for adoption success')
  risks.push('Cloud cost management requires ongoing governance')

  return risks
}

/**
 * Generate comparison analysis
 */
function generateComparison(params: ProjectParameters, costs: CostBreakdown): ROIAnalysis['comparison'] {
  const buildCost = costs.totalThreeYears
  
  // Buy options (simplified)
  const buyOptions = params.dataVolumeGB > 500 ? 300000 : 150000
  const buyAnnual = 50000

  const buildVsBuy = {
    build: buildCost,
    buy: buyOptions + buyAnnual * 3,
    recommendation: buildCost < buyOptions + buyAnnual * 3 ? 'build' : 'buy' as 'build' | 'buy',
  }

  const cloudOptions = [
    {
      provider: 'AWS',
      estimatedCost: Math.round(costs.infrastructure.yearlyCost * 1.0),
      pros: ['Mature ecosystem', 'Redshift/Athena', 'Large talent pool'],
      cons: ['Complex pricing', 'Vendor lock-in risk'],
    },
    {
      provider: 'GCP',
      estimatedCost: Math.round(costs.infrastructure.yearlyCost * 0.9),
      pros: ['BigQuery excellence', 'Competitive pricing', 'AI/ML integration'],
      cons: ['Smaller ecosystem', 'Fewer managed services'],
    },
    {
      provider: 'Azure',
      estimatedCost: Math.round(costs.infrastructure.yearlyCost * 1.1),
      pros: ['Microsoft integration', 'Synapse Analytics', 'Enterprise focus'],
      cons: ['Higher pricing', 'Learning curve'],
    },
    {
      provider: 'Multi-cloud',
      estimatedCost: Math.round(costs.infrastructure.yearlyCost * 1.2),
      pros: ['Best-of-breed', 'Reduced lock-in', 'Flexibility'],
      cons: ['Complexity', 'Integration challenges', 'Higher skills required'],
    },
  ]

  return { buildVsBuy, cloudOptions }
}

/**
 * Quick ROI estimation for templates
 */
export function quickROI(industry: string, budget: number): { expectedROI: number; paybackMonths: number } {
  const industryMultipliers: Record<string, number> = {
    SAAS: 2.5,
    FINANCE: 2.0,
    HEALTHCARE: 1.8,
    E_COMMERCE: 2.2,
    RETAIL: 1.6,
    MANUFACTURING: 1.5,
    LOGISTICS: 1.7,
    TELECOM: 1.9,
    INSURANCE: 2.0,
    EDUCATION: 1.3,
  }

  const multiplier = industryMultipliers[industry] || 1.5
  const expectedROI = Math.round((multiplier * 100) - 100)
  const paybackMonths = Math.round(12 / multiplier)

  return { expectedROI, paybackMonths }
}
