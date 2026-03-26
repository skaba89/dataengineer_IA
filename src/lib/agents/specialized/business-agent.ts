// AI Data Engineering System - Business Agent

import { BaseAgent } from '../core/base-agent';
import type { AgentContext, AgentResult } from '../types';

export class BusinessAgent extends BaseAgent {
  constructor() {
    super({
      type: 'business',
      name: 'Strategic Orchestrator',
      description: 'Analyzes business requirements and ensures strategic alignment.',
      systemPrompt: `You are the Business Agent. Analyze business requirements and ensure strategic alignment.`,
      capabilities: ['Requirements analysis', 'Strategic planning', 'Value proposition'],
    });
  }

  async execute(context: AgentContext, message: string): Promise<AgentResult> {
    return this.executeBase(context, message);
  }
}
