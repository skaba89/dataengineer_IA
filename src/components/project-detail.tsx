'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  GitBranch,
  BarChart2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Server,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { CodePreview, sampleGeneratedFiles } from './code-preview';

type DataSource = {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'pending' | 'error';
  tableCount: number;
  lastSync: string;
};

type Pipeline = {
  id: string;
  name: string;
  type: string;
  framework: string;
  status: 'generated' | 'deployed' | 'running' | 'error';
  schedule?: string;
};

type DashboardInfo = {
  id: string;
  name: string;
  type: string;
  chartCount: number;
  url?: string;
};

type Execution = {
  id: string;
  agentType: string;
  status: 'completed' | 'running' | 'failed';
  duration: number;
  timestamp: string;
  output?: string;
};

type Deliverable = {
  id: string;
  type: string;
  name: string;
  format: string;
  createdAt: string;
};

type ProjectDetailProps = {
  project: {
    id: string;
    name: string;
    description?: string;
    status: string;
    industry?: string;
    package: string;
    budget?: number;
    startDate?: string;
  };
  dataSources?: DataSource[];
  pipelines?: Pipeline[];
  dashboards?: DashboardInfo[];
  executions?: Execution[];
  deliverables?: Deliverable[];
  onClose: () => void;
};

// Mock data for demo
const mockDataSources: DataSource[] = [
  { id: '1', name: 'Production PostgreSQL', type: 'postgresql', status: 'connected', tableCount: 45, lastSync: '2024-01-15 06:00' },
  { id: '2', name: 'Stripe API', type: 'api', status: 'connected', tableCount: 12, lastSync: '2024-01-15 06:30' },
  { id: '3', name: 'Salesforce CRM', type: 'salesforce', status: 'pending', tableCount: 28, lastSync: '-' },
  { id: '4', name: 'S3 Data Lake', type: 's3', status: 'connected', tableCount: 8, lastSync: '2024-01-15 05:00' },
];

const mockPipelines: Pipeline[] = [
  { id: '1', name: 'Customer ETL Pipeline', type: 'etl', framework: 'airflow', status: 'running', schedule: '0 6 * * *' },
  { id: '2', name: 'Order Sync Pipeline', type: 'elt', framework: 'dbt', status: 'deployed', schedule: '*/15 * * * *' },
  { id: '3', name: 'Product Catalog Sync', type: 'etl', framework: 'airflow', status: 'generated', schedule: '0 3 * * *' },
];

const mockDashboards: DashboardInfo[] = [
  { id: '1', name: 'Executive Dashboard', type: 'looker', chartCount: 8, url: 'https://looker.company.com/dashboards/123' },
  { id: '2', name: 'Sales Analytics', type: 'metabase', chartCount: 12, url: 'https://metabase.company.com/dashboard/45' },
];

const mockExecutions: Execution[] = [
  { id: '1', agentType: 'discovery', status: 'completed', duration: 45000, timestamp: '2024-01-15 06:00' },
  { id: '2', agentType: 'architecture', status: 'completed', duration: 30000, timestamp: '2024-01-15 06:01' },
  { id: '3', agentType: 'pipeline', status: 'completed', duration: 60000, timestamp: '2024-01-15 06:02' },
  { id: '4', agentType: 'transformation', status: 'completed', duration: 45000, timestamp: '2024-01-15 06:03' },
  { id: '5', agentType: 'bi', status: 'running', duration: 0, timestamp: '2024-01-15 06:04' },
];

const mockDeliverables: Deliverable[] = [
  { id: '1', type: 'architecture_doc', name: 'Architecture Design Document', format: 'markdown', createdAt: '2024-01-15' },
  { id: '2', type: 'pipeline_code', name: 'Customer ETL Pipeline', format: 'python', createdAt: '2024-01-15' },
  { id: '3', type: 'dbt_models', name: 'Staging Models', format: 'sql', createdAt: '2024-01-15' },
  { id: '4', type: 'dashboard_config', name: 'Executive Dashboard Config', format: 'json', createdAt: '2024-01-15' },
];

const agentColors: Record<string, string> = {
  discovery: 'bg-green-600',
  architecture: 'bg-purple-600',
  pipeline: 'bg-yellow-600',
  transformation: 'bg-red-600',
  bi: 'bg-pink-600',
  business: 'bg-blue-600',
  sales: 'bg-indigo-600',
  conversational: 'bg-cyan-600',
  pricing: 'bg-orange-600',
  productization: 'bg-teal-600',
};

