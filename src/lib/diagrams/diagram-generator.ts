// Architecture Diagrams Generator - Interactive Mermaid diagrams

export type DiagramType = 
  | 'architecture'
  | 'data_flow'
  | 'pipeline'
  | 'er_diagram'
  | 'sequence'
  | 'deployment'

export type ArchitectureStyle = 
  | 'lakehouse'
  | 'data_mesh'
  | 'lambda'
  | 'kappa'
  | 'traditional'

export interface DiagramConfig {
  type: DiagramType
  title: string
  style?: ArchitectureStyle
  components?: DiagramComponent[]
  connections?: DiagramConnection[]
  theme?: 'default' | 'dark' | 'forest' | 'neutral'
}

export interface DiagramComponent {
  id: string
  name: string
  type: 'source' | 'storage' | 'processing' | 'analytics' | 'consumer' | 'service'
  subcomponents?: string[]
}

export interface DiagramConnection {
  from: string
  to: string
  label?: string
  style?: 'solid' | 'dashed' | 'thick'
}

export interface GeneratedDiagram {
  type: DiagramType
  title: string
  mermaidCode: string
  description: string
  interactive: boolean
  exportFormats: ('svg' | 'png' | 'pdf')[]
}

// Architecture templates for different patterns
export const ARCHITECTURE_TEMPLATES: Record<ArchitectureStyle, GeneratedDiagram> = {
  lakehouse: {
    type: 'architecture',
    title: 'Data Lakehouse Architecture',
    mermaidCode: `
graph TB
    subgraph Sources["📡 Data Sources"]
        A1[(CRM)]
        A2[(ERP)]
        A3[(APIs)]
        A4[(IoT)]
        A5[(Files)]
    end
    
    subgraph Ingestion["🔄 Ingestion Layer"]
        B1[Airbyte]
        B2[Kafka]
        B3[Custom APIs]
    end
    
    subgraph Bronze["🥉 Bronze Layer"]
        C1[Raw Data Lake]
        C2[Schema Registry]
    end
    
    subgraph Silver["🥈 Silver Layer"]
        D1[Cleaned Data]
        D2[DQ Checks]
        D3[Deduplication]
    end
    
    subgraph Gold["🥇 Gold Layer"]
        E1[Analytics Tables]
        E2[ML Features]
        E3[API Views]
    end
    
    subgraph Transformation["⚙️ Transformation"]
        F1[dbt]
        F2[Spark]
        F3[Python]
    end
    
    subgraph Serving["📊 Serving Layer"]
        G1[Data Warehouse]
        G2[OLAP Cube]
        G3[Vector DB]
    end
    
    subgraph Consumers["👥 Consumers"]
        H1[BI Dashboards]
        H2[ML Models]
        H3[APIs]
        H4[Reports]
    end
    
    subgraph Governance["🛡️ Governance"]
        I1[Data Catalog]
        I2[Lineage]
        I3[Security]
    end
    
    Sources --> Ingestion
    Ingestion --> Bronze
    Bronze --> Transformation
    Transformation --> Silver
    Silver --> Transformation
    Transformation --> Gold
    Gold --> Serving
    Serving --> Consumers
    
    Governance -.-> Bronze
    Governance -.-> Silver
    Governance -.-> Gold
    
    style Bronze fill:#CD7F32,color:#fff
    style Silver fill:#C0C0C0,color:#000
    style Gold fill:#FFD700,color:#000
    style Governance fill:#4A5568,color:#fff
`,
    description: 'Modern data lakehouse architecture combining the best of data lakes and warehouses.',
    interactive: true,
    exportFormats: ['svg', 'png', 'pdf'],
  },
  
  data_mesh: {
    type: 'architecture',
    title: 'Data Mesh Architecture',
    mermaidCode: `
graph TB
    subgraph Domain1["Domain: Sales"]
        D1S[Raw Data]
        D1P[Products]
        D1G[Gold Tables]
        D1A[API]
    end
    
    subgraph Domain2["Domain: Marketing"]
        D2S[Raw Data]
        D2P[Campaigns]
        D2G[Gold Tables]
        D2A[API]
    end
    
    subgraph Domain3["Domain: Finance"]
        D3S[Raw Data]
        D3P[Transactions]
        D3G[Gold Tables]
        D3A[API]
    end
    
    subgraph Platform["Self-serve Platform"]
        P1[Ingestion Toolkit]
        P2[dbt Framework]
        P3[Monitoring]
        P4[CI/CD]
    end
    
    subgraph Catalog[" Federated Catalog"]
        C1[Discovery]
        C2[Lineage]
        C3[Schema]
    end
    
    subgraph Consumers["Data Consumers"]
        E1[Analysts]
        E2[Data Scientists]
        E3[Applications]
    end
    
    D1S --> D1P --> D1G --> D1A
    D2S --> D2P --> D2G --> D2A
    D3S --> D3P --> D3G --> D3A
    
    Platform -.-> Domain1
    Platform -.-> Domain2
    Platform -.-> Domain3
    
    Catalog --> D1A
    Catalog --> D2A
    Catalog --> D3A
    
    Consumers --> Catalog
    
    style Domain1 fill:#E3F2FD
    style Domain2 fill:#F3E5F5
    style Domain3 fill:#E8F5E9
    style Platform fill:#FFF3E0
    style Catalog fill:#FCE4EC
`,
    description: 'Domain-oriented decentralized data architecture with self-serve capabilities.',
    interactive: true,
    exportFormats: ['svg', 'png', 'pdf'],
  },
  
  lambda: {
    type: 'architecture',
    title: 'Lambda Architecture',
    mermaidCode: `
graph TB
    subgraph Sources["Data Sources"]
        S1[Stream Data]
        S2[Batch Data]
    end
    
    subgraph Batch["Batch Layer"]
        B1[Master Dataset]
        B2[Batch Views]
        B3[MapReduce/Spark]
    end
    
    subgraph Speed["Speed Layer"]
        V1[Stream Processing]
        V2[Real-time Views]
        V3[Kafka/Flink]
    end
    
    subgraph Serving["Serving Layer"]
        SV1[Query Engine]
        SV2[Merge Results]
    end
    
    subgraph Apps["Applications"]
        A1[Dashboards]
        A2[APIs]
        A3[Alerts]
    end
    
    S1 --> V1 --> V2
    S2 --> B1 --> B3 --> B2
    
    B2 --> SV1
    V2 --> SV1
    SV1 --> SV2 --> Apps
    
    style Batch fill:#BBDEFB
    style Speed fill:#C8E6C9
    style Serving fill:#FFE0B2
`,
    description: 'Hybrid architecture with batch and speed layers for comprehensive data processing.',
    interactive: true,
    exportFormats: ['svg', 'png', 'pdf'],
  },
  
  kappa: {
    type: 'architecture',
    title: 'Kappa Architecture',
    mermaidCode: `
graph LR
    subgraph Sources["Data Sources"]
        S1[Events]
        S2[Logs]
        S3[Changes]
    end
    
    subgraph Stream["Stream Layer"]
        K1[Apache Kafka]
        K2[Stream Storage]
    end
    
    subgraph Processing["Stream Processing"]
        P1[Flink/Spark]
        P2[Real-time ETL]
        P3[Aggregations]
    end
    
    subgraph Serving["Serving"]
        SV1[Serving DB]
        SV2[Analytics DB]
    end
    
    subgraph Apps["Consumers"]
        A1[Real-time Dashboards]
        A2[ML Models]
        A3[Notifications]
    end
    
    Sources --> K1 --> K2
    K2 --> P1 --> P2 --> P3
    P3 --> SV1
    P3 --> SV2
    SV1 --> Apps
    SV2 --> Apps
    
    style Stream fill:#E1BEE7
    style Processing fill:#B2DFDB
`,
    description: 'Stream-first architecture where all data flows through a single processing path.',
    interactive: true,
    exportFormats: ['svg', 'png', 'pdf'],
  },
  
  traditional: {
    type: 'architecture',
    title: 'Traditional Data Warehouse',
    mermaidCode: `
graph TB
    subgraph Sources["Data Sources"]
        S1[OLTP DB]
        S2[Files]
        S3[Applications]
    end
    
    subgraph ETL["ETL Process"]
        E1[Extract]
        E2[Transform]
        E3[Load]
    end
    
    subgraph DW["Data Warehouse"]
        D1[Staging Area]
        D2[Core DW]
        D3[Data Marts]
    end
    
    subgraph BI["Business Intelligence"]
        B1[Reports]
        B2[Dashboards]
        B3[Ad-hoc Queries]
    end
    
    Sources --> E1 --> E2 --> E3
    E3 --> D1 --> D2 --> D3
    D3 --> BI
    
    style ETL fill:#FFCDD2
    style DW fill:#C5CAE9
    style BI fill:#DCEDC8
`,
    description: 'Classic data warehouse architecture with centralized ETL processing.',
    interactive: true,
    exportFormats: ['svg', 'png', 'pdf'],
  },
}

