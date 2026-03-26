// AI Data Engineering System - Pricing Agent

import { BaseAgent } from '../core/base-agent';
import type { AgentContext, AgentResult } from '../types';

interface PricingEstimate {
  package: 'starter' | 'professional' | 'enterprise';
  basePrice: number;
  breakdown: Record<string, number>;
  timeline: number;
  roi: { timeframe: string; expectedValue: number; paybackMonths: number };
}

export class PricingAgent extends BaseAgent {
  constructor() {
    super({
      type: 'pricing',
      name: 'Value Architect',
      description: 'Generates pricing proposals and ROI analysis for data engineering projects.',
      systemPrompt: `You are the Pricing Agent. Generate accurate estimates based on:
- Package tiers: Starter (€25-40K), Professional (€75-150K), Enterprise (€200-500K)
- Complexity factors: sources, volume, compliance
- ROI projections based on industry benchmarks`,
      capabilities: ['Pricing estimation', 'ROI calculation', 'Proposal generation'],
    });
  }

  async execute(context: AgentContext, _userMessage: string): Promise<AgentResult> {
    const project = context.projectData;
    const sources = project.dataSources?.length || 0;
    
    // Determine package
    let pkg: PricingEstimate['package'] = 'starter';
    let basePrice = 35000;
    
    if (sources > 15 || project.industry === 'finance') {
      pkg = 'enterprise';
      basePrice = 350000;
    } else if (sources > 5) {
      pkg = 'professional';
      basePrice = 110000;
    }

    const estimate: PricingEstimate = {
      package: pkg,
      basePrice,
      breakdown: {
        discovery: Math.round(basePrice * 0.15),
        architecture: Math.round(basePrice * 0.15),
        development: Math.round(basePrice * 0.45),
        bi: Math.round(basePrice * 0.20),
        support: Math.round(basePrice * 0.05),
      },
      timeline: pkg === 'enterprise' ? 24 : pkg === 'professional' ? 11 : 5,
      roi: {
        timeframe: '12 months',
        expectedValue: Math.round(basePrice * 2.5),
        paybackMonths: Math.round(basePrice / (basePrice * 0.3 / 12)),
      },
    };

    return {
      success: true,
      output: { estimate },
      artifacts: [{
        type: 'document',
        name: 'proposal.md',
        content: this.generateProposal(project, estimate),
        language: 'markdown',
      }],
    };
  }

  private generateProposal(project: { name: string; industry?: string }, estimate: PricingEstimate): string {
    return `# Proposal: ${project.name}

## Investment Summary
- **Package**: ${estimate.package.charAt(0).toUpperCase() + estimate.package.slice(1)}
- **Total**: €${estimate.basePrice.toLocaleString()}
- **Timeline**: ${estimate.timeline} weeks

## Breakdown
| Phase | Investment |
|-------|-----------|
| Discovery | €${estimate.breakdown.discovery.toLocaleString()} |
| Architecture | €${estimate.breakdown.architecture.toLocaleString()} |
| Development | €${estimate.breakdown.development.toLocaleString()} |
| BI & Analytics | €${estimate.breakdown.bi.toLocaleString()} |
| Support | €${estimate.breakdown.support.toLocaleString()} |

## ROI Projection
- **Expected Annual Value**: €${estimate.roi.expectedValue.toLocaleString()}
- **Payback Period**: ${estimate.roi.paybackMonths} months`;
  }
}
