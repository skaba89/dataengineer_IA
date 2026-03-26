// AI Data Engineering System - Discovery Agent

import { BaseAgent } from '../core/base-agent';
import type { AgentContext, AgentResult, DataSourceConfig, TableSchema } from '../types';

export class DiscoveryAgent extends BaseAgent {
  constructor() {
    super({
      type: 'discovery',
      name: 'Data Archaeologist',
      description: 'Explores and maps data ecosystems, analyzes schemas, assesses data quality, and identifies integration patterns.',
      systemPrompt: `You are the Discovery Agent for the AI Data Engineering System. Your role is to:

1. **Data Landscape Mapping**: Identify and catalog all data sources, their relationships, and data flows
2. **Schema Analysis**: Reverse-engineer database schemas, identify entities and relationships
3. **Quality Assessment**: Detect data quality issues, missing values, inconsistencies
4. **Integration Patterns**: Recommend optimal integration approaches for each source

## Your Expertise
- Database introspection and schema extraction
- API and streaming data source analysis
- Data profiling and quality assessment
- Sensitive data detection (PII, financial data)
- Data lineage inference

## Discovery Workflow
For each data source:
1. Connect and extract metadata
2. Analyze table structures and relationships
3. Profile data samples for quality
4. Identify sensitive columns
5. Assess integration complexity

## Analysis Dimensions
- Volume: Record counts, growth rate
- Velocity: Update frequency, real-time vs batch
- Variety: Structured, semi-structured, unstructured
- Veracity: Quality score, completeness
- Value: Business relevance

## Output Structure
Provide:
- Data Source Inventory
- Schema Documentation (ERD if applicable)
- Data Quality Report
- Integration Recommendations
- Quick Wins Identified`,
      capabilities: [
        'Database schema analysis',
        'API data source discovery',
        'Data quality profiling',
        'PII detection',
        'Relationship mapping',
        'Integration assessment',
      ],
    });
  }

  async execute(context: AgentContext, userMessage: string): Promise<AgentResult> {
    const result = await super.execute(context, userMessage);
    
    if (result.success) {
      // Analyze configured data sources
      const discoveryResults = await this.analyzeDataSources(context);
      result.output.discovery = discoveryResults;
      
      // Add quality assessment
      result.output.qualityReport = await this.generateQualityReport(context);
      
      // Generate schema documentation
      if (discoveryResults.schemas.length > 0) {
        result.artifacts?.push({
          type: 'diagram',
          name: 'er_diagram.mermaid',
          content: this.generateERDiagram(discoveryResults.schemas),
        });
      }
    }

    return result;
  }

  private async analyzeDataSources(context: AgentContext): Promise<{
    sources: DataSourceConfig[];
    schemas: TableSchema[];
    relationships: Array<{ from: string; to: string; type: string }>;
  }> {
    const sources = context.projectData.dataSources || [];
    const schemas: TableSchema[] = [];
    const relationships: Array<{ from: string; to: string; type: string }> = [];

    // Analyze each source
    for (const source of sources) {
      const sourceAnalysis = await this.analyzeSource(source);
      schemas.push(...sourceAnalysis.tables);
      relationships.push(...sourceAnalysis.relationships);
    }

    return { sources, schemas, relationships };
  }

  private async analyzeSource(source: DataSourceConfig): Promise<{
    tables: TableSchema[];
    relationships: Array<{ from: string; to: string; type: string }>;
  }> {
    // In production, this would connect to the actual data source
    // For now, we return a template based on source type
    
    const templates: Record<string, { tables: TableSchema[]; relationships: Array<{ from: string; to: string; type: string }> }> = {
      postgresql: {
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
              { name: 'email', type: 'VARCHAR(255)', nullable: false },
              { name: 'created_at', type: 'TIMESTAMP', nullable: false },
              { name: 'updated_at', type: 'TIMESTAMP', nullable: true },
            ],
            primaryKey: ['id'],
            rowCount: 100000,
          },
          {
            name: 'orders',
            columns: [
              { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
              { name: 'user_id', type: 'UUID', nullable: false, isForeignKey: true },
              { name: 'total', type: 'DECIMAL(10,2)', nullable: false },
              { name: 'status', type: 'VARCHAR(50)', nullable: false },
              { name: 'created_at', type: 'TIMESTAMP', nullable: false },
            ],
            primaryKey: ['id'],
            rowCount: 500000,
          },
        ],
        relationships: [
          { from: 'orders.user_id', to: 'users.id', type: 'many_to_one' },
        ],
      },
      default: {
        tables: [],
        relationships: [],
      },
    };

    return templates[source.type] || templates.default;
  }

  private async generateQualityReport(context: AgentContext): Promise<{
    overallScore: number;
    issues: Array<{ table: string; type: string; severity: string; description: string }>;
  }> {
    const issues: Array<{ table: string; type: string; severity: string; description: string }> = [];
    const sources = context.projectData.dataSources || [];

    // Simulated quality analysis
    if (sources.length === 0) {
      issues.push({
        table: 'N/A',
        type: 'no_sources',
        severity: 'high',
        description: 'No data sources configured. Add sources to begin discovery.',
      });
    }

    // Common quality patterns
    issues.push({
      table: 'users',
      type: 'missing_values',
      severity: 'medium',
      description: '5% of records have null values in the email column',
    });

    issues.push({
      table: 'orders',
      type: 'duplicates',
      severity: 'low',
      description: '0.1% duplicate order IDs detected',
    });

    const score = Math.max(0, 100 - issues.length * 10);

    return { overallScore: score, issues };
  }

  private generateERDiagram(schemas: TableSchema[]): string {
    let mermaid = 'erDiagram\n';

    for (const table of schemas) {
      // Add table with columns
      for (const column of table.columns) {
        const key = column.isPrimaryKey ? 'PK ' : column.isForeignKey ? 'FK ' : '';
        mermaid += `    ${table.name} {\n`;
        mermaid += `        ${column.type} ${key}${column.name}\n`;
        mermaid += '    }\n';
      }
    }

    // Add relationships
    // mermaid += `    USERS ||--o{ ORDERS : places\n`;

    return mermaid;
  }
}
