'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowRight, Database, Layers, GitBranch, AlertTriangle, 
  CheckCircle, Search, Download, Filter, ChevronRight, ChevronDown,
  Activity, Users, BarChart3, LayoutDashboard
} from 'lucide-react'

// Types
interface LineageNode {
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
  rowCount?: number
  columnCount?: number
}

interface LineageEdge {
  id: string
  sourceId: string
  targetId: string
  type: 'direct' | 'transformation' | 'aggregation' | 'join'
  transformation?: string
}

interface ImpactResult {
  nodeId: string
  nodeName: string
  totalImpact: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  estimatedEffort: string
  affectedNodes: AffectedItem[]
  affectedDashboards: AffectedItem[]
}

interface AffectedItem {
  node: LineageNode
  impactType: 'direct' | 'indirect'
  breakingChange: boolean
  description: string
}

// Sample data
const sampleNodes: LineageNode[] = [
  { id: 'source.postgres.users', name: 'users', type: 'source', layer: 'raw', schema: 'public', database: 'production', description: 'User accounts table', owner: 'Engineering', tags: ['pii', 'core'], qualityScore: 92, rowCount: 150000, columnCount: 25 },
  { id: 'source.postgres.orders', name: 'orders', type: 'source', layer: 'raw', schema: 'public', database: 'production', description: 'Customer orders', owner: 'Sales', tags: ['financial'], qualityScore: 88, rowCount: 500000, columnCount: 15 },
  { id: 'source.postgres.products', name: 'products', type: 'source', layer: 'raw', schema: 'public', database: 'production', description: 'Product catalog', owner: 'Product', tags: ['catalog'], qualityScore: 95, rowCount: 5000, columnCount: 20 },
  { id: 'stg.users', name: 'stg_users', type: 'staging', layer: 'staging', schema: 'staging', database: 'analytics', description: 'Cleaned user data', owner: 'Data Team', qualityScore: 90, rowCount: 149500, columnCount: 20 },
  { id: 'stg.orders', name: 'stg_orders', type: 'staging', layer: 'staging', schema: 'staging', database: 'analytics', description: 'Cleaned order data', owner: 'Data Team', qualityScore: 91, rowCount: 499000, columnCount: 12 },
  { id: 'stg.products', name: 'stg_products', type: 'staging', layer: 'staging', schema: 'staging', database: 'analytics', description: 'Cleaned product data', owner: 'Data Team', qualityScore: 94, rowCount: 4980, columnCount: 18 },
  { id: 'int.user_orders', name: 'int_user_orders', type: 'intermediate', layer: 'intermediate', schema: 'intermediate', database: 'analytics', description: 'User order history with aggregations', owner: 'Data Team', qualityScore: 93, rowCount: 100000, columnCount: 30 },
  { id: 'int.product_metrics', name: 'int_product_metrics', type: 'intermediate', layer: 'intermediate', schema: 'intermediate', database: 'analytics', description: 'Product performance metrics', owner: 'Data Team', qualityScore: 92, rowCount: 5000, columnCount: 25 },
  { id: 'mart.customer_360', name: 'dim_customer_360', type: 'mart', layer: 'marts', schema: 'marts', database: 'analytics', description: 'Customer 360 view with all metrics', owner: 'Analytics', tags: ['golden', 'certified'], qualityScore: 96, rowCount: 149000, columnCount: 50 },
  { id: 'mart.sales_summary', name: 'fct_sales_summary', type: 'mart', layer: 'marts', schema: 'marts', database: 'analytics', description: 'Daily sales summary fact table', owner: 'Analytics', tags: ['golden', 'certified'], qualityScore: 97, rowCount: 365, columnCount: 20 },
  { id: 'dashboard.exec', name: 'Executive Dashboard', type: 'dashboard', layer: 'reporting', description: 'C-level KPIs and metrics', owner: 'BI Team', qualityScore: 95 },
  { id: 'dashboard.sales', name: 'Sales Performance', type: 'dashboard', layer: 'reporting', description: 'Sales team performance tracking', owner: 'Sales Ops', qualityScore: 93 },
  { id: 'dashboard.product', name: 'Product Analytics', type: 'dashboard', layer: 'reporting', description: 'Product usage and metrics', owner: 'Product Team', qualityScore: 91 }
]

