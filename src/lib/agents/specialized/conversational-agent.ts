// AI Data Engineering System - Conversational Analytics Agent

import ZAI from 'z-ai-web-dev-sdk';
import { BaseAgent } from '../core/base-agent';
import type { AgentContext, AgentResult } from '../types';

interface ChatResponse {
  response: string;
  sql?: string;
  visualization?: {
    type: string;
    config: Record<string, unknown>;
    data: Array<Record<string, unknown>>;
  };
}

export class ConversationalAgent extends BaseAgent {
  private schemaContext: string = '';

  constructor() {
    super({
      type: 'conversational',
      name: 'Query Translator',
      description: 'Enables natural language data queries, translating business questions to SQL and visualizing results.',
      systemPrompt: `You are the Conversational Analytics Agent for the AI Data Engineering System. Your role is to:

1. **Natural Language Understanding**: Parse business questions into structured queries
2. **SQL Generation**: Write optimized, correct SQL queries
3. **Result Interpretation**: Explain query results in business terms
4. **Visualization Recommendation**: Suggest appropriate chart types

## Query Translation Process
1. Understand the business question
2. Map entities to database tables/columns
3. Generate SQL query
4. Execute and validate results
5. Provide natural language explanation

## SQL Best Practices
- Use CTEs for complex queries
- Add comments for clarity
- Include LIMIT clauses
- Handle NULL values gracefully
- Use appropriate aggregations

## Visualization Rules
- Single metric: KPI card
- Over time: Line chart
- Comparison: Bar chart
- Composition: Pie/Donut
- Relationship: Scatter

## Output Format
For each query, provide:
- SQL query
- Natural language explanation
- Visualization recommendation
- Follow-up questions`,
      capabilities: [
        'Text-to-SQL',
        'Query explanation',
        'Visualization suggestion',
        'Follow-up generation',
      ],
    });
  }

  // Set schema context for better query generation
  setSchemaContext(schema: string): void {
    this.schemaContext = schema;
  }

  // Main chat interface
  async chat(context: AgentContext, message: string): Promise<ChatResponse> {
    await this.initializeAI();

    // Build schema context
    const schemaInfo = this.buildSchemaContext(context);
    
    const systemPrompt = `${this.config.systemPrompt}

## Available Tables and Columns
${schemaInfo}

## Business Context
- Industry: ${context.projectData.industry || 'General'}
- Project: ${context.projectData.name}

When generating SQL:
1. Use only tables that exist in the schema above
2. Use proper table references (schema.table)
3. Include all necessary JOINs
4. Add LIMIT clauses to prevent large result sets`;

    const response = await this.zai!.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.3, // Lower temperature for more precise SQL
    });

    const assistantMessage = response.choices[0]?.message?.content || '';
    
    // Parse response
    const sql = this.extractSQL(assistantMessage);
    const visualization = this.recommendVisualization(message, sql);

    return {
      response: assistantMessage,
      sql,
      visualization,
    };
  }

  async execute(context: AgentContext, userMessage: string): Promise<AgentResult> {
    const chatResponse = await this.chat(context, userMessage);

    return {
      success: true,
      output: {
        response: chatResponse.response,
        sql: chatResponse.sql,
        visualization: chatResponse.visualization,
      },
      artifacts: chatResponse.sql ? [{
        type: 'sql',
        name: 'generated_query.sql',
        content: chatResponse.sql,
        language: 'sql',
      }] : [],
    };
  }

  private buildSchemaContext(context: AgentContext): string {
    const transformations = context.projectData.transformations || [];
    
    if (transformations.length === 0) {
      return `-- No transformations defined yet.
-- Example tables that may be available:
-- marts.fact_transactions (id, user_id, amount, status, created_at)
-- marts.dim_users (user_id, email, name, created_at)`;
    }

    let schemaContext = '';
    
    for (const t of transformations) {
      schemaContext += `-- Table: ${t.targetTable}\n`;
      schemaContext += `-- Type: ${t.type}\n`;
      schemaContext += `-- Source: ${t.sourceTables.join(', ')}\n`;
      schemaContext += `\n`;
    }

    return schemaContext;
  }

  private extractSQL(text: string): string | undefined {
    // Extract SQL from code blocks
    const sqlMatch = text.match(/```sql\n([\s\S]*?)```/);
    if (sqlMatch) {
      return sqlMatch[1].trim();
    }

    // Try to find SQL without code block
    const keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY'];
    const hasSQL = keywords.some(kw => text.toUpperCase().includes(kw));
    
    if (hasSQL) {
      // Try to extract the SQL statement
      const selectIndex = text.toUpperCase().indexOf('SELECT');
      if (selectIndex !== -1) {
        let sql = text.slice(selectIndex);
        // End at common termination points
        const endIndex = sql.search(/[;.]/);
        if (endIndex !== -1) {
          sql = sql.slice(0, endIndex);
        }
        return sql.trim();
      }
    }

    return undefined;
  }

  private recommendVisualization(
    question: string,
    _sql?: string
  ): ChatResponse['visualization'] {
    const lowerQuestion = question.toLowerCase();

    // Determine chart type based on question patterns
    if (lowerQuestion.includes('trend') || lowerQuestion.includes('over time') || lowerQuestion.includes('history')) {
      return {
        type: 'line',
        config: {
          xAxis: 'date',
          yAxis: 'value',
          showGrid: true,
        },
        data: [],
      };
    }

    if (lowerQuestion.includes('compare') || lowerQuestion.includes('versus') || lowerQuestion.includes('vs')) {
      return {
        type: 'bar',
        config: {
          orientation: 'vertical',
          showValues: true,
        },
        data: [],
      };
    }

    if (lowerQuestion.includes('breakdown') || lowerQuestion.includes('distribution') || lowerQuestion.includes('split')) {
      return {
        type: 'pie',
        config: {
          showPercentage: true,
          showLegend: true,
        },
        data: [],
      };
    }

    if (lowerQuestion.includes('top') || lowerQuestion.includes('best') || lowerQuestion.includes('ranking')) {
      return {
        type: 'bar',
        config: {
          orientation: 'horizontal',
          showValues: true,
          sort: 'descending',
        },
        data: [],
      };
    }

    // Default: KPI card for single values
    if (lowerQuestion.includes('total') || lowerQuestion.includes('count') || lowerQuestion.includes('average') || lowerQuestion.includes('sum')) {
      return {
        type: 'kpi',
        config: {
          format: 'number',
          showTrend: true,
        },
        data: [],
      };
    }

    return {
      type: 'table',
      config: {
        pagination: true,
        pageSize: 10,
      },
      data: [],
    };
  }

  // Generate follow-up questions
  async generateFollowUps(context: AgentContext, _previousQuery: string): Promise<string[]> {
    await this.initializeAI();

    const response = await this.zai!.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Based on the previous query context, suggest 3 follow-up questions the user might want to ask.
Return only the questions, one per line, numbered 1-3.`,
        },
        {
          role: 'user',
          content: `Project: ${context.projectData.name}
Industry: ${context.projectData.industry || 'General'}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const questions = (response.choices[0]?.message?.content || '')
      .split('\n')
      .map(q => q.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 0);

    return questions.slice(0, 3);
  }
}
