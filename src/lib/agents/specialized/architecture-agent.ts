// AI Data Engineering System - Architecture Agent

import { BaseAgent } from '../core/base-agent';
import type { AgentContext, AgentResult, ArchitectureDecision, CostEstimate } from '../types';

export class ArchitectureAgent extends BaseAgent {
  constructor() {
    super({
      type: 'architecture',
      name: 'Blueprint Designer',
      description: 'Designs optimal data architectures, recommends technology stacks, and creates implementation blueprints.',
      systemPrompt: `You are the Architecture Agent for the AI Data Engineering System. Your role is to:

1. **Architecture Design**: Create scalable, maintainable data architectures
2. **Technology Selection**: Recommend optimal tools based on requirements and constraints
3. **Pattern Application**: Apply proven architectural patterns (Data Vault, Star Schema, Lakehouse)
4. **Cost Optimization**: Design cost-effective solutions

## Architecture Patterns
- **Data Vault**: Enterprise data warehousing with historical tracking
- **Star Schema**: Optimized for BI and analytics
- **Data Mesh**: Decentralized data ownership
- **Lakehouse**: Unified data lake and warehouse

## Technology Stack Options

### Data Warehouses
- **Snowflake**: Best for enterprise, strong security, automatic scaling
- **BigQuery**: Best for GCP ecosystems, serverless, ML integration
- **Databricks**: Best for ML/AI workloads, Delta Lake native
- **Redshift**: Best for AWS ecosystems, cost-effective

### Orchestration
- **Airflow**: Industry standard, Python-based, extensive operators
- **Dagster**: Modern, asset-centric, strong testing
- **Prefect**: Pythonic, great DX, hybrid deployment

### Transformation
- **dbt**: SQL-native, version control, testing framework
- **Spark**: Big data processing, distributed computing
- **Pandas/DuckDB**: Lightweight, local processing

## Decision Framework
Consider:
1. Data volume and velocity
2. Query patterns and latency requirements
3. Team expertise
4. Budget constraints
5. Existing technology stack
6. Security and compliance needs

## Output Structure
Provide:
- Architecture Diagram (Mermaid)
- Technology Stack Recommendation
- Implementation Phases
- Cost Estimate
- Risk Mitigation`,
      capabilities: [
        'Architecture design',
        'Technology selection',
        'Cost estimation',
        'Performance optimization',
        'Security architecture',
        'Migration planning',
      ],
    });
  }

  async execute(context: AgentContext, userMessage: string): Promise<AgentResult> {
    const result = await super.execute(context, userMessage);

    if (result.success) {
      // Generate architecture recommendation
      const recommendation = await this.generateRecommendation(context);
      result.output.architecture = recommendation;

      // Add cost estimate
      result.output.costEstimate = this.estimateCosts(recommendation, context);

      // Generate architecture diagram
      result.artifacts?.push({
        type: 'diagram',
        name: 'architecture.mermaid',
        content: this.generateArchitectureDiagram(recommendation),
      });
    }

    return result;
  }

  private async generateRecommendation(context: AgentContext): Promise<ArchitectureDecision> {
    const project = context.projectData;
    const sources = project.dataSources || [];
    
    // Analyze requirements
    const hasBigData = sources.some(s => 
      s.metadata?.rowCount && s.metadata.rowCount > 10000000
    );
    const hasRealtime = sources.some(s => s.type === 'kafka');
    const isMultiCloud = sources.length > 3;
    const industry = project.industry?.toLowerCase() || '';

    // Technology selection logic
    let warehouseType: ArchitectureDecision['warehouseType'] = 'snowflake';
    let architecturePattern: ArchitectureDecision['architecturePattern'] = 'star_schema';

    // Industry-specific recommendations
    if (industry === 'finance' || industry === 'healthcare') {
      warehouseType = 'snowflake'; // Strong security and compliance
      architecturePattern = 'data_vault'; // Audit trail requirements
    } else if (industry === 'saas' || industry === 'retail') {
      warehouseType = 'bigquery';
      architecturePattern = 'star_schema';
    }

    // Scale-based adjustments
    if (hasBigData || hasRealtime) {
      warehouseType = 'databricks';
      architecturePattern = 'lakehouse';
    }

    return {
      warehouseType,
      orchestrationTool: hasRealtime ? 'dagster' : 'airflow',
      transformationFramework: 'dbt',
      biTool: this.recommendBITool(industry),
      architecturePattern,
      deploymentTarget: this.recommendCloud(warehouseType),
      rationale: this.generateRationale(hasBigData, hasRealtime, industry),
    };
  }

  private recommendBITool(industry: string): ArchitectureDecision['biTool'] {
    const recommendations: Record<string, ArchitectureDecision['biTool']> = {
      finance: 'looker',
      retail: 'tableau',
      healthcare: 'powerbi',
      saas: 'metabase',
    };
    return recommendations[industry] || 'metabase';
  }

  private recommendCloud(warehouse: string): ArchitectureDecision['deploymentTarget'] {
    const mapping: Record<string, ArchitectureDecision['deploymentTarget']> = {
      snowflake: 'snowflake',
      bigquery: 'gcp',
      databricks: 'databricks',
      redshift: 'aws',
    };
    return mapping[warehouse] || 'gcp';
  }

  private generateRationale(hasBigData: boolean, hasRealtime: boolean, industry: string): string {
    let rationale = `Selected architecture optimized for ${industry || 'general'} industry.`;
    
    if (hasBigData) {
      rationale += ' Configured for high-volume data processing with distributed computing.';
    }
    if (hasRealtime) {
      rationale += ' Includes streaming capabilities for real-time data ingestion.';
    }

    return rationale;
  }

  private estimateCosts(
    architecture: ArchitectureDecision,
    context: AgentContext
  ): CostEstimate {
    const baseCosts: Record<string, CostEstimate> = {
      snowflake: { monthly: 2000, breakdown: { compute: 1200, storage: 400, networking: 200, licensing: 200 }, currency: 'USD' },
      bigquery: { monthly: 1500, breakdown: { compute: 800, storage: 400, networking: 200, licensing: 100 }, currency: 'USD' },
      databricks: { monthly: 3000, breakdown: { compute: 2000, storage: 400, networking: 300, licensing: 300 }, currency: 'USD' },
    };

    const base = baseCosts[architecture.warehouseType] || baseCosts.snowflake;
    
    // Adjust based on data sources
    const sourceCount = context.projectData.dataSources?.length || 1;
    base.monthly *= Math.max(1, sourceCount * 0.5);

    return base;
  }

  private generateArchitectureDiagram(architecture: ArchitectureDecision): string {
    return `flowchart TB
    subgraph Sources["Data Sources"]
        S1[PostgreSQL]
        S2[API]
        S3[S3/Files]
    end

    subgraph Ingestion["Data Ingestion"]
        A1[${architecture.orchestrationTool}]
        A2[Airbyte/Fivetran]
    end

    subgraph Storage["Data Storage"]
        RAW[Raw Layer]
        STG[Staging Layer]
        MART[Marts Layer]
    end

    subgraph Transform["Transformation"]
        DBT[dbt Models]
    end

    subgraph BI["Analytics"]
        ${architecture.biTool?.toUpperCase() || 'BI'}[Dashboards]
    end

    S1 --> A2
    S2 --> A1
    S3 --> A2
    A2 --> RAW
    A1 --> RAW
    RAW --> STG
    STG --> DBT
    DBT --> MART
    MART --> ${architecture.biTool?.toUpperCase() || 'BI'}`;
  }
}