const sampleEdges: LineageEdge[] = [
  { id: 'e1', sourceId: 'source.postgres.users', targetId: 'stg.users', type: 'direct' },
  { id: 'e2', sourceId: 'source.postgres.orders', targetId: 'stg.orders', type: 'direct' },
  { id: 'e3', sourceId: 'source.postgres.products', targetId: 'stg.products', type: 'direct' },
  { id: 'e4', sourceId: 'stg.users', targetId: 'int.user_orders', type: 'join' },
  { id: 'e5', sourceId: 'stg.orders', targetId: 'int.user_orders', type: 'join' },
  { id: 'e6', sourceId: 'stg.products', targetId: 'int.product_metrics', type: 'direct' },
  { id: 'e7', sourceId: 'stg.orders', targetId: 'int.product_metrics', type: 'aggregation', transformation: 'SUM(quantity), COUNT(*)' },
  { id: 'e8', sourceId: 'int.user_orders', targetId: 'mart.customer_360', type: 'transformation' },
  { id: 'e9', sourceId: 'stg.users', targetId: 'mart.customer_360', type: 'join' },
  { id: 'e10', sourceId: 'int.product_metrics', targetId: 'mart.sales_summary', type: 'aggregation', transformation: 'Daily rollup' },
  { id: 'e11', sourceId: 'stg.orders', targetId: 'mart.sales_summary', type: 'aggregation', transformation: 'Daily totals' },
  { id: 'e12', sourceId: 'mart.customer_360', targetId: 'dashboard.exec', type: 'direct' },
  { id: 'e13', sourceId: 'mart.sales_summary', targetId: 'dashboard.exec', type: 'direct' },
  { id: 'e14', sourceId: 'mart.sales_summary', targetId: 'dashboard.sales', type: 'direct' },
  { id: 'e15', sourceId: 'mart.customer_360', targetId: 'dashboard.sales', type: 'direct' },
  { id: 'e16', sourceId: 'int.product_metrics', targetId: 'dashboard.product', type: 'direct' }
]

// Helper functions
const getLayerColor = (layer: string): string => {
  const colors: Record<string, string> = {
    raw: 'bg-red-100 border-red-300 text-red-800',
    staging: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    intermediate: 'bg-blue-100 border-blue-300 text-blue-800',
    marts: 'bg-green-100 border-green-300 text-green-800',
    reporting: 'bg-purple-100 border-purple-300 text-purple-800'
  }
  return colors[layer] || 'bg-gray-100 border-gray-300 text-gray-800'
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, typeof Database> = {
    source: Database,
    staging: Layers,
    intermediate: GitBranch,
    mart: BarChart3,
    dashboard: LayoutDashboard,
    report: Activity
  }
  return icons[type] || Database
}

const getRiskColor = (risk: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300'
  }
  return colors[risk] || 'bg-gray-100 text-gray-800'
}

const getDownstreamNodes = (nodeId: string): string[] => {
  const downstream: string[] = []
  const visited = new Set<string>()
  
  const traverse = (id: string) => {
    if (visited.has(id)) return
    visited.add(id)
    
    sampleEdges
      .filter(e => e.sourceId === id)
      .forEach(e => {
        if (!visited.has(e.targetId)) {
          downstream.push(e.targetId)
          traverse(e.targetId)
        }
      })
  }
  
  traverse(nodeId)
  return downstream
}

const getUpstreamNodes = (nodeId: string): string[] => {
  const upstream: string[] = []
  const visited = new Set<string>()
  
  const traverse = (id: string) => {
    if (visited.has(id)) return
    visited.add(id)
    
    sampleEdges
      .filter(e => e.targetId === id)
      .forEach(e => {
        if (!visited.has(e.sourceId)) {
          upstream.push(e.sourceId)
          traverse(e.sourceId)
        }
      })
  }
  
  traverse(nodeId)
  return upstream
}

