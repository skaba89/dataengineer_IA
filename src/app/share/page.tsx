'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  CheckCircle, 
  Clock, 
  Loader2, 
  FileText,
  BarChart2,
  GitBranch,
  Shuffle
} from 'lucide-react';

type Execution = {
  agentType: string;
  status: string;
  duration?: number;
  timestamp: string;
};

type Deliverable = {
  id: string;
  type: string;
  name: string;
  format: string;
  createdAt: string;
};

type ProjectData = {
  id: string;
  name: string;
  description?: string;
  status: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
};

const agentColors: Record<string, string> = {
  business: 'bg-blue-600',
  sales: 'bg-indigo-600',
  discovery: 'bg-green-600',
  architecture: 'bg-purple-600',
  pipeline: 'bg-yellow-600',
  transformation: 'bg-red-600',
  bi: 'bg-pink-600',
};

const agentIcons: Record<string, typeof Database> = {
  business: Database,
  sales: BarChart2,
  discovery: Database,
  architecture: Database,
  pipeline: GitBranch,
  transformation: Shuffle,
  bi: BarChart2,
};

const agentNames: Record<string, string> = {
  business: 'Business Analysis',
  sales: 'Sales Qualification',
  discovery: 'Data Discovery',
  architecture: 'Architecture Design',
  pipeline: 'Pipeline Generation',
  transformation: 'Data Transformation',
  bi: 'BI Dashboard',
};

function ShareContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [project, setProject] = useState<ProjectData | null>(null);
  const [progress, setProgress] = useState({ percent: 0, completedPhases: 0, totalPhases: 5 });
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  useEffect(() => {
    if (token) {
      fetchProject();
    } else {
      setLoading(false);
      setError('No share token provided');
    }
  }, [token]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/share?token=${token}`);
      const data = await response.json();

      if (data.success) {
        setProject(data.project);
        setProgress(data.progress);
        setExecutions(data.executions);
        setDeliverables(data.deliverables);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to load project');
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardContent className="pt-8 text-center">
            <Database className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Unable to Load Project</h2>
            <p className="text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      {/* Header */}
      <header className="border-b bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">AI Data Engineering</h1>
                <p className="text-xs text-gray-400">Project Dashboard</p>
              </div>
            </div>
            <Badge className="bg-blue-600">
              {project?.industry || 'General'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Project Overview */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-white">{project?.name}</CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  {project?.description || 'Data Engineering Project'}
                </CardDescription>
              </div>
              <Badge className={
                project?.status === 'completed' ? 'bg-green-600' :
                project?.status === 'development' ? 'bg-blue-600' :
                project?.status === 'deployed' ? 'bg-purple-600' : 'bg-yellow-600'
              }>
                {project?.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Overall Progress</span>
                  <span className="text-sm text-white font-medium">{progress.percent.toFixed(0)}%</span>
                </div>
                <Progress value={progress.percent} className="h-3" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{progress.completedPhases}</p>
                  <p className="text-xs text-gray-400">Phases Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{deliverables.length}</p>
                  <p className="text-xs text-gray-400">Deliverables</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{executions.length}</p>
                  <p className="text-xs text-gray-400">Agent Runs</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{formatDate(project?.updatedAt || '')}</p>
                  <p className="text-xs text-gray-400">Last Updated</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Execution Timeline */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Execution Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executions.map((exec, index) => {
                  const Icon = agentIcons[exec.agentType] || Database;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50">
                      <div className={`p-2 rounded-lg ${agentColors[exec.agentType] || 'bg-gray-600'}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {agentNames[exec.agentType] || exec.agentType}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(exec.timestamp)}
                        </p>
                      </div>
                      <div className="text-right">
                        {exec.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDuration(exec.duration)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {deliverables.map((deliverable) => (
                  <div key={deliverable.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-white">{deliverable.name}</p>
                        <p className="text-xs text-gray-400">{deliverable.type}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      {deliverable.format}
                    </Badge>
                  </div>
                ))}

                {deliverables.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No deliverables yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by AI Data Engineering System</p>
        </div>
      </main>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
