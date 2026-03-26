// AI Data Engineering System - Sales Agent

import { BaseAgent } from '../core/base-agent';
import type { AgentContext, AgentResult } from '../types';

interface LeadQualification {
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  signals: string[];
  objections: string[];
  nextActions: string[];
}

export class SalesAgent extends BaseAgent {
  constructor() {
    super({
      type: 'sales',
      name: 'Revenue Generator',
      description: 'Manages lead qualification, proposal generation, and deal closure.',
      systemPrompt: `You are the Sales Agent for the AI Data Engineering System. Your role is to:

1. **Lead Qualification**: Score and prioritize leads
2. **Proposal Generation**: Create compelling proposals
3. **Objection Handling**: Address concerns
4. **Pipeline Management**: Track deal progress

## Lead Scoring
- Company Fit (40 pts): Industry, size, tech stack
- Engagement (30 pts): Demo requests, content downloads
- Budget & Timing (30 pts): Budget, timeline

## Tier Classification
- Hot (70+): Immediate outreach
- Warm (40-69): Nurture sequence
- Cold (<40): Marketing automation

## Value Propositions
- 75% faster time-to-insight
- 40% lower infrastructure costs
- Self-service analytics enablement`,
      capabilities: ['Lead qualification', 'Proposal generation', 'Objection handling'],
    });
  }

  async execute(context: AgentContext, userMessage: string): Promise<AgentResult> {
    const result = await super.execute(context, userMessage);

    if (result.success) {
      const qualification = this.qualifyLead(context);
      result.output.qualification = qualification;
      result.output.nextActions = this.generateNextActions(qualification);
    }

    return result;
  }

  private qualifyLead(context: AgentContext): LeadQualification {
    const project = context.projectData;
    let score = 0;
    const signals: string[] = [];
    const objections: string[] = [];

    // Industry fit
    if (project.industry) {
      score += 15;
      signals.push(`Industry: ${project.industry}`);
    }

    // Budget signals
    if (project.budget?.max && project.budget.max >= 50000) {
      score += 20;
      signals.push('Budget identified');
    } else {
      objections.push('Budget not confirmed');
    }

    // Project activity
    if (project.status !== 'draft') {
      score += 15;
      signals.push('Active project');
    }

    // Data readiness
    if (project.dataSources?.length) {
      score += 10;
      signals.push(`${project.dataSources.length} data sources`);
    } else {
      objections.push('Data sources undefined');
    }

    const tier = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';

    return { score, tier, signals, objections, nextActions: [] };
  }

  private generateNextActions(qualification: LeadQualification): string[] {
    const actions: string[] = [];

    if (qualification.tier === 'hot') {
      actions.push('Schedule discovery call within 24h');
      actions.push('Prepare customized proposal');
      actions.push('Identify decision makers');
    } else if (qualification.tier === 'warm') {
      actions.push('Send case study');
      actions.push('Schedule follow-up in 2 weeks');
    } else {
      actions.push('Add to nurture sequence');
      actions.push('Re-evaluate in 30 days');
    }

    return actions;
  }
}
