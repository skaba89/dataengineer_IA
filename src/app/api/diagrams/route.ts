// AI Data Engineering System - Diagrams API

import { NextRequest, NextResponse } from 'next/server';
import { generateArchitectureDiagram, generateDataFlowDiagram, generateERDiagram } from '@/lib/diagrams/generator';
import { auth } from '@/lib/auth';

// POST /api/diagrams/generate - Generate architecture diagram
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Allow unauthenticated for demo
    const body = await request.json();
    const { type, sources, warehouse, bi, lakehouse, streamProcessor, tables } = body;

    // Generate architecture diagram
    if (type && sources) {
      const diagram = generateArchitectureDiagram({
        type,
        sources,
        warehouse,
        bi,
        lakehouse,
        streamProcessor,
      });

      return NextResponse.json({
        success: true,
        diagram,
      });
    }

    // Generate data flow diagram
    if (tables && Array.isArray(tables)) {
      const mermaidCode = generateDataFlowDiagram(tables);

      return NextResponse.json({
        success: true,
        diagram: {
          mermaidCode,
          description: 'Data flow from sources to dashboards',
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request. Provide type+sources or tables.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Diagram generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate diagram' },
      { status: 500 }
    );
  }
}

// GET /api/diagrams/templates - Get diagram templates
export async function GET() {
  const templates = [
    {
      id: 'modernDataStack',
      name: 'Modern Data Stack',
      description: 'Fivetran/Airbyte → Snowflake/BigQuery → dbt → Looker/Tableau',
      sources: ['PostgreSQL', 'MySQL', 'Salesforce', 'Stripe'],
      warehouse: 'Snowflake',
      bi: 'Looker',
    },
    {
      id: 'lakehouse',
      name: 'Data Lakehouse',
      description: 'S3/GCS → Delta Lake → Spark/Databricks → BI',
      sources: ['Kafka', 'APIs', 'Files'],
      lakehouse: 'Databricks',
    },
    {
      id: 'streaming',
      name: 'Real-time Streaming',
      description: 'Kafka → Flink/Spark Streaming → Real-time DB → Dashboard',
      sources: ['IoT Sensors', 'Clickstream', 'Logs'],
      streamProcessor: 'Flink',
    },
  ];

  return NextResponse.json({
    success: true,
    templates,
  });
}

// PUT /api/diagrams/er - Generate ER diagram
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tables } = body;

    if (!tables || !Array.isArray(tables)) {
      return NextResponse.json(
        { success: false, error: 'Tables array is required' },
        { status: 400 }
      );
    }

    const mermaidCode = generateERDiagram(tables);

    return NextResponse.json({
      success: true,
      diagram: {
        mermaidCode,
        description: 'Entity Relationship Diagram',
      },
    });

  } catch (error) {
    console.error('ER diagram generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate ER diagram' },
      { status: 500 }
    );
  }
}
