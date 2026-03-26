// AI Data Engineering System - Agent Orchestrator

import ZAI from 'z-ai-web-dev-sdk';
import type { AgentType, AgentContext, AgentResult, ProjectData } from '../types';
import {
  BusinessAgent,
  SalesAgent,
  DiscoveryAgent,
  ArchitectureAgent,
  PipelineAgent,
  TransformationAgent,
  BIAgent,
  ConversationalAgent,
  PricingAgent,
  ProductizationAgent,
} from '../specialized/index';

// Workflow phases
export type WorkflowPhase = 
  | 'initiated'
  | 'qualifying'
  | 'discovering'
  | 'designing'
  | 'building'
  | 'deploying'
  | 'completed';

// Workflow step
export interface WorkflowStep {
  agent: AgentType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: AgentResult;
  duration?: number;
  error?: string;
}

// Orchestration plan
export interface OrchestrationPlan {
  projectId: string;
  currentPhase: WorkflowPhase;
  steps: WorkflowStep[];
  estimatedDuration: number;
  estimatedCost: number;
}

// Main Orchestrator class
export class AgentOrchestrator {
  private agents: Map<AgentType, unknown>;
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;

  constructor() {
    // Initialize all agents
    this.agents = new Map([
      ['business', new BusinessAgent()],
      ['sales', new SalesAgent()],
      ['discovery', new DiscoveryAgent()],
      ['architecture', new ArchitectureAgent()],
      ['pipeline', new PipelineAgent()],
      ['transformation', new TransformationAgent()],
      ['bi', new BIAgent()],
      ['conversational', new ConversationalAgent()],
      ['pricing', new PricingAgent()],
      ['productization', new ProductizationAgent()],
    ]);
  }

  // Initialize AI client
  private async ensureAI(): Promise<void> {
    if (!this.zai) {
      this.zai = await ZAI.create();
    }
  }

  // Get agent by type
  getAgent(type: AgentType): unknown {
    const agent = this.agents.get(type);
    if (!agent) {
      throw new Error(`Agent '${type}' not found`);
    }
    return agent;
  }

  // Get all agents info
  getAgentsInfo(): Array<{ type: AgentType; name: string; description: string }> {
    return Array.from(this.agents.entries()).map(([type, agent]) => ({
      type,
      name: (agent as { name: string }).name || type,
      description: (agent as { description: string }).description || '',
    }));
  }

  // Create orchestration plan
  async createPlan(projectData: ProjectData): Promise<OrchestrationPlan> {
    await this.ensureAI();

    const steps = this.determineWorkflow(projectData.status || 'draft');
    const projectId = projectData.id || 'unknown';

    return {
      projectId,
      currentPhase: this.mapStatusToPhase(projectData.status || 'draft'),
      steps,
      estimatedDuration: this.calculateDuration(steps),
      estimatedCost: this.calculateCost(steps),
    };
  }

  // Execute single agent
  async executeAgent(
    type: AgentType,
    context: AgentContext,
    message: string
  ): Promise<AgentResult> {
    const agent = this.getAgent(type) as {
      execute: (ctx: AgentContext, msg: string) => Promise<AgentResult>;
    };
    return agent.execute(context, message);
  }

  // Execute full workflow
  async executeWorkflow(
    context: AgentContext,
    onProgress?: (step: WorkflowStep, index: number) => void
  ): Promise<WorkflowStep[]> {
    const plan = await this.createPlan(context.projectData);
    const results: WorkflowStep[] = [];

    for (let i = 0; i < plan.steps.length; i++) {
      const step: WorkflowStep = { ...plan.steps[i], status: 'running' };
      const startTime = Date.now();

      try {
        const message = this.generateAgentMessage(step.agent, context);
        const result = await this.executeAgent(step.agent, context, message);

        if (result.success) {
          step.status = 'completed';
        } else {
          step.status = 'failed';
        }
        step.result = result;
        step.duration = Date.now() - startTime;

        if (result.success && result.output) {
          context.metadata = { ...context.metadata, lastResult: result.output };
        }
      } catch (error) {
        step.status = 'failed';
        step.error = error instanceof Error ? error.message : 'Unknown error';
        step.duration = Date.now() - startTime;
      }

      results.push(step);

      if (onProgress) {
        onProgress(step, i);
      }

      if (step.status === 'failed') {
        break;
      }
    }

    return results;
  }