/**
 * Generate a pipeline diagram
 */
export function generatePipelineDiagram(
  name: string,
  stages: string[],
  dependencies: Array<{ from: number; to: number }> = []
): GeneratedDiagram {
  const stageNodes = stages.map((stage, i) => `    S${i}["${stage}"]`).join('\n')
  
  const connections = stages.slice(1).map((_, i) => `    S${i} --> S${i + 1}`).join('\n')
  
  const extraConnections = dependencies.map(d => `    S${d.from} -.-> S${d.to}`).join('\n')

  return {
    type: 'pipeline',
    title: `${name} Pipeline`,
    mermaidCode: `
graph LR
${stageNodes}

    ${connections}
${extraConnections ? '\n' + extraConnections : ''}
    
    style S0 fill:#4CAF50,color:#fff
    style S${stages.length - 1} fill:#2196F3,color:#fff
`,
    description: `Data pipeline flow for ${name}`,
    interactive: true,
    exportFormats: ['svg', 'png', 'pdf'],
  }
}

/**
 * Generate an ER diagram from schema
 */
export function generateERDiagram(
  tables: Array<{
    name: string
    columns: Array<{ name: string; type: string; pk?: boolean; fk?: string }>
  }>
): GeneratedDiagram {
  const tableDefinitions = tables.map(table => {
    const columns = table.columns.map(col => {
      const pk = col.pk ? ' PK' : ''
      const fk = col.fk ? ` FK → ${col.fk}` : ''
      return `        ${col.name} ${col.type}${pk}${fk}`
    }).join('\n')
    return `    ${table.name} {\n${columns}\n    }`
  }).join('\n\n')

  const relationships = tables.flatMap(table =>
    table.columns
      .filter(col => col.fk)
      .map(col => `    ${table.name} ||--o{ ${col.fk!.split('.')[0]} : references`)
  ).join('\n')

  return {
    type: 'er_diagram',
    title: 'Data Model',
    mermaidCode: `erDiagram
${tableDefinitions}

${relationships}`,
    description: 'Entity-Relationship diagram of the data model',
    interactive: true,
    exportFormats: ['svg', 'png', 'pdf'],
  }
}

