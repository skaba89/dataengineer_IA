// AI Data Engineering System - Architecture Diagram Generator

export interface DiagramNode {
  id: string;
  label: string;
  type: 'source' | 'warehouse' | 'transform' | 'bi' | 'orchestrator' | 'storage';
  x: number;
  y: number;
  color: string;
  icon?: string;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface ArchitectureDiagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  mermaidCode: string;
  description: string;
}

// Generate Modern Stack Diagram
export function generateModernStackDiagram(config: { 
  sources: string[]; 
  warehouse: string; 
  bi: string 
}): ArchitectureDiagram {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  // Sources
  config.sources.forEach((source, i) => {
    nodes.push({
      id: `source_${i}`,
      label: source,
      type: 'source',
      x: 100,
      y: 80 + i * 80,
      color: '#3B82F6',
      icon: 'database',
    });
    edges.push({
      id: `e1_${i}`,
      source: `source_${i}`,
      target: 'ingestion',
      label: 'extract',
    });
  });

  // Ingestion layer
  nodes.push({
    id: 'ingestion',
    label: 'Airbyte/Fivetran',
    type: 'orchestrator',
    x: 300,
    y: 150,
    color: '#8B5CF6',
    icon: 'git-branch',
  });

  // Warehouse
  nodes.push({
    id: 'warehouse',
    label: config.warehouse,
    type: 'warehouse',
    x: 500,
    y: 150,
    color: '#10B981',
    icon: 'server',
  });
  edges.push({
    id: 'e2',
    source: 'ingestion',
    target: 'warehouse',
    label: 'load',
    animated: true,
  });

  // Transformation
  nodes.push({
    id: 'transform',
    label: 'dbt',
    type: 'transform',
    x: 500,
    y: 280,
    color: '#F59E0B',
    icon: 'shuffle',
  });
  edges.push({
    id: 'e3',
    source: 'warehouse',
    target: 'transform',
    label: 'transform',
  });

  // BI
  nodes.push({
    id: 'bi',
    label: config.bi,
    type: 'bi',
    x: 700,
    y: 200,
    color: '#EF4444',
    icon: 'bar-chart-2',
  });
  edges.push({
    id: 'e4',
    source: 'warehouse',
    target: 'bi',
    label: 'query',
    animated: true,
  });

  // Generate Mermaid code
  const mermaidCode = `
graph LR
    subgraph Sources
${config.sources.map((s, i) => `        S${i}[${s}]`).join('\n')}
    end
    
    subgraph Ingestion
        ETL[Airbyte/Fivetran]
    end
    
    subgraph Storage
        DW[${config.warehouse}]
    end
    
    subgraph Transform
        DBT[dbt Models]
    end
    
    subgraph BI
        VIS[${config.bi}]
    end
    
${config.sources.map((_, i) => `    S${i} -->|extract| ETL`).join('\n')}
    ETL -->|load| DW
    DW -->|transform| DBT
    DW -->|query| VIS
    DBT -.->|refresh| DW
`;

  return {
    nodes,
    edges,
    mermaidCode: mermaidCode.trim(),
    description: 'Modern Data Stack: Fivetran/Airbyte → Snowflake/BigQuery → dbt → Looker/Tableau',
  };
}

// Generate Lakehouse Diagram
export function generateLakehouseDiagram(config: { 
  sources: string[]; 
  lakehouse: string 
}): ArchitectureDiagram {
  const mermaidCode = `
graph TB
    subgraph Sources
${config.sources.map((s, i) => `        S${i}[${s}]`).join('\n')}
    end
    
    subgraph Lake["Data Lake (S3/GCS)"]
        RAW[Raw Zone]
        BRONZE[Bronze Layer]
        SILVER[Silver Layer]
        GOLD[Gold Layer]
    end
    
    subgraph Processing["Lakehouse Engine"]
        SPARK[${config.lakehouse}]
    end
    
    subgraph BI["Analytics"]
        DASH[Dashboards]
        ML[ML Models]
    end
    
${config.sources.map((_, i) => `    S${i} -->|ingest| RAW`).join('\n')}
    RAW --> BRONZE
    BRONZE -->|clean| SILVER
    SILVER -->|aggregate| GOLD
    SPARK --> BRONZE
    SPARK --> SILVER
    GOLD --> DASH
    GOLD --> ML
`;

  return {
    nodes: [],
    edges: [],
    mermaidCode: mermaidCode.trim(),
    description: 'Data Lakehouse: S3/GCS → Delta Lake → Spark/Databricks → BI',
  };
}

