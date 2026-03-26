// AI Data Engineering System - Base Agent Class

import ZAI from 'z-ai-web-dev-sdk';
import type { AgentConfig, AgentContext, AgentResult, ConversationMessage } from '../types';

// Base Agent class
export abstract class BaseAgent {
  protected config: AgentConfig;
  protected zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  // Initialize AI client
  protected async initializeAI(): Promise<void> {
    if (!this.zai) {
      this.zai = await ZAI.create();
    }
  }

  // Get agent info
  getInfo() {
    return {
      type: this.config.type,
      name: this.config.name,
      description: this.config.description,
      capabilities: this.config.capabilities || [],
    };
  }

  // Execute the agent
  async execute(context: AgentContext, userMessage: string): Promise<AgentResult> {
    return this.executeBase(context, userMessage);
  }

  // Base execution logic
  protected async executeBase(context: AgentContext, userMessage: string): Promise<AgentResult> {
    await this.initializeAI();

    try {
      // Build messages for LLM
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: this.buildSystemPrompt(context) },
        ...context.conversationHistory.map(m => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content: userMessage },
      ];

      // Call LLM
      const response = await this.zai!.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      });

      const assistantMessage = response.choices[0]?.message?.content || '';

      // Parse and structure the response
      return this.parseResponse(assistantMessage, context);
    } catch (error) {
      return {
        success: false,
        output: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Build system prompt with context
  protected buildSystemPrompt(context: AgentContext): string {
    return `${this.config.systemPrompt}

## Project Context
- Project ID: ${context.projectId}
- Project Name: ${context.projectData.name}
- Status: ${context.projectData.status}
${context.projectData.industry ? `- Industry: ${context.projectData.industry}` : ''}

## Output Format
Always structure your response as:
1. ANALYSIS: What you discovered/analyzed
2. RECOMMENDATIONS: Specific actionable recommendations  
3. ARTIFACTS: Any code, configs, or documents to generate
4. NEXT_STEPS: Recommended next actions`;
  }

  // Parse LLM response
  protected parseResponse(response: string, _context: AgentContext): AgentResult {
    const sections = this.extractSections(response);

    return {
      success: true,
      output: {
        analysis: sections.analysis,
        rawResponse: response,
      },
      recommendations: sections.recommendations,
      artifacts: sections.artifacts,
      nextSteps: sections.nextSteps,
    };
  }

  // Extract sections from response
  protected extractSections(response: string): {
    analysis: string;
    recommendations: string[];
    artifacts: Array<{ type: 'code' | 'document' | 'config' | 'diagram' | 'sql'; name: string; content: string; language?: string }>;
    nextSteps: string[];
  } {
    // Extract analysis section
    const analysisMatch = response.match(/##?\s*ANALYSIS\s*\n([\s\S]*?)(?=##?\s*(RECOMMENDATIONS|ARTIFACTS|NEXT_STEPS)|$)/i);
    const analysis = analysisMatch?.[1]?.trim() || '';

    // Extract recommendations
    const recommendationsMatch = response.match(/##?\s*RECOMMENDATIONS\s*\n([\s\S]*?)(?=##?\s*(ANALYSIS|ARTIFACTS|NEXT_STEPS)|$)/i);
    const recommendations = this.parseList(recommendationsMatch?.[1] || '');

    // Extract artifacts
    const artifactsMatch = response.match(/##?\s*ARTIFACTS\s*\n([\s\S]*?)(?=##?\s*(ANALYSIS|RECOMMENDATIONS|NEXT_STEPS)|$)/i);
    const artifacts = this.parseArtifacts(artifactsMatch?.[1] || '');

    // Extract next steps
    const nextStepsMatch = response.match(/##?\s*NEXT_STEPS\s*\n([\s\S]*?)(?=##?\s*(ANALYSIS|RECOMMENDATIONS|ARTIFACTS)|$)/i);
    const nextSteps = this.parseList(nextStepsMatch?.[1] || '');

    return { analysis, recommendations, artifacts, nextSteps };
  }

  // Parse bullet list
  protected parseList(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  // Parse code artifacts
  protected parseArtifacts(text: string): Array<{ type: 'code' | 'document' | 'config' | 'diagram' | 'sql'; name: string; content: string; language?: string }> {
    const artifacts: Array<{ type: 'code' | 'document' | 'config' | 'diagram' | 'sql'; name: string; content: string; language?: string }> = [];
    
    // Match code blocks
    const codeBlockRegex = /```(\w+)?(?:\s+(.+?))?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1] || 'text';
      const name = match[2] || `artifact_${artifacts.length + 1}`;
      const content = match[3].trim();

      artifacts.push({
        type: this.mapLanguageToType(language),
        name,
        content,
        language,
      });
    }

    return artifacts;
  }

  // Map language to artifact type
  protected mapLanguageToType(lang: string): 'code' | 'document' | 'config' | 'diagram' | 'sql' {
    const mapping: Record<string, 'code' | 'document' | 'config' | 'diagram' | 'sql'> = {
      python: 'code',
      sql: 'sql',
      yaml: 'config',
      yml: 'config',
      json: 'config',
      markdown: 'document',
      md: 'document',
      mermaid: 'diagram',
    };
    return mapping[lang] || 'code';
  }
}

// Helper to create messages
export function createMessage(role: ConversationMessage['role'], content: string): ConversationMessage {
  return {
    role,
    content,
    timestamp: new Date(),
  };
}