/**
 * Generate a sequence diagram
 */
export function generateSequenceDiagram(
  title: string,
  actors: string[],
  interactions: Array<{ from: string; to: string; action: string; type?: 'sync' | 'async' }>
): GeneratedDiagram {
  const actorDefinitions = actors.map(a => `    participant ${a}`).join('\n')
  
  const sequence = interactions.map(i => {
    const arrow = i.type === 'async' ? '-)>>>' : '->>'
    return `    ${i.from}${arrow}${i.to}: ${i.action}`
  }).join('\n')

  return {
    type: 'sequence',
    title,
    mermaidCode: `sequenceDiagram
${actorDefinitions}

${sequence}`,
    description: `Sequence diagram for ${title}`,
    interactive: true,
    exportFormats: ['svg', 'png', 'pdf'],
  }
}

/**
 * Generate a deployment diagram
 */
export function generateDeploymentDiagram(
  services: Array<{
    name: string
    type: 'compute' | 'storage' | 'network' | 'database'
    connections: string[]
  }>
): GeneratedDiagram {
  const serviceNodes = services.map(s => {
    const icon = {
      compute: '🖥️',
      storage: '💾',
      network: '🌐',
      database: '🗄️',
    }[s.type]
    return `    ${s.name}["${icon} ${s.name}"]`
  }).join('\n')

  const connections = services.flatMap(s =>
    s.connections.map(c => `    ${s.name} --> ${c}`)
  ).join('\n')

  return {
    type: 'deployment',
    title: 'Infrastructure Deployment',
    mermaidCode: `graph TB
${serviceNodes}

${connections}`,
    description: 'Infrastructure deployment diagram',
    interactive: true,
    exportFormats: ['svg', 'png', 'pdf'],
  }
}

/**
 * Get diagram by style
 */
export function getArchitectureDiagram(style: ArchitectureStyle): GeneratedDiagram {
  return ARCHITECTURE_TEMPLATES[style]
}

/**
 * Get all available architecture styles
 */
export function getAvailableStyles(): Array<{ style: ArchitectureStyle; name: string; description: string }> {
  return [
    { style: 'lakehouse', name: 'Data Lakehouse', description: 'Modern unified data platform' },
    { style: 'data_mesh', name: 'Data Mesh', description: 'Domain-oriented decentralized architecture' },
    { style: 'lambda', name: 'Lambda', description: 'Batch + Speed hybrid architecture' },
    { style: 'kappa', name: 'Kappa', description: 'Stream-first architecture' },
    { style: 'traditional', name: 'Traditional DW', description: 'Classic data warehouse' },
  ]
}

/**
 * Customize diagram with components
 */
export function customizeDiagram(
  baseStyle: ArchitectureStyle,
  customComponents: DiagramComponent[],
  customConnections: DiagramConnection[]
): GeneratedDiagram {
  const base = ARCHITECTURE_TEMPLATES[baseStyle]
  
  // Add custom components to mermaid code
  let customCode = base.mermaidCode
  
  if (customComponents.length > 0) {
    const componentNodes = customComponents.map(c => {
      const sub = c.subcomponents?.length ? `[${c.subcomponents.join(', ')}]` : ''
      return `    ${c.id}["${c.name}"]${sub}`
    }).join('\n')
    
    customCode = customCode.replace('```mermaid', '').replace('```', '')
    customCode = `graph TB
${customCode}

    subgraph Custom["Custom Components"]
${componentNodes}
    end
`
  }

  return {
    ...base,
    title: `Custom ${base.title}`,
    mermaidCode: customCode,
  }
}
