// AI Data Engineering System - Productization Agent

import { BaseAgent } from '../core/base-agent';
import type { AgentContext, AgentResult } from '../types';

interface ReusableAsset {
  id: string;
  type: 'template' | 'pattern' | 'snippet';
  category: string;
  name: string;
  content: string;
  industry?: string;
}

export class ProductizationAgent extends BaseAgent {
  private assetCount = 0;

  constructor() {
    super({
      type: 'productization',
      name: 'Knowledge Evangelist',
      description: 'Extracts reusable patterns and templates from completed projects.',
      systemPrompt: `You are the Productization Agent. Extract:
- Pipeline templates
- SQL patterns
- Dashboard templates
- Best practices`,
      capabilities: ['Pattern extraction', 'Template generation'],
    });
  }

  async execute(context: AgentContext, _userMessage: string): Promise<AgentResult> {
    const project = context.projectData;
    const assets: ReusableAsset[] = [];

    // Extract pipeline templates
    if (project.dataSources?.length) {
      for (const source of project.dataSources) {
        this.assetCount++;
        assets.push({
          id: `tpl_${this.assetCount}`,
          type: 'template',
          category: 'pipeline',
          name: `${source.type} Pipeline`,
          content: this.generatePipelineTemplate(source),
          industry: project.industry,
        });
      }
    }

    // Extract transformation patterns
    if (project.transformations?.length) {
      for (const transform of project.transformations) {
        this.assetCount++;
        assets.push({
          id: `pat_${this.assetCount}`,
          type: 'pattern',
          category: 'transformation',
          name: `${transform.type} Pattern`,
          content: this.extractPattern(transform),
          industry: project.industry,
        });
      }
    }

    return {
      success: true,
      output: {
        assetsExtracted: assets.length,
        assets,
      },
      artifacts: assets.map(a => ({
        type: 'document' as const,
        name: `${a.id}_${a.name.toLowerCase().replace(/\s+/g, '_')}.md`,
        content: `# ${a.name}\n\nType: ${a.type}\nCategory: ${a.category}\n\n\`\`\`sql\n${a.content}\n\`\`\``,
        language: 'markdown' as const,
      })),
    };
  }

  private generatePipelineTemplate(source: { type: string; name: string }): string {
    return `-- Pipeline Template for ${source.type}
-- Extract from ${source.name}

SELECT *
FROM source_table
WHERE updated_at > '{{ last_run }}'`;
  }

  private extractPattern(transform: { type: string; name: string }): string {
    return `-- Transformation Pattern: ${transform.type}
-- Model: ${transform.name}

with source as (
    select * from {{ ref('upstream_model') }}
),
transformed as (
    select * from source
)
select * from transformed`;
  }
}
