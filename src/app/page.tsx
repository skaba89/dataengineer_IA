'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Briefcase,
  TrendingUp,
  Search,
  Layers,
  GitBranch,
  Shuffle,
  BarChart2,
  MessageCircle,
  DollarSign,
  BookOpen,
  Play,
  Settings,
  Zap,
  CheckCircle,
  Clock,
  Database,
  Activity,
  Plus,
  Users,
  Building2,
  Target,
  Sparkles,
  FileText,
  ArrowRight,
  Loader2,
  LucideIcon,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  Bell,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  ExecutionHistoryChart,
  ProjectDistributionChart,
  WorkflowTrendChart,
  CodePreview,
  ProjectDetail,
  sampleAirflowDAG,
  sampleDbtModel,
  sampleYamlConfig,
  sampleDataSources,
  samplePipelines,
  sampleDashboards,
  sampleExecutions,
  sampleDeliverables,
} from '@/components';
import { LanguageSwitcher, useI18n } from '@/lib/i18n';

// Agent icons mapping
const agentIcons: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  trending_up: TrendingUp,
  search: Search,
  layers: Layers,
  git_branch: GitBranch,
  shuffle: Shuffle,
  bar_chart: BarChart2,
  message_circle: MessageCircle,
  dollar_sign: DollarSign,
  book_open: BookOpen,
  play: Play,
  settings: Settings,
  zap: Zap,
  check_circle: CheckCircle,
  clock: Clock,
  database: Database,
  activity: Activity,
  plus: Plus,
  users: Users,
  building: Building2,
  target: Target,
  sparkles: Sparkles,
  file_text: FileText,
  arrow_right: ArrowRight,
};

type AgentInfo = {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  capabilities: string[];
  output?: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  industry: string;
  package: string;
  budget: number;
  startDate: string;
};

type WorkflowPhase = {
  phase: string;
  status: string;
  output?: string;
  duration?: number;
};

type Package = {
  name: string;
  priceMin: number;
  priceMax: number;
  duration: string;
  features: string[];
};

type ExecutionRecord = {
  id: string;
  agentType: string;
  status: string;
  duration?: number;
  createdAt: string;
  input?: string;
  output?: string;
  error?: string;
};

