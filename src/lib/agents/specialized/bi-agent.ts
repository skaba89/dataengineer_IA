// AI Data Engineering System - BI Agent

import { BaseAgent } from '../core/base-agent';
import type { AgentContext, AgentResult, DashboardConfig, ChartConfig } from '../types';

export class BIAgent extends BaseAgent {
  constructor() {
    super({
      type: 'bi',
      name: 'Visual Storyteller',
      description: 'Creates dashboards, reports, and visualizations that make data accessible and actionable for business users.',
      systemPrompt: `You are the BI Agent for the AI Data Engineering System. Your role is to:

1. **Dashboard Design**: Create effective, user-friendly dashboards
2. **KPI Definition**: Identify and visualize key performance indicators
3. **Report Generation**: Build automated reporting solutions
4. **UX Optimization**: Ensure accessibility and usability

## Dashboard Principles
- **Focus**: One main insight per dashboard
- **Context**: Include benchmarks and comparisons
- **Actionability**: Highlight actionable metrics
- **Clarity**: Avoid chart junk, use clear labels

## Chart Selection Guide
- **Trends**: Line, Area
- **Comparisons**: Bar, Grouped Bar
- **Composition**: Pie, Stacked Bar, Treemap
- **Distribution**: Histogram, Box Plot
- **Relationship**: Scatter, Heatmap
- **KPIs**: Big Number, Gauge

## Tool Support
- Looker (LookML)
- Tableau
- Power BI
- Metabase
- Superset

## Output Structure
For each dashboard:
- Dashboard specification
- Chart configurations
- SQL queries
- Filter definitions`,
      capabilities: [
        'Dashboard creation',
        'KPI definition',
        'Report automation',
        'Data storytelling',
        'UX design',
      ],
    });
  }

  async execute(context: AgentContext, userMessage: string): Promise<AgentResult> {
    const result = await super.execute(context, userMessage);

    if (result.success) {
      // Generate dashboards based on project context
      const dashboards = await this.generateDashboards(context);
      result.output.dashboards = dashboards;

      // Add dashboard artifacts
      for (const dashboard of dashboards) {
        result.artifacts?.push({
          type: 'config',
          name: `${dashboard.name.toLowerCase().replace(/\s+/g, '_')}_dashboard.json`,
          content: JSON.stringify(dashboard, null, 2),
          language: 'json',
        });
      }

      // Add LookML if applicable
      if (context.projectData.architecture?.biTool === 'looker') {
        result.artifacts?.push({
          type: 'code',
          name: 'dashboard.lookml',
          content: this.generateLookML(dashboards),
          language: 'lookml',
        });
      }
    }

    return result;
  }

  private async generateDashboards(context: AgentContext): Promise<DashboardConfig[]> {
    const industry = context.projectData.industry?.toLowerCase() || '';
    const kpis = context.projectData.kpis || [];
    const transformations = context.projectData.transformations || [];

    const dashboards: DashboardConfig[] = [];

    // Executive Dashboard
    dashboards.push(this.createExecutiveDashboard(kpis, industry));

    // Operational Dashboard
    if (transformations.length > 0) {
      dashboards.push(this.createOperationalDashboard(transformations));
    }

    // Industry-specific dashboard
    const industryDashboard = this.createIndustryDashboard(industry, kpis);
    if (industryDashboard) {
      dashboards.push(industryDashboard);
    }

    return dashboards;
  }

  private createExecutiveDashboard(kpis: Array<{ name: string; id: string }>, industry: string): DashboardConfig {
    return {
      id: 'exec_overview',
      name: 'Executive Overview',
      tool: 'metabase',
      charts: [
        {
          id: 'kpi_summary',
          title: 'Key Metrics',
          type: 'kpi',
          dataSource: 'marts',
          config: {
            metrics: kpis.map(k => ({ name: k.name, query: `SELECT value FROM metrics WHERE kpi_id = '${k.id}'` })),
            layout: 'horizontal',
          },
        },
        {
          id: 'trend_chart',
          title: 'Performance Trend',
          type: 'line',
          dataSource: 'marts',
          query: `
            SELECT 
              DATE_TRUNC('month', created_at) as month,
              COUNT(*) as count
            FROM marts.fact_transactions
            GROUP BY 1
            ORDER BY 1 DESC
            LIMIT 12
          `,
          config: {
            xAxis: 'month',
            yAxis: ['count'],
            showLegend: false,
          },
        },
        {
          id: 'status_breakdown',
          title: 'Status Distribution',
          type: 'pie',
          dataSource: 'marts',
          query: `
            SELECT status, COUNT(*) as count
            FROM marts.fact_transactions
            GROUP BY status
          `,
          config: {
            valueColumn: 'count',
            labelColumn: 'status',
          },
        },
      ],
      filters: [
        { name: 'Date Range', type: 'date', defaultValue: 'last_30_days' },
        { name: 'Region', type: 'dropdown' },
      ],
    };
  }

