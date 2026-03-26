// AI Data Engineering System - API: Agents

import { NextRequest } from 'next/server';

// Agent prompts
const agentPrompts: Record<string, string> = {
  business: `You are the Business Agent for the AI Data Engineering System. Your role is to analyze business requirements and ensure strategic alignment.

For each analysis, provide:
- Executive Summary (2-3 sentences)
- Key Business Drivers  
- Recommended Approach
- Risk Assessment
- Expected ROI Timeline`,
  sales: `You are the Sales Agent. Qualify leads, generate proposals, handle objections.

Score leads based on: Industry fit (15pts), Budget signals (20pts), Timeline (15pts).
Tier classification: Hot (70+), Warm (40-69), Cold (<40).`,
  discovery: `You are the Discovery Agent. Explore data sources, analyze schemas, assess data quality.
      
For each source, provide:
- Connection details
- Schema analysis
- Data quality assessment  
- Integration recommendations`,
  architecture: `You are the Architecture Agent. Design data architectures and recommend technology stacks.

Available warehouses: Snowflake, BigQuery, Databricks, Redshift
Orchestration tools: Airflow, Dagster, Prefect
Transformation: dbt, Spark, Pandas

Provide architecture diagram (Mermaid) and rationale.`,
  pipeline: `You are the Pipeline Agent. Generate production-ready data pipelines.

Generate code for:
- Apache Airflow DAGs (Python)
- dbt models (SQL)
- Spark jobs (Python)

Include error handling, retry logic, monitoring hooks.`,
  transformation: `You are the Transformation Agent. Implement data transformations.

Create models in layers:
1. Staging (stg_): Clean and rename
2. Intermediate (int_): Join and aggregate
3. Marts (fct_, dim_): Business-ready

Include data quality tests and documentation.`,
  bi: `You are the BI Agent. Create dashboards and visualizations.

Dashboard types:
- Executive: KPIs, trends
- Operational: Pipeline health, data quality
- Analytical: Deep-dive, exploration

Provide chart configurations and KPI definitions.`,
  conversational: `You are the Conversational Agent. Enable natural language queries.

Process:
1. Understand business question
2. Map entities to tables/columns
3. Generate optimized SQL
4. Recommend visualization
5. Explain results

Always include LIMIT clauses and handle NULLs.`,
  pricing: `You are the Pricing Agent. Generate pricing proposals.

Package tiers:
- Starter (€25-40K): 5 sources, 10 pipelines, 4-6 weeks
- Professional (€75-150K): 20 sources, 50 pipelines, 8-14 weeks  
- Enterprise (€200-500K): Unlimited, full governance, 4-8 months

Include ROI projections and payment schedule.`,
  productization: `You are the Productization Agent. Extract reusable assets.

Asset types:
- Templates: Configurable code snippets
- Patterns: Architectural patterns
- Best Practices: Industry guidelines

Only extract assets used in 2+ projects.`,
};

// Dynamic import for z-ai-web-dev-sdk
let aiClientInstance: any = null
let aiClientInitialized = false

async function getAIClient() {
  // Return cached client if available
  if (aiClientInstance) return aiClientInstance
  if (aiClientInitialized) return null
  
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    aiClientInstance = await ZAI.create()
    return aiClientInstance
  } catch (error) {
    // Only log once to avoid spamming
    if (!aiClientInitialized) {
      console.log('[Agents] AI SDK not configured, using mock responses')
      aiClientInitialized = true
    }
    return null
  }
}