export function ProjectDetail({ 
  project, 
  onClose,
  dataSources: externalDataSources,
  pipelines: externalPipelines,
  dashboards: externalDashboards,
  executions: externalExecutions,
  deliverables: externalDeliverables,
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dataSources] = useState<DataSource[]>(externalDataSources || mockDataSources);
  const [pipelines] = useState<Pipeline[]>(externalPipelines || mockPipelines);
  const [dashboards] = useState<DashboardInfo[]>(externalDashboards || mockDashboards);
  const [executions] = useState<Execution[]>(externalExecutions || mockExecutions);
  const [deliverables] = useState<Deliverable[]>(externalDeliverables || mockDeliverables);

  const workflowProgress = (executions.filter(e => e.status === 'completed').length / 5) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose} className="border-gray-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <p className="text-gray-400">{project.industry || 'No industry'} • {project.package}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={
            project.status === 'completed' ? 'bg-green-600' :
            project.status === 'development' ? 'bg-blue-600' :
            project.status === 'deployed' ? 'bg-purple-600' : 'bg-yellow-600'
          }>
            {project.status}
          </Badge>
          {project.budget && (
            <span className="text-gray-400">€{project.budget.toLocaleString()}</span>
          )}
          <Button variant="outline" size="sm" className="border-gray-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Workflow Progress</span>
            <span className="text-sm text-white">{workflowProgress.toFixed(0)}%</span>
          </div>
          <Progress value={workflowProgress} className="h-2" />
          <div className="flex justify-between mt-4">
            {['Discovery', 'Architecture', 'Pipeline', 'Transform', 'BI'].map((phase, i) => {
              const exec = executions[i];
              return (
                <div key={phase} className="flex items-center gap-2">
                  {exec?.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : exec?.status === 'running' ? (
                    <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-xs text-gray-400">{phase}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Database className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{dataSources.length}</p>
                    <p className="text-xs text-gray-400">Data Sources</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{pipelines.length}</p>
                    <p className="text-xs text-gray-400">Pipelines</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{dashboards.length}</p>
                    <p className="text-xs text-gray-400">Dashboards</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-8 w-8 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{deliverables.length}</p>
                    <p className="text-xs text-gray-400">Deliverables</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {executions.map((exec) => (
                  <div key={exec.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <Badge className={agentColors[exec.agentType] || 'bg-gray-600'}>
                        {exec.agentType}
                      </Badge>
                      {exec.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : exec.status === 'running' ? (
                        <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">
                        {exec.duration > 0 ? `${(exec.duration / 1000).toFixed(1)}s` : 'Running...'}
                      </p>
                      <p className="text-xs text-gray-500">{exec.timestamp}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {dataSources.map((source) => (
              <Card key={source.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Server className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-medium text-white">{source.name}</p>
                        <p className="text-xs text-gray-400">{source.type}</p>
                      </div>
                    </div>
                    <Badge className={
                      source.status === 'connected' ? 'bg-green-600' :
                      source.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                    }>
                      {source.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{source.tableCount} tables</span>
                    <span className="text-gray-400">Last sync: {source.lastSync}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pipelines Tab */}
        <TabsContent value="pipelines" className="space-y-4">
          {pipelines.map((pipeline) => (
            <Card key={pipeline.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="font-medium text-white">{pipeline.name}</p>
                      <p className="text-xs text-gray-400">{pipeline.framework} • {pipeline.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pipeline.schedule && (
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        {pipeline.schedule}
                      </Badge>
                    )}
                    <Badge className={
                      pipeline.status === 'running' ? 'bg-blue-600' :
                      pipeline.status === 'deployed' ? 'bg-green-600' :
                      pipeline.status === 'generated' ? 'bg-yellow-600' : 'bg-red-600'
                    }>
                      {pipeline.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Dashboards Tab */}
        <TabsContent value="dashboards" className="space-y-4">
          {dashboards.map((dashboard) => (
            <Card key={dashboard.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart2 className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="font-medium text-white">{dashboard.name}</p>
                      <p className="text-xs text-gray-400">{dashboard.type} • {dashboard.chartCount} charts</p>
                    </div>
                  </div>
                  {dashboard.url && (
                    <Button variant="outline" size="sm" className="border-gray-600" asChild>
                      <a href={dashboard.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Code Tab */}
        <TabsContent value="code">
          <CodePreview files={sampleGeneratedFiles} title="Generated Pipeline Code" />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Execution Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {executions.map((exec, index) => (
                  <div key={exec.id} className="relative pl-6 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {index < executions.length - 1 && (
                      <div className="absolute left-[7px] top-3 w-0.5 h-full bg-gray-700" />
                    )}
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full ${
                      exec.status === 'completed' ? 'bg-green-600' :
                      exec.status === 'running' ? 'bg-blue-600 animate-pulse' : 'bg-red-600'
                    }`} />
                    {/* Content */}
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <Badge className={agentColors[exec.agentType] || 'bg-gray-600'}>
                          {exec.agentType}
                        </Badge>
                        <span className="text-sm text-gray-400">{exec.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        Duration: {exec.duration > 0 ? `${(exec.duration / 1000).toFixed(1)}s` : 'Running...'}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export sample data for backwards compatibility
export const sampleDataSources = mockDataSources;
export const samplePipelines = mockPipelines;
export const sampleDashboards = mockDashboards;
export const sampleExecutions = mockExecutions;
export const sampleDeliverables = mockDeliverables;