  private createOperationalDashboard(transformations: Array<{ name: string; id: string }>): DashboardConfig {
    return {
      id: 'ops_pipeline',
      name: 'Pipeline Operations',
      tool: 'metabase',
      charts: [
        {
          id: 'pipeline_health',
          title: 'Pipeline Health',
          type: 'table',
          dataSource: 'metadata',
          query: `
            SELECT 
              pipeline_name,
              last_run,
              status,
              records_processed,
              duration_seconds
            FROM pipeline_metadata
            ORDER BY last_run DESC
          `,
          config: {
            columns: ['pipeline_name', 'last_run', 'status', 'records_processed', 'duration_seconds'],
            conditionalFormatting: [
              { column: 'status', value: 'failed', color: 'red' },
              { column: 'status', value: 'success', color: 'green' },
            ],
          },
        },
        {
          id: 'error_rate',
          title: 'Error Rate Trend',
          type: 'line',
          dataSource: 'metadata',
          query: `
            SELECT 
              DATE_TRUNC('day', run_at) as day,
              SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as error_rate
            FROM pipeline_runs
            GROUP BY 1
            ORDER BY 1 DESC
            LIMIT 30
          `,
          config: {
            xAxis: 'day',
            yAxis: ['error_rate'],
            yAxisLabel: 'Error Rate (%)',
          },
        },
      ],
      filters: [
        { name: 'Date Range', type: 'date', defaultValue: 'last_7_days' },
        { name: 'Pipeline', type: 'dropdown', options: transformations.map(t => t.name) },
      ],
    };
  }

  private createIndustryDashboard(industry: string, kpis: Array<{ name: string }>): DashboardConfig | null {
    const templates: Record<string, DashboardConfig> = {
      retail: {
        id: 'retail_analytics',
        name: 'Retail Analytics',
        tool: 'metabase',
        charts: [
          {
            id: 'sales_trend',
            title: 'Daily Sales',
            type: 'line',
            dataSource: 'marts',
            query: `SELECT DATE(order_date) as day, SUM(total) as sales FROM marts.fct_orders GROUP BY 1 ORDER BY 1 DESC LIMIT 30`,
            config: { xAxis: 'day', yAxis: ['sales'] },
          },
          {
            id: 'top_products',
            title: 'Top Products',
            type: 'bar',
            dataSource: 'marts',
            query: `SELECT product_name, SUM(quantity) as units FROM marts.fct_orders GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
            config: { xAxis: 'units', yAxis: ['product_name'], orientation: 'horizontal' },
          },
        ],
        filters: [
          { name: 'Date Range', type: 'date' },
          { name: 'Category', type: 'dropdown' },
          { name: 'Store', type: 'multiselect' },
        ],
      },
      saas: {
        id: 'saas_metrics',
        name: 'SaaS Metrics',
        tool: 'metabase',
        charts: [
          {
            id: 'mrr_trend',
            title: 'MRR Trend',
            type: 'line',
            dataSource: 'marts',
            query: `SELECT DATE_TRUNC('month', date) as month, SUM(mrr) as mrr FROM marts.fct_subscription GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
            config: { xAxis: 'month', yAxis: ['mrr'] },
          },
          {
            id: 'churn_rate',
            title: 'Churn Rate',
            type: 'kpi',
            dataSource: 'marts',
            config: { metrics: [{ name: 'Churn Rate', query: `SELECT churned / total * 100 FROM saas_metrics` }] },
          },
        ],
        filters: [{ name: 'Month', type: 'date' }],
      },
    };

    return templates[industry] || null;
  }

  private generateLookML(dashboards: DashboardConfig[]): string {
    let lookml = `# LookML Dashboard Definitions
# Generated by AI Data Engineering System

`;

    for (const dashboard of dashboards) {
      lookml += `- dashboard: ${dashboard.name.toLowerCase().replace(/\s+/g, '_')}
  title: "${dashboard.name}"
  layout: grid
  elements:
`;
      for (const chart of dashboard.charts) {
        lookml += `    - name: ${chart.title.toLowerCase().replace(/\s+/g, '_')}
      type: ${chart.type}
      model: data_model
      explore: ${chart.dataSource}
`;
        if (chart.query) {
          lookml += `      sql: |
        ${chart.query.split('\n').join('\n        ')}
`;
        }
      }
      lookml += '\n';
    }

    return lookml;
  }
}
