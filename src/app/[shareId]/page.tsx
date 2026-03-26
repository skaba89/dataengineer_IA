'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  GitBranch, 
  BarChart3,
  Database,
  FileText,
  ArrowLeft,
  Activity,
  Calendar
} from 'lucide-react'

interface SharedProject {
  id: string
  name: string
  description: string | null
  status: string
  industry: string | null
  organization: { name: string; industry: string | null }
  createdAt: string
  updatedAt: string
  progress: {
    overall: number
    workflowsCompleted: number
    workflowsTotal: number
  }
  latestActivity: {
    type: string
    status: string
    date: string
  } | null
  stats: {
    artifacts: number
    workflows: number
    dataSources: number
  }
  artifacts: Array<{
    id: string
    name: string
    type: string
    description: string | null
    date: string
  }>
  timeline: Array<{
    date: string
    type: string
    status: string
    progress: number
  }>
}

export default function PublicDashboard() {
  const params = useParams()
  const shareId = params.shareId as string
  
  const [project, setProject] = useState<SharedProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProject()
  }, [shareId])

  const fetchProject = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/share?shareId=${shareId}`)
      const data = await response.json()
      
      if (data.success) {
        setProject(data.project)
      } else {
        setError(data.error || 'Failed to load project')
      }
    } catch (err) {
      setError('Failed to load shared project')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string }> = {
      DRAFT: { className: 'bg-gray-100 text-gray-700' },
      DISCOVERY: { className: 'bg-blue-100 text-blue-700' },
      ARCHITECTURE: { className: 'bg-purple-100 text-purple-700' },
      DEVELOPMENT: { className: 'bg-yellow-100 text-yellow-700' },
      TESTING: { className: 'bg-orange-100 text-orange-700' },
      DEPLOYED: { className: 'bg-green-100 text-green-700' },
      COMPLETED: { className: 'bg-emerald-100 text-emerald-700' },
    }
    const style = config[status] || config.DRAFT
    return <Badge className={style.className}>{status}</Badge>
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 animate-pulse text-violet-600" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Project Not Found</CardTitle>
            <CardDescription>
              {error || 'This shared project could not be found or has been removed.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-500">{project.organization.name}</p>
              </div>
            </div>
            {getStatusBadge(project.status)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall Completion</span>
                  <span className="text-sm font-bold">{project.progress.overall}%</span>
                </div>
                <Progress value={project.progress.overall} className="h-3" />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{project.progress.workflowsCompleted} of {project.progress.workflowsTotal} workflows completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Artifacts
              </CardDescription>
              <CardTitle className="text-3xl">{project.stats.artifacts}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Documents & code generated
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Workflows
              </CardDescription>
              <CardTitle className="text-3xl">{project.stats.workflows}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Executed pipelines
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Sources
              </CardDescription>
              <CardTitle className="text-3xl">{project.stats.dataSources}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connected systems
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Artifacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Deliverables
            </CardTitle>
            <CardDescription>
              Generated artifacts and documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.artifacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No artifacts generated yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.artifacts.map((artifact) => (
                  <div key={artifact.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded">
                        {artifact.type === 'CODE' ? (
                          <FileText className="h-4 w-4 text-green-600" />
                        ) : artifact.type === 'DOCUMENT' ? (
                          <FileText className="h-4 w-4 text-blue-600" />
                        ) : artifact.type === 'SQL' ? (
                          <Database className="h-4 w-4 text-purple-600" />
                        ) : (
                          <Package className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{artifact.name}</p>
                        <p className="text-xs text-muted-foreground">{artifact.description || artifact.type}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{artifact.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {project.timeline.slice(0, 5).map((event, i) => (
                  <div key={i} className="relative pl-10">
                    <div className={`absolute left-2 w-4 h-4 rounded-full ${
                      event.status === 'COMPLETED' ? 'bg-green-500' :
                      event.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' :
                      event.status === 'FAILED' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{event.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.date)}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        event.status === 'COMPLETED' ? 'border-green-300 text-green-700' :
                        event.status === 'RUNNING' ? 'border-blue-300 text-blue-700' :
                        event.status === 'FAILED' ? 'border-red-300 text-red-700' : ''
                      }>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-6">
          <p>Powered by AI Data Engineering Platform</p>
          <p className="mt-1">Last updated: {formatDate(project.updatedAt)}</p>
        </div>
      </main>
    </div>
  )
}