  // Determine workflow based on project status
  private determineWorkflow(status: string): WorkflowStep[] {
    const workflows: Record<string, AgentType[]> = {
      draft: ['business', 'discovery', 'architecture', 'pricing'],
      discovery: ['discovery', 'architecture'],
      architecture: ['architecture', 'pipeline'],
      development: ['pipeline', 'transformation', 'bi'],
      deployed: ['bi', 'conversational', 'productization'],
    };

    const sequence = workflows[status] || workflows.draft;
    return sequence.map((agent) => ({ agent, status: 'pending' as const }));
  }

  // Map project status to workflow phase
  private mapStatusToPhase(status: string): WorkflowPhase {
    const mapping: Record<string, WorkflowPhase> = {
      draft: 'initiated',
      discovery: 'discovering',
      architecture: 'designing',
      development: 'building',
      deployed: 'deploying',
      completed: 'completed',
    };
    return mapping[status] || 'initiated';
  }

  // Calculate duration
  private calculateDuration(steps: WorkflowStep[]): number {
    const durations: Record<AgentType, number> = {
      business: 15,
      sales: 10,
      discovery: 45,
      architecture: 30,
      pipeline: 60,
      transformation: 45,
      bi: 30,
      conversational: 20,
      pricing: 15,
      productization: 10,
    };

    return steps.reduce((total, step) => total + (durations[step.agent] || 30), 0);
  }

  // Calculate cost
  private calculateCost(steps: WorkflowStep[]): number {
    const costs: Record<AgentType, number> = {
      business: 2,
      sales: 1,
      discovery: 4,
      architecture: 3,
      pipeline: 6,
      transformation: 5,
      bi: 3,
      conversational: 2,
      pricing: 1,
      productization: 1,
    };

    return steps.reduce((total, step) => total + (costs[step.agent] || 2), 0);
  }

  // Generate context-aware message for each agent
  private generateAgentMessage(agent: AgentType, context: AgentContext): string {
    const project = context.projectData;

    const prompts: Record<AgentType, string> = {
      business: `Analyze business requirements for "${project.name}".
        Industry: ${project.industry || 'Unknown'}
        Goals: ${project.businessGoals?.join(', ') || 'Not specified'}`,
      sales: `Qualify this opportunity for "${project.name}".
        Industry: ${project.industry || 'Unknown'}
        Status: ${project.status || 'draft'}`,
      discovery: `Perform data discovery for "${project.name}".
        Sources: ${project.dataSources?.map(s => s.name).join(', ') || 'None configured'}`,
      architecture: `Design architecture for "${project.name}".
        Sources: ${project.dataSources?.length || 0} data sources
        Pattern: ${project.architecture?.architecturePattern || 'Not specified'}`,
      pipeline: `Generate pipelines for "${project.name}".
        Architecture: ${JSON.stringify(project.architecture) || 'Not defined'}`,
      transformation: `Create transformation models for "${project.name}".
        Warehouse: ${project.architecture?.warehouseType || 'Not specified'}`,
      bi: `Design dashboards for "${project.name}".
        KPIs: ${project.kpis?.map(k => k.name).join(', ') || 'Not defined'}`,
      conversational: `Setup conversational analytics for "${project.name}".`,
      pricing: `Generate pricing proposal for "${project.name}".
        Sources: ${project.dataSources?.length || 0}
        Budget: ${project.budget?.min || 'Not specified'} - ${project.budget?.max || 'Not specified'}`,
      productization: `Extract reusable assets from "${project.name}".
        Status: ${project.status || 'draft'}`,
    };

    return prompts[agent] || `Process request for ${agent}`;
  }

  // Chat with conversational agent
  async chat(context: AgentContext, message: string): Promise<{
    response: string;
    sql?: string;
    visualization?: Record<string, unknown>;
  }> {
    await this.ensureAI();
    const agent = this.getAgent('conversational') as ConversationalAgent & {
      chat: (ctx: AgentContext, msg: string) => Promise<{
        response: string;
        sql?: string;
        visualization?: Record<string, unknown>;
      }>;
    };
    return agent.chat(context, message);
  }
}

// Singleton instance
let orchestratorInstance: AgentOrchestrator | null = null;

export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
}