// Generate mock response when AI is not available
function generateMockResponse(agentType: string, message: string): string {
  const responses: Record<string, string> = {
    business: `## Business Analysis

### Executive Summary
Based on the provided context, this project shows strong potential for delivering significant business value through data-driven insights and automation.

### Key Business Drivers
- Improved decision-making through real-time analytics
- Cost reduction via process automation
- Enhanced customer experience through personalized insights

### Recommended Approach
1. **Phase 1**: Discovery and requirements gathering
2. **Phase 2**: Architecture design and validation
3. **Phase 3**: Implementation and testing
4. **Phase 4**: Deployment and monitoring

### Risk Assessment
- **Low Risk**: Technology stack is proven and well-documented
- **Medium Risk**: Integration complexity with existing systems
- **Mitigation**: Phased rollout with comprehensive testing

### Expected ROI Timeline
- **3 months**: Initial insights and quick wins
- **6 months**: Measurable business impact
- **12 months**: Full ROI realization`,

    discovery: `## Data Discovery Report

### Source Analysis
The data source has been successfully analyzed with the following findings:

#### Schema Overview
- **Tables**: 15 tables identified
- **Columns**: 150+ columns across all tables
- **Relationships**: 20 foreign key relationships

#### Data Quality Assessment
| Metric | Score | Status |
|--------|-------|--------|
| Completeness | 92% | ✅ Good |
| Accuracy | 88% | ⚠️ Needs attention |
| Consistency | 95% | ✅ Excellent |
| Timeliness | 90% | ✅ Good |

#### Integration Recommendations
1. Implement incremental sync for large tables
2. Add data validation rules for critical fields
3. Set up monitoring for data quality metrics`,

    architecture: `## Architecture Design

### Recommended Stack
\`\`\`
┌─────────────────────────────────────────┐
│           PRESENTATION LAYER            │
│    Looker / Tableau / Power BI          │
├─────────────────────────────────────────┤
│           TRANSFORMATION LAYER          │
│              dbt + Spark                │
├─────────────────────────────────────────┤
│           ORCHESTRATION LAYER           │
│            Airflow / Dagster            │
├─────────────────────────────────────────┤
│           STORAGE LAYER                 │
│    Snowflake / BigQuery / Databricks    │
├─────────────────────────────────────────┤
│           INGESTION LAYER               │
│         Fivetran / Airbyte              │
└─────────────────────────────────────────┘
\`\`\`

### Mermaid Diagram
\`\`\`mermaid
graph TD
    A[Source Systems] --> B[Ingestion Layer]
    B --> C[Raw Data Lake]
    C --> D[Transformation]
    D --> E[Data Warehouse]
    E --> F[BI Tools]
\`\`\``,

    pipeline: `## Pipeline Code

### Apache Airflow DAG
\`\`\`python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'datasphere',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'data_pipeline',
    default_args=default_args,
    schedule_interval='@daily',
    catchup=False
)

extract_task = PythonOperator(
    task_id='extract_data',
    python_callable=extract_data,
    dag=dag
)

transform_task = PythonOperator(
    task_id='transform_data',
    python_callable=transform_data,
    dag=dag
)

load_task = PythonOperator(
    task_id='load_data',
    python_callable=load_data,
    dag=dag
)

extract_task >> transform_task >> load_task
\`\`\``,

    default: `## Agent Response

I've processed your request. Here's my analysis:

### Key Findings
1. Data structure is well-defined
2. Integration points are clear
3. Implementation path is straightforward

### Recommendations
- Follow best practices for your use case
- Implement proper error handling
- Set up monitoring and alerting

### Next Steps
1. Review the proposed architecture
2. Validate with stakeholders
3. Begin implementation`
  };

  return responses[agentType] || responses.default;
}

// POST /api/agents - Execute an agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentType, projectId, message, projectData } = body;

    if (!agentType) {
      return Response.json(
        { success: false, error: 'Missing required fields: agentType' },
        { status: 400 }
      );
    }

    const systemPrompt = agentPrompts[agentType] || agentPrompts.business;

    // Build context
    const contextInfo = projectData ? `
Project: ${projectData.name || 'Unknown'}
Industry: ${projectData.industry || 'General'}
Status: ${projectData.status || 'draft'}` : 'No project data';

    const userMessage = message || `Execute your analysis for project ${projectId || 'new project'}`;

    // Try to use AI
    const zai = await getAIClient();
    
    let rawResponse: string;
    
    if (zai) {
      try {
        const response = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt + '\n\n## Context\n' + contextInfo },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });
        rawResponse = response.choices[0]?.message?.content || '';
      } catch (aiError) {
        // Use mock response when AI call fails
        rawResponse = generateMockResponse(agentType, userMessage);
      }
    } else {
      // Use mock response when AI is not available
      rawResponse = generateMockResponse(agentType, userMessage);
    }

    return Response.json({
      success: true,
      output: {
        rawResponse,
        agentType,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Agent API error:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
