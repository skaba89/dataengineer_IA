"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Database, ArrowRight, GitBranch, Zap, Clock, Filter, Merge, Code,
  Play, Save, Download, Upload, Undo, Redo, Trash2, Settings, Plus,
  GripVertical, X, Check, AlertCircle, Loader2, ChevronDown, Search,
  Table2, FileJson, Cloud, Server
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Node types for the pipeline builder
type NodeType = 'source' | 'transform' | 'join' | 'filter' | 'aggregate' | 'destination' | 'schedule'

interface PipelineNode {
  id: string
  type: NodeType
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
  connections: { source: string; target: string }[]
}

interface NodeTemplate {
  type: NodeType
  name: string
  icon: React.ReactNode
  category: string
  description: string
  defaultConfig: Record<string, any>
}

const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: 'source',
    name: 'PostgreSQL',
    icon: <Database className="w-5 h-5" />,
    category: 'Sources',
    description: 'Connect to PostgreSQL database',
    defaultConfig: { host: '', port: 5432, database: '', schema: 'public', table: '' }
  },
  {
    type: 'source',
    name: 'MySQL',
    icon: <Database className="w-5 h-5" />,
    category: 'Sources',
    description: 'Connect to MySQL database',
    defaultConfig: { host: '', port: 3306, database: '', table: '' }
  },
  {
    type: 'source',
    name: 'Snowflake',
    icon: <Cloud className="w-5 h-5" />,
    category: 'Sources',
    description: 'Connect to Snowflake data warehouse',
    defaultConfig: { account: '', warehouse: '', database: '', schema: '', table: '' }
  },
  {
    type: 'source',
    name: 'REST API',
    icon: <Server className="w-5 h-5" />,
    category: 'Sources',
    description: 'Fetch data from REST API',
    defaultConfig: { url: '', method: 'GET', headers: {}, pagination: false }
  },
  {
    type: 'source',
    name: 'CSV File',
    icon: <FileJson className="w-5 h-5" />,
    category: 'Sources',
    description: 'Load data from CSV file',
    defaultConfig: { path: '', delimiter: ',', hasHeader: true }
  },
  {
    type: 'transform',
    name: 'SQL Transform',
    icon: <Code className="w-5 h-5" />,
    category: 'Transforms',
    description: 'Apply SQL transformation',
    defaultConfig: { sql: '', description: '' }
  },
  {
    type: 'transform',
    name: 'Python Transform',
    icon: <Code className="w-5 h-5" />,
    category: 'Transforms',
    description: 'Apply Python transformation',
    defaultConfig: { code: '', requirements: [] }
  },
  {
    type: 'join',
    name: 'Inner Join',
    icon: <Merge className="w-5 h-5" />,
    category: 'Joins',
    description: 'Join two datasets',
    defaultConfig: { joinType: 'inner', leftKey: '', rightKey: '' }
  },
  {
    type: 'join',
    name: 'Left Join',
    icon: <Merge className="w-5 h-5" />,
    category: 'Joins',
    description: 'Left join datasets',
    defaultConfig: { joinType: 'left', leftKey: '', rightKey: '' }
  },
  {
    type: 'filter',
    name: 'Filter',
    icon: <Filter className="w-5 h-5" />,
    category: 'Transforms',
    description: 'Filter rows based on condition',
    defaultConfig: { condition: '', description: '' }
  },
  {
    type: 'aggregate',
    name: 'Aggregate',
    icon: <GitBranch className="w-5 h-5" />,
    category: 'Transforms',
    description: 'Aggregate data by columns',
    defaultConfig: { groupBy: [], aggregations: [] }
  },
  {
    type: 'destination',
    name: 'BigQuery',
    icon: <Cloud className="w-5 h-5" />,
    category: 'Destinations',
    description: 'Write to BigQuery',
    defaultConfig: { project: '', dataset: '', table: '', writeDisposition: 'WRITE_TRUNCATE' }
  },
  {
    type: 'destination',
    name: 'PostgreSQL',
    icon: <Database className="w-5 h-5" />,
    category: 'Destinations',
    description: 'Write to PostgreSQL',
    defaultConfig: { host: '', port: 5432, database: '', schema: '', table: '' }
  },
  {
    type: 'destination',
    name: 'S3',
    icon: <Cloud className="w-5 h-5" />,
    category: 'Destinations',
    description: 'Write to S3 bucket',
    defaultConfig: { bucket: '', key: '', format: 'parquet' }
  },
  {
    type: 'schedule',
    name: 'Schedule',
    icon: <Clock className="w-5 h-5" />,
    category: 'Orchestration',
    description: 'Schedule pipeline execution',
    defaultConfig: { cron: '0 0 * * *', timezone: 'UTC' }
  }
]