export default function LineagePage() {
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedLayers, setExpandedLayers] = useState<string[]>(['raw', 'staging', 'intermediate', 'marts', 'reporting'])
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactResult | null>(null)
  const [viewMode, setViewMode] = useState<'graph' | 'list' | 'impact'>('graph')

  // Filter nodes
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return sampleNodes
    return sampleNodes.filter(n => 
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Group nodes by layer
  const nodesByLayer = useMemo(() => {
    const grouped: Record<string, LineageNode[]> = {
      raw: [],
      staging: [],
      intermediate: [],
      marts: [],
      reporting: []
    }
    
    filteredNodes.forEach(node => {
      grouped[node.layer].push(node)
    })
    
    return grouped
  }, [filteredNodes])

  // Calculate impact analysis
  const calculateImpact = (node: LineageNode): ImpactResult => {
    const downstreamIds = getDownstreamNodes(node.id)
    const affectedNodes: AffectedItem[] = []
    const affectedDashboards: AffectedItem[] = []
    
    downstreamIds.forEach(id => {
      const targetNode = sampleNodes.find(n => n.id === id)
      if (targetNode) {
        const item: AffectedItem = {
          node: targetNode,
          impactType: downstreamIds.indexOf(id) < 3 ? 'direct' : 'indirect',
          breakingChange: targetNode.type === 'dashboard' || targetNode.layer === 'marts',
          description: `Impact sur ${targetNode.name}`
        }
        
        if (targetNode.type === 'dashboard') {
          affectedDashboards.push(item)
        } else {
          affectedNodes.push(item)
        }
      }
    })

    const totalImpact = downstreamIds.length
    const breakingChanges = [...affectedNodes, ...affectedDashboards].filter(n => n.breakingChange).length
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (breakingChanges > 5 || totalImpact > 20) riskLevel = 'critical'
    else if (breakingChanges > 2 || totalImpact > 10) riskLevel = 'high'
    else if (totalImpact > 5) riskLevel = 'medium'

    const recommendations: string[] = []
    if (riskLevel === 'critical') recommendations.push('Risque élevé: Planifier une migration progressive')
    if (breakingChanges > 0) recommendations.push('Notifier les équipes responsables des dashboards impactés')
    if (node.type === 'source') recommendations.push('Valider les changements avec l\'équipe source')
    recommendations.push('Exécuter les tests de qualité après modification')
    recommendations.push('Préparer un plan de rollback')

    const efforts: Record<string, string> = {
      low: '1-2 jours',
      medium: '3-5 jours',
      high: '1-2 semaines',
      critical: '2-4 semaines avec plan de migration'
    }

    return {
      nodeId: node.id,
      nodeName: node.name,
      totalImpact,
      riskLevel,
      recommendations,
      estimatedEffort: efforts[riskLevel],
      affectedNodes,
      affectedDashboards
    }
  }

  // Handle node selection
  const handleNodeClick = (node: LineageNode) => {
    setSelectedNode(node)
    setImpactAnalysis(calculateImpact(node))
  }

  // Toggle layer expansion
  const toggleLayer = (layer: string) => {
    setExpandedLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    )
  }

  // Statistics
  const stats = {
    totalNodes: sampleNodes.length,
    totalEdges: sampleEdges.length,
    avgQuality: Math.round(sampleNodes.reduce((acc, n) => acc + (n.qualityScore || 0), 0) / sampleNodes.length),
    layers: Object.keys(nodesByLayer).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Data Lineage</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Traçabilité complète et analyse d'impact de vos données
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalNodes}</p>
                  <p className="text-sm text-slate-600">Tables & Sources</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <GitBranch className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalEdges}</p>
                  <p className="text-sm text-slate-600">Dépendances</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgQuality}%</p>
                  <p className="text-sm text-slate-600">Qualité Moyenne</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Layers className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.layers}</p>
                  <p className="text-sm text-slate-600">Couches Data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Controls */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher une table, source ou dashboard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === 'graph' ? 'default' : 'outline'} onClick={() => setViewMode('graph')}>
              <GitBranch className="w-4 h-4 mr-2" />
              Graph
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>
              <Filter className="w-4 h-4 mr-2" />
              Liste
            </Button>
            <Button variant={viewMode === 'impact' ? 'default' : 'outline'} onClick={() => setViewMode('impact')}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Impact
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Lineage Graph/List */}
          <div className="col-span-2">
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Parcours des Données</CardTitle>
                <CardDescription>
                  Visualisez le flux de données de la source jusqu'aux rapports finaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                {viewMode === 'graph' && (
                  <div className="space-y-2">
                    {['raw', 'staging', 'intermediate', 'marts', 'reporting'].map(layer => (
                      <div key={layer} className="border rounded-lg overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-3 bg-slate-100 hover:bg-slate-200 transition-colors"
                          onClick={() => toggleLayer(layer)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedLayers.includes(layer) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <Badge className={getLayerColor(layer)}>
                              {layer === 'raw' ? 'Sources' : 
                               layer === 'staging' ? 'Staging' :
                               layer === 'intermediate' ? 'Intermediate' :
                               layer === 'marts' ? 'Marts' : 'Reporting'}
                            </Badge>
                            <span className="text-sm text-slate-600">
                              {nodesByLayer[layer].length} éléments
                            </span>
                          </div>
                        </button>
                        {expandedLayers.includes(layer) && (
                          <div className="p-3 grid grid-cols-2 gap-2">
                            {nodesByLayer[layer].map(node => {
                              const Icon = getTypeIcon(node.type)
                              const isSelected = selectedNode?.id === node.id
                              return (
                                <button
                                  key={node.id}
                                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                                    isSelected 
                                      ? 'border-blue-500 bg-blue-50' 
                                      : 'border-slate-200 hover:border-slate-300 bg-white'
                                  }`}
                                  onClick={() => handleNodeClick(node)}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Icon className="w-4 h-4 text-slate-600" />
                                    <span className="font-medium text-sm">{node.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${node.qualityScore || 0}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-slate-500">{node.qualityScore}%</span>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-2">
                    {filteredNodes.map(node => {
                      const Icon = getTypeIcon(node.type)
                      const downstreamCount = getDownstreamNodes(node.id).length
                      return (
                        <div
                          key={node.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                          onClick={() => handleNodeClick(node)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-slate-600" />
                            <div>
                              <p className="font-medium">{node.name}</p>
                              <p className="text-sm text-slate-500">{node.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getLayerColor(node.layer)}>{node.layer}</Badge>
                            <div className="text-right">
                              <p className="text-sm font-medium">{downstreamCount} dépendants</p>
                              <p className="text-xs text-slate-500">qualité: {node.qualityScore}%</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {viewMode === 'impact' && selectedNode && impactAnalysis && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                      <div>
                        <h3 className="font-semibold text-lg">{impactAnalysis.nodeName}</h3>
                        <p className="text-sm text-slate-600">Analyse d'impact de modification</p>
                      </div>
                      <Badge className={`text-lg px-4 py-2 ${getRiskColor(impactAnalysis.riskLevel)}`}>
                        Risque {impactAnalysis.riskLevel.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-3xl font-bold text-blue-600">{impactAnalysis.totalImpact}</p>
                          <p className="text-sm text-slate-600">Éléments Impactés</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-3xl font-bold text-purple-600">{impactAnalysis.affectedNodes.length}</p>
                          <p className="text-sm text-slate-600">Tables/Modèles</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-3xl font-bold text-orange-600">{impactAnalysis.affectedDashboards.length}</p>
                          <p className="text-sm text-slate-600">Dashboards</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Effort estimé: {impactAnalysis.estimatedEffort}</h4>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommandations</h4>
                      <ul className="space-y-1">
                        {impactAnalysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Node Details */}
          <div>
            {selectedNode ? (
              <Card className="bg-white/80 backdrop-blur sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = getTypeIcon(selectedNode.type)
                      return <Icon className="w-5 h-5" />
                    })()}
                    {selectedNode.name}
                  </CardTitle>
                  <CardDescription>{selectedNode.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Qualité</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                          style={{ width: `${selectedNode.qualityScore || 0}%` }}
                        />
                      </div>
                      <span className="font-semibold">{selectedNode.qualityScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Type</span>
                      <Badge className={`ml-2 ${getLayerColor(selectedNode.layer)}`}>
                        {selectedNode.type}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-slate-500">Couche</span>
                      <span className="ml-2 font-medium">{selectedNode.layer}</span>
                    </div>
                    {selectedNode.database && (
                      <div>
                        <span className="text-slate-500">Database</span>
                        <span className="ml-2 font-medium">{selectedNode.database}</span>
                      </div>
                    )}
                    {selectedNode.schema && (
                      <div>
                        <span className="text-slate-500">Schema</span>
                        <span className="ml-2 font-medium">{selectedNode.schema}</span>
                      </div>
                    )}
                    {selectedNode.rowCount && (
                      <div>
                        <span className="text-slate-500">Lignes</span>
                        <span className="ml-2 font-medium">{selectedNode.rowCount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedNode.columnCount && (
                      <div>
                        <span className="text-slate-500">Colonnes</span>
                        <span className="ml-2 font-medium">{selectedNode.columnCount}</span>
                      </div>
                    )}
                    {selectedNode.owner && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Propriétaire</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3" />
                          <span className="font-medium">{selectedNode.owner}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedNode.tags && selectedNode.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedNode.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Dépendances</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-blue-50 rounded text-center">
                        <p className="text-lg font-bold text-blue-600">
                          {getUpstreamNodes(selectedNode.id).length}
                        </p>
                        <p className="text-xs text-blue-600">En amont</p>
                      </div>
                      <div className="p-2 bg-purple-50 rounded text-center">
                        <p className="text-lg font-bold text-purple-600">
                          {getDownstreamNodes(selectedNode.id).length}
                        </p>
                        <p className="text-xs text-purple-600">En aval</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => setViewMode('impact')}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Analyser l'Impact
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-medium text-slate-600">Sélectionnez un élément</h3>
                  <p className="text-sm text-slate-400">
                    Cliquez sur une table ou un dashboard pour voir ses détails et analyser son impact
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
