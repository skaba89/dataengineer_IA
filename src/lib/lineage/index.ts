/**
 * Data Lineage & Impact Analysis Engine
 * DataSphere Innovation - Phase 2 Feature
 * 
 * This module provides comprehensive data lineage tracking and impact analysis
 * for enterprise data governance and compliance.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LineageNode {
  id: string
  name: string
  type: 'source' | 'staging' | 'intermediate' | 'mart' | 'dashboard' | 'report'
  layer: 'raw' | 'staging' | 'intermediate' | 'marts' | 'reporting'
  schema?: string
  database?: string
  description?: string
  owner?: string
  tags?: string[]
  qualityScore?: number
  lastUpdated?: Date
  rowCount?: number
  columnCount?: number
  metadata: Record<string, unknown>
}

export interface LineageEdge {
  id: string
  sourceId: string
  targetId: string
  type: 'direct' | 'transformation' | 'aggregation' | 'join'
  transformation?: string
  columnMappings?: ColumnMapping[]
  metadata: Record<string, unknown>
}

export interface ColumnMapping {
  sourceColumn: string
  targetColumn: string
  transformation?: string
  dataType?: string
}

export interface LineageGraph {
  nodes: Map<string, LineageNode>
  edges: Map<string, LineageEdge>
  adjacencyList: Map<string, Set<string>> // Forward dependencies
  reverseAdjacencyList: Map<string, Set<string>> // Reverse dependencies (impact)
}

export interface ImpactAnalysisResult {
  nodeId: string
  nodeName: string
  affectedNodes: AffectedNode[]
  affectedDashboards: AffectedNode[]
  affectedReports: AffectedNode[]
  totalImpact: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  estimatedEffort: string
}

export interface AffectedNode {
  node: LineageNode
  impactPath: string[]
  impactType: 'direct' | 'indirect'
  breakingChange: boolean
  description: string
}

export interface ColumnLineage {
  columnName: string
  nodeId: string
  upstreamColumns: ColumnLineage[]
  downstreamColumns: ColumnLineage[]
  transformation?: string
}

export interface LineageFilter {
  nodeTypes?: LineageNode['type'][]
  layers?: LineageNode['layer'][]
  owners?: string[]
  tags?: string[]
  dateRange?: { start: Date; end: Date }
  searchQuery?: string
}

export interface LineageExportOptions {
  format: 'json' | 'csv' | 'svg' | 'png' | 'pdf'
  includeMetadata: boolean
  includeQuality: boolean
  depth: number
}

// ============================================================================
// Lineage Engine
// ============================================================================

export class DataLineageEngine {
  private graph: LineageGraph
  private columnLineage: Map<string, ColumnLineage>

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      adjacencyList: new Map(),
      reverseAdjacencyList: new Map()
    }
    this.columnLineage = new Map()
  }

  // ============================================================================
  // Node Management
  // ============================================================================

  addNode(node: LineageNode): void {
    this.graph.nodes.set(node.id, node)
    if (!this.graph.adjacencyList.has(node.id)) {
      this.graph.adjacencyList.set(node.id, new Set())
    }
    if (!this.graph.reverseAdjacencyList.has(node.id)) {
      this.graph.reverseAdjacencyList.set(node.id, new Set())
    }
  }

  getNode(id: string): LineageNode | undefined {
    return this.graph.nodes.get(id)
  }

  updateNode(id: string, updates: Partial<LineageNode>): LineageNode | undefined {
    const node = this.graph.nodes.get(id)
    if (node) {
      const updated = { ...node, ...updates }
      this.graph.nodes.set(id, updated)
      return updated
    }
    return undefined
  }

  removeNode(id: string): boolean {
    if (!this.graph.nodes.has(id)) return false

    // Remove all edges connected to this node
    const edgesToRemove: string[] = []
    this.graph.edges.forEach((edge, edgeId) => {
      if (edge.sourceId === id || edge.targetId === id) {
        edgesToRemove.push(edgeId)
      }
    })
    edgesToRemove.forEach(edgeId => this.removeEdge(edgeId))

    // Remove from adjacency lists
    this.graph.adjacencyList.delete(id)
    this.graph.reverseAdjacencyList.delete(id)
    
    // Remove from other adjacency lists
    this.graph.adjacencyList.forEach(neighbors => neighbors.delete(id))
    this.graph.reverseAdjacencyList.forEach(neighbors => neighbors.delete(id))

    // Remove node
    this.graph.nodes.delete(id)
    return true
  }

  // ============================================================================
  // Edge Management
  // ============================================================================

  addEdge(edge: LineageEdge): void {
    this.graph.edges.set(edge.id, edge)
    
    // Update forward adjacency (source -> target)
    const forwardNeighbors = this.graph.adjacencyList.get(edge.sourceId) || new Set()
    forwardNeighbors.add(edge.targetId)
    this.graph.adjacencyList.set(edge.sourceId, forwardNeighbors)
    
    // Update reverse adjacency (target -> source) for impact analysis
    const reverseNeighbors = this.graph.reverseAdjacencyList.get(edge.targetId) || new Set()
    reverseNeighbors.add(edge.sourceId)
    this.graph.reverseAdjacencyList.set(edge.targetId, reverseNeighbors)
  }

  removeEdge(id: string): boolean {
    const edge = this.graph.edges.get(id)
    if (!edge) return false

    // Remove from adjacency lists
    this.graph.adjacencyList.get(edge.sourceId)?.delete(edge.targetId)
    this.graph.reverseAdjacencyList.get(edge.targetId)?.delete(edge.sourceId)

    this.graph.edges.delete(id)
    return true
  }

  // ============================================================================
  // Lineage Queries
  // ============================================================================

  /**
   * Get upstream lineage (all nodes that flow into this node)
   */
  getUpstreamLineage(nodeId: string, maxDepth: number = 10): LineageNode[] {
    const visited = new Set<string>()
    const result: LineageNode[] = []
    
    this.traverseUpstream(nodeId, visited, result, 0, maxDepth)
    return result
  }

  private traverseUpstream(
    nodeId: string,
    visited: Set<string>,
    result: LineageNode[],
    currentDepth: number,
    maxDepth: number
  ): void {
    if (currentDepth >= maxDepth || visited.has(nodeId)) return
    
    visited.add(nodeId)
    
    const upstreamNodes = this.graph.reverseAdjacencyList.get(nodeId)
    if (upstreamNodes) {
      upstreamNodes.forEach(upstreamId => {
        const node = this.graph.nodes.get(upstreamId)
        if (node) {
          result.push(node)
          this.traverseUpstream(upstreamId, visited, result, currentDepth + 1, maxDepth)
        }
      })
    }
  }

  /**
   * Get downstream lineage (all nodes that depend on this node)
   */
  getDownstreamLineage(nodeId: string, maxDepth: number = 10): LineageNode[] {
    const visited = new Set<string>()
    const result: LineageNode[] = []
    
    this.traverseDownstream(nodeId, visited, result, 0, maxDepth)
    return result
  }

  private traverseDownstream(
    nodeId: string,
    visited: Set<string>,
    result: LineageNode[],
    currentDepth: number,
    maxDepth: number
  ): void {
    if (currentDepth >= maxDepth || visited.has(nodeId)) return
    
    visited.add(nodeId)
    
    const downstreamNodes = this.graph.adjacencyList.get(nodeId)
    if (downstreamNodes) {
      downstreamNodes.forEach(downstreamId => {
        const node = this.graph.nodes.get(downstreamId)
        if (node) {
          result.push(node)
          this.traverseDownstream(downstreamId, visited, result, currentDepth + 1, maxDepth)
        }
      })
    }
  }

  /**
   * Get full lineage graph for a node (both upstream and downstream)
   */
  getFullLineage(nodeId: string, depth: number = 5): {
    nodes: LineageNode[]
    edges: LineageEdge[]
    center: LineageNode
  } {
    const upstream = this.getUpstreamLineage(nodeId, depth)
    const downstream = this.getDownstreamLineage(nodeId, depth)
    const center = this.graph.nodes.get(nodeId)
    
    const allNodes = [...upstream, ...downstream]
    if (center) allNodes.push(center)
    
    // Get edges between these nodes
    const nodeIds = new Set(allNodes.map(n => n.id))
    const relevantEdges: LineageEdge[] = []
    
    this.graph.edges.forEach(edge => {
      if (nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId)) {
        relevantEdges.push(edge)
      }
    })

    return {
      nodes: allNodes,
      edges: relevantEdges,
      center: center!
    }
  }

  // ============================================================================
  // Impact Analysis
  // ============================================================================

  /**
   * Analyze the impact of changing a node
   */
  analyzeImpact(nodeId: string): ImpactAnalysisResult {
    const node = this.graph.nodes.get(nodeId)
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`)
    }

    const downstreamNodes = this.getDownstreamLineage(nodeId, 20)
    const affectedNodes: AffectedNode[] = []
    const affectedDashboards: AffectedNode[] = []
    const affectedReports: AffectedNode[] = []

    downstreamNodes.forEach(downstreamNode => {
      const impactPath = this.findPath(nodeId, downstreamNode.id)
      const affectedNode: AffectedNode = {
        node: downstreamNode,
        impactPath,
        impactType: impactPath.length <= 2 ? 'direct' : 'indirect',
        breakingChange: this.isBreakingChange(node, downstreamNode),
        description: this.generateImpactDescription(node, downstreamNode)
      }

      if (downstreamNode.type === 'dashboard') {
        affectedDashboards.push(affectedNode)
      } else if (downstreamNode.type === 'report') {
        affectedReports.push(affectedNode)
      } else {
        affectedNodes.push(affectedNode)
      }
    })

    const totalImpact = downstreamNodes.length + affectedDashboards.length + affectedReports.length
    const riskLevel = this.calculateRiskLevel(totalImpact, affectedNodes.filter(n => n.breakingChange).length)
    const recommendations = this.generateRecommendations(node, affectedNodes, riskLevel)
    const estimatedEffort = this.estimateEffort(totalImpact, riskLevel)

    return {
      nodeId,
      nodeName: node.name,
      affectedNodes,
      affectedDashboards,
      affectedReports,
      totalImpact,
      riskLevel,
      recommendations,
      estimatedEffort
    }
  }

  private findPath(startId: string, endId: string): string[] {
    const visited = new Set<string>()
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: startId, path: [startId] }]
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!
      
      if (nodeId === endId) return path
      
      if (visited.has(nodeId)) continue
      visited.add(nodeId)
      
      const neighbors = this.graph.adjacencyList.get(nodeId)
      if (neighbors) {
        neighbors.forEach(neighborId => {
          if (!visited.has(neighborId)) {
            queue.push({ nodeId: neighborId, path: [...path, neighborId] })
          }
        })
      }
    }
    
    return []
  }

  private isBreakingChange(source: LineageNode, target: LineageNode): boolean {
    // Simple heuristic: direct dependencies on marts or dashboards are more likely to break
    if (target.type === 'dashboard' || target.type === 'report') return true
    if (target.layer === 'marts') return true
    return false
  }

  private generateImpactDescription(source: LineageNode, target: LineageNode): string {
    const descriptions: Record<string, string> = {
      'staging': `La table ${target.name} devra \u00eatre mise \u00e0 jour pour refl\u00e9ter les changements de ${source.name}`,
      'intermediate': `Les transformations dans ${target.name} sont impact\u00e9es par les modifications de ${source.name}`,
      'marts': `Le mod\u00e8le m\u00e9tier ${target.name} n\u00e9cessite une r\u00e9vision suite aux changements de ${source.name}`,
      'reporting': `Les rapports bas\u00e9s sur ${target.name} pourront afficher des donn\u00e9es incorrectes`
    }
    return descriptions[target.layer] || `Impact sur ${target.name}`
  }

  private calculateRiskLevel(totalImpact: number, breakingChanges: number): 'low' | 'medium' | 'high' | 'critical' {
    if (breakingChanges > 5 || totalImpact > 20) return 'critical'
    if (breakingChanges > 2 || totalImpact > 10) return 'high'
    if (totalImpact > 5) return 'medium'
    return 'low'
  }

  private generateRecommendations(
    node: LineageNode,
    affectedNodes: AffectedNode[],
    riskLevel: string
  ): string[] {
    const recommendations: string[] = []

    if (riskLevel === 'critical') {
      recommendations.push('\u26a0\ufe0f Risque \u00e9lev\u00e9: Planifier une migration progressive plut\u00f4t qu\'un changement direct')
    }
    if (affectedNodes.some(n => n.breakingChange)) {
      recommendations.push('Notifier les \u00e9quipes responsables des dashboards et rapports impact\u00e9s')
    }
    if (node.type === 'source') {
      recommendations.push('Valider les changements avec l\'\u00e9quipe source avant mise en production')
    }
    recommendations.push('Ex\u00e9cuter les tests de qualit\u00e9 apr\u00e8s modification')
    recommendations.push('Pr\u00e9parer un plan de rollback en cas de probl\u00e8me')

    return recommendations
  }

  private estimateEffort(totalImpact: number, riskLevel: string): string {
    const efforts: Record<string, string> = {
      'low': '1-2 jours',
      'medium': '3-5 jours',
      'high': '1-2 semaines',
      'critical': '2-4 semaines avec plan de migration'
    }
    return efforts[riskLevel]
  }

  // ============================================================================
  // Column-Level Lineage
  // ============================================================================

  addColumnLineage(columnLineage: ColumnLineage): void {
    const key = `${columnLineage.nodeId}:${columnLineage.columnName}`
    this.columnLineage.set(key, columnLineage)
  }

  getColumnLineage(nodeId: string, columnName: string): ColumnLineage | undefined {
    return this.columnLineage.get(`${nodeId}:${columnName}`)
  }

  getColumnImpact(nodeId: string, columnName: string): {
    upstreamColumns: ColumnLineage[]
    downstreamColumns: ColumnLineage[]
  } {
    const column = this.getColumnLineage(nodeId, columnName)
    if (!column) {
      return { upstreamColumns: [], downstreamColumns: [] }
    }

    const upstreamColumns: ColumnLineage[] = []
    const downstreamColumns: ColumnLineage[] = []
    
    this.collectUpstreamColumns(column, upstreamColumns)
    this.collectDownstreamColumns(column, downstreamColumns)

    return { upstreamColumns, downstreamColumns }
  }

  private collectUpstreamColumns(column: ColumnLineage, result: ColumnLineage[]): void {
    column.upstreamColumns.forEach(upstream => {
      result.push(upstream)
      this.collectUpstreamColumns(upstream, result)
    })
  }

  private collectDownstreamColumns(column: ColumnLineage, result: ColumnLineage[]): void {
    column.downstreamColumns.forEach(downstream => {
      result.push(downstream)
      this.collectDownstreamColumns(downstream, result)
    })
  }

  // ============================================================================
  // Filtering & Search
  // ============================================================================

  filterNodes(filter: LineageFilter): LineageNode[] {
    let nodes = Array.from(this.graph.nodes.values())

    if (filter.nodeTypes?.length) {
      nodes = nodes.filter(n => filter.nodeTypes!.includes(n.type))
    }
    if (filter.layers?.length) {
      nodes = nodes.filter(n => filter.layers!.includes(n.layer))
    }
    if (filter.owners?.length) {
      nodes = nodes.filter(n => filter.owners!.includes(n.owner || ''))
    }
    if (filter.tags?.length) {
      nodes = nodes.filter(n => 
        n.tags?.some(tag => filter.tags!.includes(tag))
      )
    }
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      nodes = nodes.filter(n =>
        n.name.toLowerCase().includes(query) ||
        n.description?.toLowerCase().includes(query)
      )
    }
    if (filter.dateRange) {
      nodes = nodes.filter(n => {
        if (!n.lastUpdated) return false
        return n.lastUpdated >= filter.dateRange!.start &&
               n.lastUpdated <= filter.dateRange!.end
      })
    }

    return nodes
  }

  // ============================================================================
  // Export
  // ============================================================================

  exportGraph(options: LineageExportOptions): string | Buffer {
    const data = {
      nodes: Array.from(this.graph.nodes.values()),
      edges: Array.from(this.graph.edges.values()),
      metadata: {
        exportedAt: new Date().toISOString(),
        nodeCount: this.graph.nodes.size,
        edgeCount: this.graph.edges.size
      }
    }

    switch (options.format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.exportCsv(data)
      default:
        return JSON.stringify(data, null, 2)
    }
  }

  private exportCsv(data: { nodes: LineageNode[]; edges: LineageEdge[] }): string {
    const nodesHeader = 'id,name,type,layer,schema,database,owner,qualityScore\n'
    const nodesRows = data.nodes.map(n =>
      `${n.id},${n.name},${n.type},${n.layer},${n.schema || ''},${n.database || ''},${n.owner || ''},${n.qualityScore || ''}`
    ).join('\n')

    const edgesHeader = '\n\nid,sourceId,targetId,type,transformation\n'
    const edgesRows = data.edges.map(e =>
      `${e.id},${e.sourceId},${e.targetId},${e.type},${e.transformation || ''}`
    ).join('\n')

    return nodesHeader + nodesRows + edgesHeader + edgesRows
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  getStatistics(): {
    totalNodes: number
    totalEdges: number
    nodesByType: Record<string, number>
    nodesByLayer: Record<string, number>
    averageDownstreamDepth: number
    mostConnectedNodes: { node: LineageNode; downstreamCount: number }[]
  } {
    const nodesByType: Record<string, number> = {}
    const nodesByLayer: Record<string, number> = {}
    
    this.graph.nodes.forEach(node => {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1
      nodesByLayer[node.layer] = (nodesByLayer[node.layer] || 0) + 1
    })

    // Calculate downstream depths
    const depths: number[] = []
    this.graph.nodes.forEach((_, nodeId) => {
      depths.push(this.getDownstreamLineage(nodeId, 50).length)
    })

    // Find most connected nodes
    const connections: { node: LineageNode; downstreamCount: number }[] = []
    this.graph.nodes.forEach((node, nodeId) => {
      const downstream = this.graph.adjacencyList.get(nodeId)?.size || 0
      connections.push({ node, downstreamCount: downstream })
    })
    connections.sort((a, b) => b.downstreamCount - a.downstreamCount)

    return {
      totalNodes: this.graph.nodes.size,
      totalEdges: this.graph.edges.size,
      nodesByType,
      nodesByLayer,
      averageDownstreamDepth: depths.length > 0 
        ? depths.reduce((a, b) => a + b, 0) / depths.length 
        : 0,
      mostConnectedNodes: connections.slice(0, 10)
    }
  }
}

// ============================================================================
// Dbt Lineage Parser
// ============================================================================

export class DbtLineageParser {
  /**
   * Parse dbt manifest.json to extract lineage
   */
  static parseManifest(manifest: Record<string, unknown>): {
    nodes: LineageNode[]
    edges: LineageEdge[]
  } {
    const nodes: LineageNode[] = []
    const edges: LineageEdge[] = []
    
    const sources = manifest.sources as Record<string, Record<string, unknown>> || {}
    const models = manifest.nodes as Record<string, Record<string, unknown>> || {}
    const exposures = manifest.exposures as Record<string, Record<string, unknown>> || {}

    // Parse sources
    Object.entries(sources).forEach(([uniqueId, source]) => {
      nodes.push({
        id: uniqueId,
        name: (source.name as string) || uniqueId.split('.').pop() || uniqueId,
        type: 'source',
        layer: 'raw',
        schema: source.schema as string,
        database: source.database as string,
        description: source.description as string,
        owner: (source.meta as Record<string, unknown>)?.owner as string,
        tags: source.tags as string[],
        metadata: source
      })
    })

    // Parse models
    Object.entries(models).forEach(([uniqueId, model]) => {
      if (!uniqueId.startsWith('model.')) return
      
      const resourceType = model.resource_type as string
      const config = model.config as Record<string, unknown> || {}
      
      let layer: LineageNode['layer'] = 'intermediate'
      if (config.materialized === 'incremental' || (model.path as string)?.includes('staging')) {
        layer = 'staging'
      } else if ((model.path as string)?.includes('marts') || (model.path as string)?.includes('mart')) {
        layer = 'marts'
      }

      nodes.push({
        id: uniqueId,
        name: (model.name as string) || uniqueId.split('.').pop() || uniqueId,
        type: resourceType === 'snapshot' ? 'staging' : 
              layer === 'marts' ? 'mart' : 'intermediate',
        layer,
        schema: model.schema as string,
        database: model.database as string,
        description: model.description as string,
        owner: (model.meta as Record<string, unknown>)?.owner as string,
        tags: model.tags as string[],
        qualityScore: this.calculateModelQualityScore(model),
        metadata: model
      })

      // Create edges from depends_on
      const dependsOn = model.depends_on as { nodes?: string[] } | undefined
      if (dependsOn?.nodes) {
        dependsOn.nodes.forEach((depId: string, index: number) => {
          edges.push({
            id: `${depId}-${uniqueId}`,
            sourceId: depId,
            targetId: uniqueId,
            type: 'transformation',
            metadata: { order: index }
          })
        })
      }
    })

    // Parse exposures (dashboards/reports)
    Object.entries(exposures).forEach(([uniqueId, exposure]) => {
      nodes.push({
        id: uniqueId,
        name: (exposure.name as string) || uniqueId.split('.').pop() || uniqueId,
        type: exposure.type === 'dashboard' ? 'dashboard' : 'report',
        layer: 'reporting',
        description: exposure.description as string,
        owner: exposure.owner as string,
        metadata: exposure
      })

      // Create edges from depends_on
      const dependsOn = exposure.depends_on as { nodes?: string[] } | undefined
      if (dependsOn?.nodes) {
        dependsOn.nodes.forEach((depId: string) => {
          edges.push({
            id: `${depId}-${uniqueId}`,
            sourceId: depId,
            targetId: uniqueId,
            type: 'direct',
            metadata: {}
          })
        })
      }
    })

    return { nodes, edges }
  }

  private static calculateModelQualityScore(model: Record<string, unknown>): number {
    let score = 75 // Base score
    
    // Add points for tests
    const tests = (model.tests as unknown[]) || []
    score += Math.min(tests.length * 2, 15)
    
    // Add points for documentation
    if (model.description) score += 5
    const columns = (model.columns as Record<string, unknown>) || {}
    const documentedColumns = Object.values(columns).filter(
      (c: unknown) => (c as Record<string, unknown>)?.description
    ).length
    score += Math.min(documentedColumns, 5)
    
    return Math.min(score, 100)
  }
}

// ============================================================================
// Sample Data Generator
// ============================================================================

export function generateSampleLineageData(): DataLineageEngine {
  const engine = new DataLineageEngine()

  // Add sources
  engine.addNode({
    id: 'source.postgres.users',
    name: 'users',
    type: 'source',
    layer: 'raw',
    schema: 'public',
    database: 'production',
    description: 'User accounts table',
    owner: 'Engineering',
    tags: ['pii', 'core'],
    qualityScore: 92,
    rowCount: 150000,
    columnCount: 25,
    metadata: {}
  })

  engine.addNode({
    id: 'source.postgres.orders',
    name: 'orders',
    type: 'source',
    layer: 'raw',
    schema: 'public',
    database: 'production',
    description: 'Customer orders',
    owner: 'Sales',
    tags: ['financial'],
    qualityScore: 88,
    rowCount: 500000,
    columnCount: 15,
    metadata: {}
  })

  engine.addNode({
    id: 'source.postgres.products',
    name: 'products',
    type: 'source',
    layer: 'raw',
    schema: 'public',
    database: 'production',
    description: 'Product catalog',
    owner: 'Product',
    tags: ['catalog'],
    qualityScore: 95,
    rowCount: 5000,
    columnCount: 20,
    metadata: {}
  })

  // Add staging tables
  engine.addNode({
    id: 'stg.users',
    name: 'stg_users',
    type: 'staging',
    layer: 'staging',
    schema: 'staging',
    database: 'analytics',
    description: 'Cleaned user data',
    owner: 'Data Team',
    qualityScore: 90,
    rowCount: 149500,
    columnCount: 20,
    metadata: {}
  })

  engine.addNode({
    id: 'stg.orders',
    name: 'stg_orders',
    type: 'staging',
    layer: 'staging',
    schema: 'staging',
    database: 'analytics',
    description: 'Cleaned order data',
    owner: 'Data Team',
    qualityScore: 91,
    rowCount: 499000,
    columnCount: 12,
    metadata: {}
  })

  engine.addNode({
    id: 'stg.products',
    name: 'stg_products',
    type: 'staging',
    layer: 'staging',
    schema: 'staging',
    database: 'analytics',
    description: 'Cleaned product data',
    owner: 'Data Team',
    qualityScore: 94,
    rowCount: 4980,
    columnCount: 18,
    metadata: {}
  })

  // Add intermediate tables
  engine.addNode({
    id: 'int.user_orders',
    name: 'int_user_orders',
    type: 'intermediate',
    layer: 'intermediate',
    schema: 'intermediate',
    database: 'analytics',
    description: 'User order history with aggregations',
    owner: 'Data Team',
    qualityScore: 93,
    rowCount: 100000,
    columnCount: 30,
    metadata: {}
  })

  engine.addNode({
    id: 'int.product_metrics',
    name: 'int_product_metrics',
    type: 'intermediate',
    layer: 'intermediate',
    schema: 'intermediate',
    database: 'analytics',
    description: 'Product performance metrics',
    owner: 'Data Team',
    qualityScore: 92,
    rowCount: 5000,
    columnCount: 25,
    metadata: {}
  })

  // Add mart tables
  engine.addNode({
    id: 'mart.customer_360',
    name: 'dim_customer_360',
    type: 'mart',
    layer: 'marts',
    schema: 'marts',
    database: 'analytics',
    description: 'Customer 360 view with all metrics',
    owner: 'Analytics',
    tags: ['golden', 'certified'],
    qualityScore: 96,
    rowCount: 149000,
    columnCount: 50,
    metadata: {}
  })

  engine.addNode({
    id: 'mart.sales_summary',
    name: 'fct_sales_summary',
    type: 'mart',
    layer: 'marts',
    schema: 'marts',
    database: 'analytics',
    description: 'Daily sales summary fact table',
    owner: 'Analytics',
    tags: ['golden', 'certified'],
    qualityScore: 97,
    rowCount: 365,
    columnCount: 20,
    metadata: {}
  })

  // Add dashboards
  engine.addNode({
    id: 'dashboard.exec',
    name: 'Executive Dashboard',
    type: 'dashboard',
    layer: 'reporting',
    description: 'C-level KPIs and metrics',
    owner: 'BI Team',
    qualityScore: 95,
    metadata: {}
  })

  engine.addNode({
    id: 'dashboard.sales',
    name: 'Sales Performance Dashboard',
    type: 'dashboard',
    layer: 'reporting',
    description: 'Sales team performance tracking',
    owner: 'Sales Ops',
    qualityScore: 93,
    metadata: {}
  })

  engine.addNode({
    id: 'dashboard.product',
    name: 'Product Analytics Dashboard',
    type: 'dashboard',
    layer: 'reporting',
    description: 'Product usage and metrics',
    owner: 'Product Team',
    qualityScore: 91,
    metadata: {}
  })

  // Add edges (lineage relationships)
  // Source -> Staging
  engine.addEdge({
    id: 'e1',
    sourceId: 'source.postgres.users',
    targetId: 'stg.users',
    type: 'direct',
    metadata: {}
  })

  engine.addEdge({
    id: 'e2',
    sourceId: 'source.postgres.orders',
    targetId: 'stg.orders',
    type: 'direct',
    metadata: {}
  })

  engine.addEdge({
    id: 'e3',
    sourceId: 'source.postgres.products',
    targetId: 'stg.products',
    type: 'direct',
    metadata: {}
  })

  // Staging -> Intermediate
  engine.addEdge({
    id: 'e4',
    sourceId: 'stg.users',
    targetId: 'int.user_orders',
    type: 'join',
    metadata: { joinType: 'left' }
  })

  engine.addEdge({
    id: 'e5',
    sourceId: 'stg.orders',
    targetId: 'int.user_orders',
    type: 'join',
    metadata: { joinType: 'inner' }
  })

  engine.addEdge({
    id: 'e6',
    sourceId: 'stg.products',
    targetId: 'int.product_metrics',
    type: 'direct',
    metadata: {}
  })

  engine.addEdge({
    id: 'e7',
    sourceId: 'stg.orders',
    targetId: 'int.product_metrics',
    type: 'aggregation',
    transformation: 'SUM(quantity), COUNT(DISTINCT order_id)',
    metadata: {}
  })

  // Intermediate -> Marts
  engine.addEdge({
    id: 'e8',
    sourceId: 'int.user_orders',
    targetId: 'mart.customer_360',
    type: 'transformation',
    transformation: 'Window functions, aggregations',
    metadata: {}
  })

  engine.addEdge({
    id: 'e9',
    sourceId: 'stg.users',
    targetId: 'mart.customer_360',
    type: 'join',
    metadata: {}
  })

  engine.addEdge({
    id: 'e10',
    sourceId: 'int.product_metrics',
    targetId: 'mart.sales_summary',
    type: 'aggregation',
    transformation: 'Daily rollup',
    metadata: {}
  })

  engine.addEdge({
    id: 'e11',
    sourceId: 'stg.orders',
    targetId: 'mart.sales_summary',
    type: 'aggregation',
    transformation: 'Daily totals',
    metadata: {}
  })

  // Marts -> Dashboards
  engine.addEdge({
    id: 'e12',
    sourceId: 'mart.customer_360',
    targetId: 'dashboard.exec',
    type: 'direct',
    metadata: {}
  })

  engine.addEdge({
    id: 'e13',
    sourceId: 'mart.sales_summary',
    targetId: 'dashboard.exec',
    type: 'direct',
    metadata: {}
  })

  engine.addEdge({
    id: 'e14',
    sourceId: 'mart.sales_summary',
    targetId: 'dashboard.sales',
    type: 'direct',
    metadata: {}
  })

  engine.addEdge({
    id: 'e15',
    sourceId: 'mart.customer_360',
    targetId: 'dashboard.sales',
    type: 'direct',
    metadata: {}
  })

  engine.addEdge({
    id: 'e16',
    sourceId: 'int.product_metrics',
    targetId: 'dashboard.product',
    type: 'direct',
    metadata: {}
  })

  return engine
}

// Export singleton instance with sample data
export const lineageEngine = generateSampleLineageData()