const NODE_COLORS: Record<NodeType, string> = {
  source: 'bg-blue-500/10 border-blue-500/50',
  transform: 'bg-violet-500/10 border-violet-500/50',
  join: 'bg-emerald-500/10 border-emerald-500/50',
  filter: 'bg-amber-500/10 border-amber-500/50',
  aggregate: 'bg-pink-500/10 border-pink-500/50',
  destination: 'bg-cyan-500/10 border-cyan-500/50',
  schedule: 'bg-slate-500/10 border-slate-500/50'
}

export default function PipelineBuilder() {
  const router = useRouter()
  const { toast } = useToast()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<PipelineNode[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedTemplate, setDraggedTemplate] = useState<NodeTemplate | null>(null)
  const [connecting, setConnecting] = useState<{ from: string; to?: string } | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')

  // Get node template by name
  const getNodeTemplate = (name: string) => NODE_TEMPLATES.find(t => t.name === name)

  // Add node to canvas
  const addNode = useCallback((template: NodeTemplate, position?: { x: number; y: number }) => {
    const newNode: PipelineNode = {
      id: `node_${Date.now()}`,
      type: template.type,
      name: template.name,
      config: { ...template.defaultConfig },
      position: position || { x: 100 + nodes.length * 50, y: 100 + nodes.length * 30 },
      connections: []
    }
    setNodes(prev => [...prev, newNode])
    setSelectedNode(newNode.id)
  }, [nodes.length])

  // Delete node
  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId))
    // Remove connections to this node
    setNodes(prev => prev.map(n => ({
      ...n,
      connections: n.connections.filter(c => c.target !== nodeId && c.source !== nodeId)
    })))
    setSelectedNode(null)
  }

  // Update node position
  const updateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, position } : n
    ))
  }

  // Connect nodes
  const connectNodes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return
    
    setNodes(prev => prev.map(n => {
      if (n.id === sourceId) {
        const exists = n.connections.some(c => c.target === targetId)
        if (!exists) {
          return {
            ...n,
            connections: [...n.connections, { source: sourceId, target: targetId }]
          }
        }
      }
      return n
    }))
    setConnecting(null)
  }

  // Update node config
  const updateNodeConfig = (nodeId: string, config: Record<string, any>) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n
    ))
  }

  // Generate code from pipeline
  const generateCode = () => {
    let code = `# Generated Pipeline Code\n\n`
    code += `import pandas as pd\n`
    code += `from sqlalchemy import create_engine\n\n`
    
    nodes.forEach((node, index) => {
      const template = getNodeTemplate(node.name)
      
      code += `# Step ${index + 1}: ${node.name}\n`
      
      switch (node.type) {
        case 'source':
          if (node.name === 'PostgreSQL') {
            code += `engine_${index} = create_engine("postgresql://${node.config.host}:${node.config.port}/${node.config.database}")\n`
            code += `df_${index} = pd.read_sql_table("${node.config.table}", engine_${index}, schema="${node.config.schema}")\n\n`
          } else if (node.name === 'CSV File') {
            code += `df_${index} = pd.read_csv("${node.config.path}", delimiter="${node.config.delimiter}")\n\n`
          }
          break
        case 'transform':
          if (node.name === 'SQL Transform') {
            code += `df_${index} = pd.read_sql("""${node.config.sql}""", engine_0)\n\n`
          }
          break
        case 'filter':
          code += `df_${index} = df_${index - 1}[${node.config.condition}]\n\n`
          break
        case 'aggregate':
          code += `df_${index} = df_${index - 1}.groupby(${JSON.stringify(node.config.groupBy)}).agg({})\n\n`
          break
        case 'destination':
          if (node.name === 'PostgreSQL') {
            code += `df_${index - 1}.to_sql("${node.config.table}", engine_0, schema="${node.config.schema}", if_exists="replace")\n\n`
          }
          break
      }
    })
    
    code += `print("Pipeline completed successfully!")\n`
    setGeneratedCode(code)
    setShowPreview(true)
  }

  // Save pipeline
  const savePipeline = async () => {
    setSaving(true)
    try {
      // In production, save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Pipeline sauvegardé",
        description: "Votre pipeline a été sauvegardé avec succès"
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le pipeline",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Filter templates by search
  const filteredTemplates = NODE_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = []
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, NodeTemplate[]>)

  // Selected node details
  const selectedNodeDetails = nodes.find(n => n.id === selectedNode)

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">Pipeline Builder</h1>
          <Badge className="bg-violet-500/10 text-violet-400">No-Code</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-slate-400">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-400">
            <Redo className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 bg-slate-600" />
          <Button variant="outline" size="sm" onClick={generateCode}>
            <Code className="w-4 h-4 mr-2" />
            Preview Code
          </Button>
          <Button variant="outline" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={savePipeline} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-3 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                className="pl-9 bg-slate-900 border-slate-600"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1 p-3">
            {Object.entries(groupedTemplates).map(([category, templates]) => (
              <div key={category} className="mb-4">
                <h3 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">{category}</h3>
                <div className="space-y-1">
                  {templates.map((template) => (
                    <div
                      key={template.name}
                      draggable
                      onDragStart={() => setDraggedTemplate(template)}
                      onDragEnd={() => setDraggedTemplate(null)}
                      onClick={() => addNode(template)}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-grab hover:bg-slate-700/50 active:cursor-grabbing transition-colors"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        NODE_COLORS[template.type]
                      )}>
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{template.name}</div>
                        <div className="text-xs text-slate-500 truncate">{template.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Main Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.1)_1px,transparent_0)] bg-[size:24px_24px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            if (draggedTemplate && canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect()
              const position = {
                x: e.clientX - rect.left + canvasRef.current.scrollLeft,
                y: e.clientY - rect.top + canvasRef.current.scrollTop
              }
              addNode(draggedTemplate, position)
            }
          }}
        >
          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {nodes.map(node =>
              node.connections.map((conn, i) => {
                const targetNode = nodes.find(n => n.id === conn.target)
                if (!targetNode) return null
                return (
                  <path
                    key={`${conn.source}-${conn.target}-${i}`}
                    d={`M ${node.position.x + 140} ${node.position.y + 40} 
                       C ${node.position.x + 200} ${node.position.y + 40},
                         ${targetNode.position.x - 60} ${targetNode.position.y + 40},
                         ${targetNode.position.x} ${targetNode.position.y + 40}`}
                    fill="none"
                    stroke={connecting?.from === node.id ? '#8b5cf6' : '#475569'}
                    strokeWidth="2"
                    strokeDasharray={connecting?.from === node.id ? '5,5' : '0'}
                  />
                )
              })
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              draggable
              onDragEnd={(e) => {
                if (canvasRef.current) {
                  const rect = canvasRef.current.getBoundingClientRect()
                  updateNodePosition(node.id, {
                    x: e.clientX - rect.left + canvasRef.current.scrollLeft - 70,
                    y: e.clientY - rect.top + canvasRef.current.scrollTop - 20
                  })
                }
              }}
              onClick={() => setSelectedNode(node.id)}
              className={cn(
                "absolute w-[280px] rounded-lg border-2 cursor-move select-none",
                NODE_COLORS[node.type],
                selectedNode === node.id && "ring-2 ring-violet-500"
              )}
              style={{ left: node.position.x, top: node.position.y }}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                      {getNodeTemplate(node.name)?.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{node.name}</div>
                      <div className="text-xs text-slate-400 capitalize">{node.type}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNode(node.id)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Connection points */}
                <div className="flex justify-between">
                  <div
                    className="w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-400 cursor-crosshair -ml-1.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      // This is an input point
                    }}
                  />
                  <div
                    className="w-3 h-3 rounded-full bg-violet-500 border-2 border-violet-300 cursor-crosshair -mr-1.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (connecting?.from === node.id) {
                        setConnecting(null)
                      } else {
                        setConnecting({ from: node.id })
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Start building your pipeline</h3>
                <p className="text-slate-400 max-w-sm">
                  Drag nodes from the left panel to the canvas, or click on a node to add it
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties */}
        {selectedNodeDetails && (
          <div className="w-72 bg-slate-800 border-l border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  NODE_COLORS[selectedNodeDetails.type]
                )}>
                  {getNodeTemplate(selectedNodeDetails.name)?.icon}
                </div>
                <div>
                  <h3 className="text-white font-medium">{selectedNodeDetails.name}</h3>
                  <p className="text-xs text-slate-400 capitalize">{selectedNodeDetails.type}</p>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300 text-xs">Node Name</Label>
                  <Input
                    className="mt-1 bg-slate-900 border-slate-600 text-sm"
                    value={selectedNodeDetails.name}
                    onChange={(e) => updateNodeConfig(selectedNodeDetails.id, { name: e.target.value })}
                  />
                </div>

                {/* Dynamic config fields based on node type */}
                {Object.entries(selectedNodeDetails.config).map(([key, value]) => (
                  <div key={key}>
                    <Label className="text-slate-300 text-xs">{key}</Label>
                    {typeof value === 'boolean' ? (
                      <Select
                        value={value ? 'true' : 'false'}
                        onValueChange={(v) => updateNodeConfig(selectedNodeDetails.id, { [key]: v === 'true' })}
                      >
                        <SelectTrigger className="mt-1 bg-slate-900 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : typeof value === 'number' ? (
                      <Input
                        type="number"
                        className="mt-1 bg-slate-900 border-slate-600 text-sm"
                        value={value}
                        onChange={(e) => updateNodeConfig(selectedNodeDetails.id, { [key]: parseInt(e.target.value) })}
                      />
                    ) : typeof value === 'string' && value.length > 50 ? (
                      <Textarea
                        className="mt-1 bg-slate-900 border-slate-600 text-sm font-mono"
                        value={value}
                        onChange={(e) => updateNodeConfig(selectedNodeDetails.id, { [key]: e.target.value })}
                        rows={4}
                      />
                    ) : (
                      <Input
                        className="mt-1 bg-slate-900 border-slate-600 text-sm"
                        value={value}
                        onChange={(e) => updateNodeConfig(selectedNodeDetails.id, { [key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}

                {/* Connections */}
                {selectedNodeDetails.connections.length > 0 && (
                  <div>
                    <Label className="text-slate-300 text-xs">Connected To</Label>
                    <div className="mt-1 space-y-1">
                      {selectedNodeDetails.connections.map((conn) => {
                        const targetNode = nodes.find(n => n.id === conn.target)
                        return (
                          <div key={conn.target} className="flex items-center gap-2 p-2 bg-slate-900 rounded text-sm">
                            <ArrowRight className="w-4 h-4 text-slate-500" />
                            <span className="text-white">{targetNode?.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Code Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Generated Code Preview</DialogTitle>
            <DialogDescription className="text-slate-400">
              This is the Python code that will be generated from your pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 font-mono whitespace-pre-wrap">
              {generatedCode}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPreview(false)}>Close</Button>
            <Button onClick={() => {
              navigator.clipboard.writeText(generatedCode)
              toast({ title: "Code copied", description: "The code has been copied to your clipboard" })
            }}>
              <Download className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
