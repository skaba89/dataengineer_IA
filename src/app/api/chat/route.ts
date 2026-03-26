// AI Data Engineering System - API: Chat

import { NextRequest, NextResponse } from 'next/server';

// Dynamic import for z-ai-web-dev-sdk with error handling
let aiClientInstance: any = null
let aiClientInitialized = false

async function getAIClient() {
  if (aiClientInstance) return aiClientInstance
  if (aiClientInitialized) return null
  
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    aiClientInstance = await ZAI.create()
    return aiClientInstance
  } catch (error) {
    if (!aiClientInitialized) {
      console.log('[Chat] AI SDK not configured, using mock responses')
      aiClientInitialized = true
    }
    return null
  }
}

const conversationalPrompt = `You are the Conversational Analytics Agent for the AI Data Engineering System. Your role is to enable natural language queries.

Process:
1. Understand business question
2. Map entities to tables/columns
3. Generate optimized SQL
4. Recommend visualization type
5. Explain results

SQL Generation Rules:
- Always include LIMIT clause (default: 100)
- Handle NULL values with COALESCE
- Use CTEs for complex queries
- Add comments for documentation
- Follow naming conventions: snake_case

Visualization Recommendations:
- Single metric: KPI card (big number)
- Over time: Line chart
- Comparison: Bar chart  
- Distribution: Pie chart
- Relationship: Scatter plot
- Table: For detailed data`;

// Generate mock response when AI is not available
function generateMockChatResponse(message: string, contextInfo: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Detect query type and generate appropriate mock response
  if (lowerMessage.includes('total') || lowerMessage.includes('somme') || lowerMessage.includes('sum')) {
    return `## Analyse de votre requête

Je comprends que vous souhaitez obtenir un total. Voici la requête SQL correspondante :

\`\`\`sql
-- Total des ventes par catégorie
SELECT 
    category_name,
    COALESCE(SUM(amount), 0) as total_amount,
    COUNT(*) as transaction_count
FROM sales
WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY category_name
ORDER BY total_amount DESC
LIMIT 100;
\`\`\`

### Recommandations
- **Visualisation**: Un graphique à barres serait idéal pour comparer les totaux
- **Filtres suggérés**: Période, catégorie, région
- **Drill-down possible**: Par sous-catégorie ou par jour`;
  }
  
  if (lowerMessage.includes('trend') || lowerMessage.includes('tendance') || lowerMessage.includes('évolution')) {
    return `## Analyse de tendance

Voici la requête SQL pour analyser l'évolution dans le temps :

\`\`\`sql
-- Évolution mensuelle des métriques
WITH monthly_stats AS (
    SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total_transactions,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_transaction
    FROM transactions
    WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
    GROUP BY DATE_TRUNC('month', created_at)
)
SELECT 
    month,
    total_transactions,
    total_revenue,
    avg_transaction,
    LAG(total_revenue) OVER (ORDER BY month) as previous_month
FROM monthly_stats
ORDER BY month;
\`\`\`

### Insights
- **Visualisation recommandée**: Graphique linéaire avec tendance
- **KPIs à surveiller**: Croissance mensuelle, moyenne mobile`;
  }
  
  if (lowerMessage.includes('top') || lowerMessage.includes('meilleur') || lowerMessage.includes('best')) {
    return `## Analyse des meilleurs éléments

\`\`\`sql
-- Top 10 des produits les plus vendus
SELECT 
    p.product_name,
    p.category,
    COUNT(*) as sales_count,
    SUM(s.quantity) as total_units,
    SUM(s.quantity * s.unit_price) as total_revenue
FROM products p
JOIN sales s ON p.id = s.product_id
WHERE s.sale_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY p.id, p.product_name, p.category
ORDER BY total_revenue DESC
LIMIT 10;
\`\`\`

### Recommandations
- **Visualisation**: Graphique à barres horizontales
- **Action suggérée**: Analyser pourquoi ces produits performent bien`;
  }
  
  // Default response
  return `## Analyse de votre question

Merci pour votre question. Voici une analyse générale :

### Contexte
${contextInfo}

### Requête SQL Suggérée
\`\`\`sql
-- Requête de base adaptée à votre question
SELECT 
    *,
    created_at as date_creation
FROM your_table
WHERE conditions
ORDER BY created_at DESC
LIMIT 100;
\`\`\`

### Prochaines étapes
1. Affinez votre question avec des détails spécifiques
2. Indiquez les tables ou métriques d'intérêt
3. Spécifiez la période d'analyse souhaitée

*Note: Activez le SDK AI pour des réponses plus personnalisées.*`;
}

// POST /api/chat - Chat with AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, message, projectData, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build context
    const contextInfo = projectData ? `
## Project Context
- Name: ${projectData.name || 'Unknown'}
- Industry: ${projectData.industry || 'General'}
- Status: ${projectData.status || 'draft'}` : 'No project context';

    // Try to use AI
    const zai = await getAIClient();
    let content: string;

    if (zai) {
      // Build conversation
      const messages = [
        { role: 'system', content: conversationalPrompt + '\n' + contextInfo },
        ...(conversationHistory || []).map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      // Generate response
      const response = await zai.chat.completions.create({
        messages,
        temperature: 0.3, // Lower for precise SQL
        max_tokens: 4000,
      });

      content = response.choices[0]?.message?.content || '';
    } else {
      // Mock response when AI is not available
      content = generateMockChatResponse(message, contextInfo);
    }

    // Extract SQL if present
    const sqlMatch = content.match(/```sql\n([\s\S]*?)```/);
    const sql = sqlMatch?.[1]?.trim();

    // Recommend visualization
    const vizType = recommendVisualization(message);

    return NextResponse.json({
      success: true,
      response: content,
      sql,
      visualization: {
        type: vizType,
        config: getDefaultVizConfig(vizType),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function recommendVisualization(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('trend') || lowerQuestion.includes('over time') || lowerQuestion.includes('history')) {
    return 'line';
  }
  if (lowerQuestion.includes('compare') || lowerQuestion.includes('versus') || lowerQuestion.includes('vs')) {
    return 'bar';
  }
  if (lowerQuestion.includes('breakdown') || lowerQuestion.includes('distribution') || lowerQuestion.includes('split')) {
    return 'pie';
  }
  if (lowerQuestion.includes('top') || lowerQuestion.includes('best') || lowerQuestion.includes('ranking')) {
    return 'bar';
  }
  if (lowerQuestion.includes('total') || lowerQuestion.includes('count') || lowerQuestion.includes('average') || lowerQuestion.includes('sum')) {
    return 'kpi';
  }

  return 'table';
}

function getDefaultVizConfig(type: string): Record<string, unknown> {
  const configs: Record<string, Record<string, unknown>> = {
    line: {
      xAxis: 'date',
      yAxis: 'value',
      showGrid: true,
      showLegend: true,
    },
    bar: {
      orientation: 'vertical',
      showValues: true,
      sort: 'descending',
    },
    pie: {
      showPercentage: true,
      showLegend: true,
    },
    kpi: {
      format: 'number',
      showTrend: true,
    },
    table: {
      pagination: true,
      pageSize: 10,
    },
  };

  return configs[type] || configs.table;
}