// Generate Streaming Diagram
export function generateStreamingDiagram(config: { 
  sources: string[]; 
  streamProcessor: string 
}): ArchitectureDiagram {
  const mermaidCode = `
graph LR
    subgraph Producers
${config.sources.map((s, i) => `        P${i}[${s}]`).join('\n')}
    end
    
    subgraph Streaming
        KAFKA[Apache Kafka]
        PROC[${config.streamProcessor}]
    end
    
    subgraph Sinks
        RT[(Real-time DB)]
        BATCH[(Data Lake)]
    end
    
    subgraph Consumers
        API[REST API]
        WS[WebSocket]
    end
    
${config.sources.map((_, i) => `    P${i} -->|produce| KAFKA`).join('\n')}
    KAFKA --> PROC
    PROC --> RT
    PROC --> BATCH
    RT --> API
    RT --> WS
`;

  return {
    nodes: [],
    edges: [],
    mermaidCode: mermaidCode.trim(),
    description: 'Real-time Streaming: Kafka → Flink/Spark Streaming → Real-time DB → Dashboard',
  };
}

// Main diagram generator
export function generateArchitectureDiagram(config: {
  type: 'modernDataStack' | 'lakehouse' | 'streaming';
  sources: string[];
  warehouse?: string;
  bi?: string;
  lakehouse?: string;
  streamProcessor?: string;
}): ArchitectureDiagram {
  switch (config.type) {
    case 'modernDataStack':
      return generateModernStackDiagram({
        sources: config.sources,
        warehouse: config.warehouse || 'Snowflake',
        bi: config.bi || 'Looker',
      });
    case 'lakehouse':
      return generateLakehouseDiagram({
        sources: config.sources,
        lakehouse: config.lakehouse || 'Databricks',
      });
    case 'streaming':
      return generateStreamingDiagram({
        sources: config.sources,
        streamProcessor: config.streamProcessor || 'Flink',
      });
    default:
      return generateModernStackDiagram({
        sources: config.sources,
        warehouse: config.warehouse || 'Snowflake',
        bi: config.bi || 'Looker',
      });
  }
}

// Generate data flow diagram
export function generateDataFlowDiagram(tables: string[]): string {
  return `
graph TD
    subgraph Sources
${tables.slice(0, 3).map((t, i) => `        SRC_${i}[${t}]`).join('\n')}
    end
    
    subgraph Staging
${tables.slice(0, 3).map((t, i) => `        STG_${i}[stg_${t.toLowerCase()}]`).join('\n')}
    end
    
    subgraph Marts
        FCT[Fact Tables]
        DIM[Dimension Tables]
    end
    
    subgraph Reports
        DASH[Dashboards]
    end
    
    SRC_0 --> STG_0
    SRC_1 --> STG_1
    SRC_2 --> STG_2
    STG_0 --> FCT
    STG_1 --> FCT
    STG_2 --> DIM
    FCT --> DASH
    DIM --> DASH
`;
}

// Generate ER diagram
export function generateERDiagram(tables: Array<{
  name: string;
  columns: Array<{ name: string; type: string; isPrimaryKey?: boolean }>;
  foreignKeys?: Array<{ columns: string[]; referencedTable: string }>;
}>): string {
  const tableDefinitions = tables.map(table => {
    const columns = table.columns.map(col => 
      `        ${col.name} ${col.type}${col.isPrimaryKey ? ' PK' : ''}`
    ).join('\n');
    return `    ${table.name} {\n${columns}\n    }`;
  }).join('\n');

  const relationships = tables.flatMap(table => 
    (table.foreignKeys || []).map(fk => 
      `    ${table.name} ||--o{ ${fk.referencedTable} : "references"`
    )
  ).join('\n');

  return `
erDiagram
${tableDefinitions}
${relationships}
`;
}
