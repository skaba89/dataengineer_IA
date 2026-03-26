// AI Data Engineering System - Agent Library

// Types
export * from './types';

// Core
export { BaseAgent, createMessage } from './core/base-agent';
export { AgentOrchestrator, getOrchestrator } from './core/orchestrator';

// Specialized Agents
export {
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
} from './specialized/index';

// Agent descriptions for UI
export const agentDescriptions: Record<string, { name: string; description: string; icon: string }> = {
  business: {
    name: 'Strategic Orchestrator',
    description: 'Analyzes business requirements and ensures strategic alignment.',
    icon: 'briefcase',
  },
  sales: {
    name: 'Revenue Generator',
    description: 'Manages lead qualification and deal closure.',
    icon: 'trending-up',
  },
  discovery: {
    name: 'Data Archaeologist',
    description: 'Explores data ecosystems and analyzes schemas.',
    icon: 'search',
  },
  architecture: {
    name: 'Blueprint Designer',
    description: 'Designs optimal data architectures and tech stacks.',
    icon: 'layers',
  },
  pipeline: {
    name: 'Flow Builder',
    description: 'Generates production-ready ETL/ELT pipelines.',
    icon: 'git-branch',
  },
  transformation: {
    name: 'Data Alchemist',
    description: 'Implements data transformations and models.',
    icon: 'shuffle',
  },
  bi: {
    name: 'Visual Storyteller',
    description: 'Creates dashboards and visualizations.',
    icon: 'bar-chart-2',
  },
  conversational: {
    name: 'Query Translator',
    description: 'Enables natural language data queries.',
    icon: 'message-circle',
  },
  pricing: {
    name: 'Value Architect',
    description: 'Generates pricing proposals and ROI analysis.',
    icon: 'dollar-sign',
  },
  productization: {
    name: 'Knowledge Evangelist',
    description: 'Extracts reusable templates and enriches knowledge.',
    icon: 'book-open',
  },
};