export default function AIOrchestratorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [agents, setAgents] = useState<AgentInfo[]>([
    { id: '1', type: 'business', name: 'Strategic Orchestrator', description: 'Analyzes business requirements and ensures strategic alignment', icon: 'briefcase', status: 'idle', capabilities: ['Requirements analysis', 'Strategic planning', 'Value proposition'] },
    { id: '2', type: 'sales', name: 'Revenue Generator', description: 'Manages lead qualification, proposals, and deal closure', icon: 'trending_up', status: 'idle', capabilities: ['Lead qualification', 'Proposal generation', 'Objection handling'] },
    { id: '3', type: 'discovery', name: 'Data Archaeologist', description: 'Explores data ecosystems and analyzes schemas', icon: 'search', status: 'idle', capabilities: ['Schema analysis', 'Data profiling', 'PII detection'] },
    { id: '4', type: 'architecture', name: 'Blueprint Designer', description: 'Designs optimal data architectures and recommends tech stacks', icon: 'layers', status: 'idle', capabilities: ['Architecture design', 'Technology selection', 'Cost estimation'] },
    { id: '5', type: 'pipeline', name: 'Flow Builder', description: 'Generates production-ready ETL/ELT pipelines', icon: 'git_branch', status: 'idle', capabilities: ['DAG generation', 'dbt models', 'Spark jobs'] },
    { id: '6', type: 'transformation', name: 'Data Alchemist', description: 'Implements data transformations and creates analytical models', icon: 'shuffle', status: 'idle', capabilities: ['Dimensional modeling', 'SQL optimization', 'Testing'] },
    { id: '7', type: 'bi', name: 'Visual Storyteller', description: 'Creates dashboards and visualizations', icon: 'bar_chart', status: 'idle', capabilities: ['Dashboard creation', 'KPI definition', 'Report automation'] },
    { id: '8', type: 'conversational', name: 'Query Translator', description: 'Enables natural language data queries', icon: 'message_circle', status: 'idle', capabilities: ['Text-to-SQL', 'Visualization recommendation', 'Query explanation'] },
    { id: '9', type: 'pricing', name: 'Value Architect', description: 'Generates pricing proposals and ROI analysis', icon: 'dollar_sign', status: 'idle', capabilities: ['Effort estimation', 'ROI calculation', 'Proposal generation'] },
    { id: '10', type: 'productization', name: 'Knowledge Evangelist', description: 'Extracts reusable templates and enriches knowledge base', icon: 'book_open', status: 'idle', capabilities: ['Template extraction', 'Knowledge management', 'Documentation'] },
  ]);

  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [workflowPhases, setWorkflowPhases] = useState<WorkflowPhase[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIndustry, setNewProjectIndustry] = useState('');
  
  // New state for sales/prospecting
  const [showProspectingDialog, setShowProspectingDialog] = useState(false);
  const [prospectIndustry, setProspectIndustry] = useState('');
  const [prospectCompany, setProspectCompany] = useState('');
  const [prospectContact, setProspectContact] = useState('');
  const [prospectOutreach, setProspectOutreach] = useState('');
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  
  // Pricing state
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [pricingData, setPricingData] = useState<Package | null>(null);
  const [pricingProposal, setPricingProposal] = useState('');
  const [isGeneratingPricing, setIsGeneratingPricing] = useState(false);

  // Execution history state
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [executionStats, setExecutionStats] = useState<{
    totalExecutions: number;
    avgDuration: number | null;
    byStatus: Record<string, number>;
    byAgentType: Record<string, number>;
  } | null>(null);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [executionFilters, setExecutionFilters] = useState({
    agentType: '',
    status: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Scheduler state
  const [schedules, setSchedules] = useState<Array<{
    id: string;
    name: string;
    projectId: string;
    scheduleType: string;
    status: string;
    nextRunAt?: Date;
    lastRunAt?: Date;
    runCount: number;
  }>>([]);
  const [showSchedulerDialog, setShowSchedulerDialog] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newScheduleType, setNewScheduleType] = useState<'once' | 'daily' | 'weekly' | 'on_demand'>('on_demand');

  // Autonomous mode state
  const [autonomousMode, setAutonomousMode] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=20');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.stats.unread);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Fetch schedules
  const fetchSchedules = useCallback(async () => {
    try {
      const response = await fetch('/api/scheduler');
      const data = await response.json();
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Create schedule
  const createSchedule = async () => {
    if (!selectedProject || !newScheduleName) return;
    
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newScheduleName,
          projectId: selectedProject.id,
          scheduleType: newScheduleType,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSchedules(prev => [...prev, data.schedule]);
        setShowSchedulerDialog(false);
        setNewScheduleName('');
        setNewScheduleType('on_demand');
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  // Run scheduled workflow now
  const runScheduledWorkflow = async (scheduleId: string) => {
    try {
      const response = await fetch('/api/scheduler', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId, action: 'run_now' }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchSchedules();
      }
    } catch (error) {
      console.error('Failed to run scheduled workflow:', error);
    }
  };

  // Toggle autonomous mode
  const toggleAutonomousMode = () => {
    setAutonomousMode(prev => !prev);
  };

  // Fetch notifications and schedules on mount
  useEffect(() => {
    fetchNotifications();
    fetchSchedules();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchSchedules]);

  // Fetch execution history
  const fetchExecutions = useCallback(async () => {
    setExecutionsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProject?.id) params.append('projectId', selectedProject.id);
      if (executionFilters.agentType) params.append('agentType', executionFilters.agentType);
      if (executionFilters.status) params.append('status', executionFilters.status);
      if (executionFilters.search) params.append('search', executionFilters.search);

      const response = await fetch(`/api/executions?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setExecutions(data.executions);
        setExecutionStats(data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    }
    setExecutionsLoading(false);
  }, [selectedProject?.id, executionFilters]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchExecutions();
    }
  }, [activeTab, fetchExecutions]);

  // Create new project
  const createProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          industry: newProjectIndustry,
          description: '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedProject(data.project);
        setShowNewProjectDialog(false);
        setNewProjectName('');
        setNewProjectIndustry('');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  // Start agent execution
  const runAgent = useCallback(async (agentType: string) => {
    setAgents(prev => prev.map(a => 
      a.type === agentType ? { ...a, status: 'running' } : a
    ));

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          projectId: selectedProject?.id || 'demo',
          message: userInput,
          projectData: selectedProject,
        }),
      });

      const data = await response.json();

      setAgents(prev => prev.map(a => {
        if (a.type === agentType) {
          return {
            ...a,
            status: data.success ? 'completed' : 'error',
            output: data.output?.rawResponse,
          };
        }
        return a;
      }));

      if (data.output?.rawResponse) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.output.rawResponse }]);
      }
    } catch (error) {
      setAgents(prev => prev.map(a => {
        if (a.type === agentType) {
          return { ...a, status: 'error', output: String(error) };
        }
        return a;
      }));
    }
  }, [selectedProject, userInput]);

  // Run full workflow
  const runWorkflow = async () => {
    if (!selectedProject) return;

    setIsWorkflowRunning(true);
    setWorkflowProgress(0);
    setWorkflowPhases([]);

    try {
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          projectData: selectedProject,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setWorkflowPhases(data.workflow.phases);
        setWorkflowProgress(100);

        // Update agents status
        data.workflow.phases.forEach((phase: WorkflowPhase) => {
          const agentType = phase.phase.toLowerCase().split(' ')[0];
          setAgents(prev => prev.map(a => {
            if (a.type === agentType || 
                (agentType === 'data' && a.type === 'discovery') ||
                (agentType === 'architecture' && a.type === 'architecture')) {
              return { ...a, status: phase.status === 'completed' ? 'completed' : 'error' };
            }
            return a;
          }));
        });

        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ Workflow completed! ${data.workflow.completedPhases}/${data.workflow.totalPhases} phases completed in ${(data.workflow.totalDuration / 1000).toFixed(1)}s.`,
        }]);
      }
    } catch (error) {
      console.error('Workflow error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }]);
    }

    setIsWorkflowRunning(false);
  };

  // Generate prospect outreach
  const generateOutreach = async () => {
    setIsGeneratingOutreach(true);
    try {
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: prospectIndustry,
          companyName: prospectCompany,
          contactName: prospectContact,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProspectOutreach(data.outreach);
      }
    } catch (error) {
      console.error('Failed to generate outreach:', error);
    }
    setIsGeneratingOutreach(false);
  };

  // Generate pricing proposal
  const generatePricing = async () => {
    if (!selectedProject) return;
    
    setIsGeneratingPricing(true);
    try {
      const response = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: selectedProject,
          requirements: {
            dataSources: 5,
            pipelines: 10,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPricingData(data.pricing);
        setPricingProposal(data.proposal);
      }
    } catch (error) {
      console.error('Failed to generate pricing:', error);
    }
    setIsGeneratingPricing(false);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = agentIcons[iconName] || Briefcase;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Sample code files for demo
  const codeFiles = [
    { ...sampleAirflowDAG },
    { ...sampleDbtModel },
    { ...sampleYamlConfig },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI Data Engineering System</h1>
              <p className="text-xs text-gray-500">Multi-Agent Platform • MVP v1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              System Online
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowProspectingDialog(true)}>
              <Target className="h-4 w-4 mr-2" />
              Prospecting
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/project-management">
                <Users className="h-4 w-4 mr-2" />
                Project Mgmt
              </a>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Project Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Active Project</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowProjectDetail(true)} 
                  variant="outline" 
                  size="sm" 
                  disabled={!selectedProject}
                  className="border-gray-600"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button onClick={() => setShowPricingDialog(true)} variant="outline" size="sm" disabled={!selectedProject}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Generate Proposal
                </Button>
                <Button onClick={() => setShowNewProjectDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            {selectedProject ? (
              <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30 cursor-pointer hover:border-blue-400 transition-all" onClick={() => setShowProjectDetail(true)}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{selectedProject.name}</h3>
                      <p className="text-sm text-gray-300">{selectedProject.industry || 'No industry specified'}</p>
                    </div>
                    <Badge className={
                      selectedProject.status === 'completed' ? 'bg-green-600' : 
                      selectedProject.status === 'development' ? 'bg-blue-600' : 'bg-yellow-600'
                    }>
                      {selectedProject.status}
                    </Badge>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <Badge variant="outline" className="border-gray-600 text-gray-300">{selectedProject.package}</Badge>
                    {selectedProject.budget && (
                      <span className="text-sm text-gray-400">
                        Budget: €{selectedProject.budget.toLocaleString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-gray-600 bg-gray-800/30">
                <CardContent className="py-8 text-center">
                  <Database className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No project selected</p>
                  <p className="text-sm text-gray-500">Create a new project to start the workflow</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Overview</TabsTrigger>
              <TabsTrigger value="agents" className="data-[state=active]:bg-blue-600">Agents</TabsTrigger>
              <TabsTrigger value="workflow" className="data-[state=active]:bg-blue-600">Workflow</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">History</TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-blue-600">Chat</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300">Total Agents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-400">{agents.length}</div>
                      <p className="text-xs text-gray-500 mt-1">All operational</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300">Active Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-400">{selectedProject ? 1 : 0}</div>
                      <p className="text-xs text-gray-500 mt-1">In progress</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300">Workflow Phases</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-400">{workflowPhases.filter(p => p.status === 'completed').length}/5</div>
                      <p className="text-xs text-gray-500 mt-1">Completed</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-400" />
                        <span className="text-xl font-bold text-yellow-400">Ready</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">All systems operational</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 md:grid-cols-2">
                  <ExecutionHistoryChart />
                  <ProjectDistributionChart />
                </div>

                {/* Trend Chart */}
                <WorkflowTrendChart />

                {/* Code Preview Section */}
                <CodePreview files={codeFiles} title="Generated Code Preview" />
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <Card key={agent.id} className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-900/50 rounded-lg">
                          {getIconComponent(agent.icon)}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium text-white">{agent.name}</CardTitle>
                          <p className="text-xs text-gray-400">{agent.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={
                          agent.status === 'completed' ? 'bg-green-600' :
                          agent.status === 'running' ? 'bg-blue-600' : 
                          agent.status === 'error' ? 'bg-red-600' : 'bg-gray-600'
                        }>
                          {agent.status}
                        </Badge>
                        <Button
                          onClick={() => runAgent(agent.type)}
                          disabled={isWorkflowRunning}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 hover:bg-gray-700"
                        >
                          {agent.status === 'running' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          Run
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {agent.capabilities.slice(0, 3).map((cap, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'workflow' && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Automated Workflow Execution</CardTitle>
                  <CardDescription className="text-gray-400">
                    Execute the complete data engineering pipeline from discovery to dashboards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Execute the complete data engineering workflow</span>
                      <Button
                        onClick={runWorkflow}
                        disabled={isWorkflowRunning || !selectedProject}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isWorkflowRunning ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Run Workflow
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {isWorkflowRunning && (
                      <div className="space-y-2">
                        <Progress value={workflowProgress} className="h-2" />
                        <p className="text-sm text-gray-400">{workflowProgress}% - Processing...</p>
                      </div>
                    )}

                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {['Discovery', 'Architecture', 'Pipeline', 'Transformation', 'BI'].map((step, index) => {
                        const phaseStatus = workflowPhases.find(p => 
                          p.phase.toLowerCase().includes(step.toLowerCase())
                        )?.status || (workflowProgress > (index + 1) * 20 ? 'completed' : 'pending');
                        
                        return (
                          <div
                            key={step}
                            className={`p-3 rounded-lg border ${
                              phaseStatus === 'completed'
                                ? 'bg-green-900/30 border-green-500/50'
                                : phaseStatus === 'running'
                                ? 'bg-blue-900/30 border-blue-500/50'
                                : 'bg-gray-800/30 border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {getIconComponent(
                                step.toLowerCase() === 'discovery' ? 'search' :
                                step.toLowerCase() === 'architecture' ? 'layers' :
                                step.toLowerCase() === 'pipeline' ? 'git_branch' :
                                step.toLowerCase() === 'transformation' ? 'shuffle' : 'bar_chart'
                              )}
                              <span className="text-sm font-medium text-white">{step}</span>
                            </div>
                            {phaseStatus === 'completed' && (
                              <CheckCircle className="h-4 w-4 text-green-400 mt-2" />
                            )}
                            {phaseStatus === 'running' && (
                              <Loader2 className="h-4 w-4 text-blue-400 animate-spin mt-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Workflow Results */}
                    {workflowPhases.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-medium text-white">Workflow Results</h4>
                        <ScrollArea className="h-[300px] rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                          {workflowPhases.map((phase, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                              <div className="flex items-center gap-2 mb-2">
                                {phase.status === 'completed' ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Clock className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium text-white">{phase.phase}</span>
                                {phase.duration && (
                                  <span className="text-xs text-gray-500">({(phase.duration / 1000).toFixed(1)}s)</span>
                                )}
                              </div>
                              {phase.output && (
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-gray-800/50 p-2 rounded">
                                  {phase.output.slice(0, 500)}...
                                </pre>
                              )}
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {/* Filters */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="text-gray-400"
                      >
                        {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    {showFilters && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-xs">Agent Type</Label>
                          <Select
                            value={executionFilters.agentType}
                            onValueChange={(value) => setExecutionFilters(prev => ({ ...prev, agentType: value }))}
                          >
                            <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                              <SelectValue placeholder="All agents" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All agents</SelectItem>
                              <SelectItem value="discovery">Data Archaeologist</SelectItem>
                              <SelectItem value="architecture">Blueprint Designer</SelectItem>
                              <SelectItem value="pipeline">Flow Builder</SelectItem>
                              <SelectItem value="transformation">Data Alchemist</SelectItem>
                              <SelectItem value="bi">Visual Storyteller</SelectItem>
                              <SelectItem value="conversational">Query Translator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-xs">Status</Label>
                          <Select
                            value={executionFilters.status}
                            onValueChange={(value) => setExecutionFilters(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                              <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All statuses</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="running">Running</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-xs">Search</Label>
                          <Input
                            placeholder="Search in logs..."
                            value={executionFilters.search}
                            onChange={(e) => setExecutionFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="bg-gray-900 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Statistics */}
                {executionStats && (
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardContent className="pt-4">
                        <p className="text-xs text-gray-400">Total Executions</p>
                        <p className="text-2xl font-bold text-white">{executionStats.totalExecutions}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardContent className="pt-4">
                        <p className="text-xs text-gray-400">Avg Duration</p>
                        <p className="text-2xl font-bold text-white">
                          {executionStats.avgDuration ? formatDuration(executionStats.avgDuration) : '-'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardContent className="pt-4">
                        <p className="text-xs text-gray-400">Completed</p>
                        <p className="text-2xl font-bold text-green-400">{executionStats.byStatus['completed'] || 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardContent className="pt-4">
                        <p className="text-xs text-gray-400">Failed</p>
                        <p className="text-2xl font-bold text-red-400">{executionStats.byStatus['failed'] || 0}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Execution Timeline */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Execution Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {executionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                      </div>
                    ) : executions.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No executions recorded yet</p>
                        <p className="text-sm text-gray-500 mt-1">Run agents to see execution history</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-4 pl-10">
                            {executions.map((exec) => (
                              <div key={exec.id} className="relative">
                                <div className="absolute -left-10 top-1">
                                  <div className={`p-1 rounded-full ${
                                    exec.status === 'completed' ? 'bg-green-600' :
                                    exec.status === 'running' ? 'bg-blue-600' :
                                    exec.status === 'failed' ? 'bg-red-600' : 'bg-gray-600'
                                  }`}>
                                    {exec.status === 'completed' ? (
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    ) : exec.status === 'running' ? (
                                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-white" />
                                    )}
                                  </div>
                                </div>
                                <Card className="bg-gray-900/50 border-gray-700">
                                  <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <p className="font-medium text-white capitalize">{exec.agentType}</p>
                                        <p className="text-xs text-gray-400">{formatDate(exec.createdAt)}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {exec.duration && (
                                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                                            {formatDuration(exec.duration)}
                                          </Badge>
                                        )}
                                        <Badge className={
                                          exec.status === 'completed' ? 'bg-green-600' :
                                          exec.status === 'running' ? 'bg-blue-600' :
                                          'bg-red-600'
                                        }>
                                          {exec.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    {exec.output && (
                                      <pre className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded mt-2 overflow-x-auto max-h-[100px]">
                                        {exec.output.slice(0, 300)}...
                                      </pre>
                                    )}
                                    {exec.error && (
                                      <p className="text-xs text-red-400 mt-2">{exec.error}</p>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'chat' && (
              <Card className="h-[500px] flex flex-col bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Conversational Analytics</CardTitle>
                  <CardDescription className="text-gray-400">Ask questions about your data in natural language</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    {chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Start a conversation with the AI system</p>
                          <p className="text-sm mt-2">Try: &quot;What data sources should we integrate first?&quot;</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg ${
                              msg.role === 'user' ? 'bg-blue-900/30 ml-auto max-w-[80%]' : 'bg-gray-700/50 mr-auto max-w-[80%]'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {msg.role === 'user' ? (
                                <Users className="h-4 w-4 text-blue-400" />
                              ) : (
                                <Activity className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="text-sm font-medium text-white">
                                {msg.role === 'user' ? 'You' : 'AI System'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="border-t border-gray-700 p-4 mt-auto">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask a question about your data..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="flex-1 bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && userInput.trim()) {
                            setChatMessages(prev => [...prev, { role: 'user', content: userInput }]);
                            setUserInput('');
                            runAgent('conversational');
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (userInput.trim()) {
                            setChatMessages(prev => [...prev, { role: 'user', content: userInput }]);
                            setUserInput('');
                            runAgent('conversational');
                          }
                        }}
                        disabled={!userInput.trim() || isWorkflowRunning}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Project Detail Dialog */}
      {showProjectDetail && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="w-full max-w-5xl mx-4 bg-gray-800 border-gray-700 h-[90vh] overflow-hidden">
            <ProjectDetail
              project={selectedProject}
              dataSources={sampleDataSources}
              pipelines={samplePipelines}
              dashboards={sampleDashboards}
              executions={sampleExecutions}
              deliverables={sampleDeliverables}
              onClose={() => setShowProjectDetail(false)}
            />
          </Card>
        </div>
      )}

      {/* New Project Dialog */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Project</CardTitle>
              <CardDescription className="text-gray-400">Start a new data engineering project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name" className="text-gray-300">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="My Data Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-gray-300">Industry</Label>
                <Select value={newProjectIndustry} onValueChange={setNewProjectIndustry}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail & E-commerce</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Financial Services</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="saas">SaaS & Technology</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewProjectDialog(false)} className="border-gray-600">
                  Cancel
                </Button>
                <Button onClick={createProject} disabled={!newProjectName} className="bg-blue-600 hover:bg-blue-700">
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prospecting Dialog */}
      {showProspectingDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Sales Prospecting
              </CardTitle>
              <CardDescription className="text-gray-400">Generate personalized outreach for prospects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Industry</Label>
                  <Select value={prospectIndustry} onValueChange={setProspectIndustry}>
                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail & E-commerce</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Financial Services</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="saas">SaaS & Technology</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Company Name</Label>
                  <Input
                    placeholder="Target Company"
                    value={prospectCompany}
                    onChange={(e) => setProspectCompany(e.target.value)}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Contact Name (Optional)</Label>
                <Input
                  placeholder="John Smith"
                  value={prospectContact}
                  onChange={(e) => setProspectContact(e.target.value)}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <Button 
                onClick={generateOutreach} 
                disabled={!prospectIndustry || isGeneratingOutreach}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingOutreach ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Outreach
                  </>
                )}
              </Button>
              
              {prospectOutreach && (
                <div className="mt-4">
                  <Label className="text-gray-300 mb-2 block">Generated Outreach</Label>
                  <ScrollArea className="h-[300px] rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap">{prospectOutreach}</pre>
                  </ScrollArea>
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowProspectingDialog(false);
                  setProspectOutreach('');
                  setProspectCompany('');
                  setProspectContact('');
                }} className="border-gray-600">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Dialog */}
      {showPricingDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl mx-4 bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Proposal
              </CardTitle>
              <CardDescription className="text-gray-400">
                Generate a professional pricing proposal for {selectedProject?.name || 'your project'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generatePricing} 
                disabled={isGeneratingPricing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingPricing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Proposal...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Proposal
                  </>
                )}
              </Button>
              
              {pricingData && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <Card className="bg-gray-700/50 border-gray-600">
                    <CardContent className="pt-4 text-center">
                      <h4 className="font-medium text-white">Starter</h4>
                      <p className="text-2xl font-bold text-blue-400">€25-40K</p>
                      <p className="text-xs text-gray-400">4-6 weeks</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-900/50 border-blue-500">
                    <CardContent className="pt-4 text-center">
                      <Badge className="bg-blue-600 mb-2">Recommended</Badge>
                      <h4 className="font-medium text-white">{pricingData.name}</h4>
                      <p className="text-2xl font-bold text-blue-400">
                        €{(pricingData.priceMin / 1000).toFixed(0)}-{(pricingData.priceMax / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-gray-400">{pricingData.duration}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-700/50 border-gray-600">
                    <CardContent className="pt-4 text-center">
                      <h4 className="font-medium text-white">Enterprise</h4>
                      <p className="text-2xl font-bold text-blue-400">€200K+</p>
                      <p className="text-xs text-gray-400">6+ months</p>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {pricingProposal && (
                <div className="mt-4">
                  <Label className="text-gray-300 mb-2 block">Proposal Details</Label>
                  <ScrollArea className="h-[300px] rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap">{pricingProposal}</pre>
                  </ScrollArea>
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowPricingDialog(false);
                  setPricingData(null);
                  setPricingProposal('');
                }} className="border-gray-600">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
