'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ListTodo,
  Shield,
  Activity,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

// Types
type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
type SprintStatus = 'planning' | 'active' | 'completed';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  effort: number;
  sprintId: string;
  tags: string[];
}

interface Sprint {
  id: string;
  name: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  goals: string[];
  tasks: Task[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  capacity: number;
  currentLoad: number;
}

interface Risk {
  id: string;
  title: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigating' | 'resolved';
}

// Sample Data
const teamMembers: TeamMember[] = [
  { id: '1', name: 'Alex Martin', role: 'Tech Lead', avatar: '👨‍💼', capacity: 80, currentLoad: 72 },
  { id: '2', name: 'Sarah Chen', role: 'Backend Senior', avatar: '👩‍💻', capacity: 80, currentLoad: 65 },
  { id: '3', name: 'Mike Johnson', role: 'Backend Senior', avatar: '👨‍💻', capacity: 80, currentLoad: 78 },
  { id: '4', name: 'Emma Wilson', role: 'Frontend Senior', avatar: '👩‍🎨', capacity: 80, currentLoad: 55 },
  { id: '5', name: 'David Brown', role: 'DevOps Engineer', avatar: '🔧', capacity: 80, currentLoad: 70 },
  { id: '6', name: 'Lisa Taylor', role: 'QA Engineer', avatar: '🔍', capacity: 80, currentLoad: 48 },
  { id: '7', name: 'James Lee', role: 'Security Engineer', avatar: '🔐', capacity: 80, currentLoad: 35 },
  { id: '8', name: 'Anna Garcia', role: 'Product Owner', avatar: '📋', capacity: 80, currentLoad: 60 },
  { id: '9', name: 'Tom Davis', role: 'Scrum Master', avatar: '🎯', capacity: 80, currentLoad: 40 },
];

const sprints: Sprint[] = [
  {
    id: 'sprint-1',
    name: 'Sprint 1: Suite de Tests',
    status: 'active',
    startDate: '2025-01-06',
    endDate: '2025-01-17',
    goals: [
      'Atteindre 80% de couverture de tests sur les modules critiques',
      'Implémenter tests unitaires pour Security, Billing, Lineage',
      'Configurer environnement de test avec mocks et fixtures',
    ],
    tasks: [
      { id: 't1', title: 'Configuration Vitest + coverage', description: 'Setup testing framework with coverage reporting', priority: 'P0', status: 'done', assignee: '2', effort: 1, sprintId: 'sprint-1', tags: ['testing', 'setup'] },
      { id: 't2', title: 'Tests EncryptionService', description: 'Tests for encrypt/decrypt, hash, tokens', priority: 'P0', status: 'done', assignee: '2', effort: 1.5, sprintId: 'sprint-1', tags: ['testing', 'security'] },
      { id: 't3', title: 'Tests BillingService', description: 'Tests for subscriptions, limits, webhooks', priority: 'P0', status: 'in_progress', assignee: '3', effort: 2, sprintId: 'sprint-1', tags: ['testing', 'billing'] },
      { id: 't4', title: 'Tests DataLineageEngine', description: 'Tests for CRUD, queries, impact analysis', priority: 'P0', status: 'in_progress', assignee: '2', effort: 1.5, sprintId: 'sprint-1', tags: ['testing', 'lineage'] },
      { id: 't5', title: 'Tests Connecteurs', description: 'Tests for Shopify, Stripe, Salesforce connectors', priority: 'P1', status: 'todo', assignee: '3', effort: 1.5, sprintId: 'sprint-1', tags: ['testing', 'connectors'] },
      { id: 't6', title: 'Tests API Routes', description: 'Tests for auth, projects, exports routes', priority: 'P1', status: 'todo', assignee: '2', effort: 1.5, sprintId: 'sprint-1', tags: ['testing', 'api'] },
      { id: 't7', title: 'Configuration mocks', description: 'Mocks for Prisma, NextAuth, Stripe', priority: 'P0', status: 'done', assignee: '3', effort: 1, sprintId: 'sprint-1', tags: ['testing', 'mocks'] },
      { id: 't8', title: 'Documentation patterns de test', description: 'Document testing patterns for team', priority: 'P1', status: 'todo', assignee: '1', effort: 0.5, sprintId: 'sprint-1', tags: ['docs', 'testing'] },
    ],
  },
  {
    id: 'sprint-2',
    name: 'Sprint 2: CI/CD & Quality Gates',
    status: 'planning',
    startDate: '2025-01-20',
    endDate: '2025-01-31',
    goals: [
      'Automatiser le pipeline de build, test et deploy',
      'Implémenter les quality gates (lint, tests, security)',
      'Configurer les environnements staging et production',
    ],
    tasks: [
      { id: 't9', title: 'Configuration GitHub Actions', description: 'Complete CI/CD pipeline setup', priority: 'P0', status: 'todo', assignee: '5', effort: 1, sprintId: 'sprint-2', tags: ['ci-cd', 'devops'] },
      { id: 't10', title: 'Jobs parallèles lint, test, security', description: 'Parallel execution of quality checks', priority: 'P0', status: 'todo', assignee: '5', effort: 1, sprintId: 'sprint-2', tags: ['ci-cd', 'devops'] },
      { id: 't11', title: 'Tests intégration PostgreSQL', description: 'Integration tests with PostgreSQL service', priority: 'P0', status: 'todo', assignee: '2', effort: 1.5, sprintId: 'sprint-2', tags: ['testing', 'database'] },
      { id: 't12', title: 'Configuration Playwright E2E', description: 'E2E testing framework setup', priority: 'P0', status: 'todo', assignee: '6', effort: 1, sprintId: 'sprint-2', tags: ['testing', 'e2e'] },
      { id: 't13', title: 'Tests E2E parcours critiques', description: 'E2E tests for auth, pipeline flows', priority: 'P0', status: 'todo', assignee: '6', effort: 2, sprintId: 'sprint-2', tags: ['testing', 'e2e'] },
      { id: 't14', title: 'Deployment staging', description: 'Automatic staging deployment', priority: 'P0', status: 'todo', assignee: '5', effort: 1, sprintId: 'sprint-2', tags: ['ci-cd', 'deployment'] },
      { id: 't15', title: 'Deployment production', description: 'Production deployment workflow', priority: 'P0', status: 'todo', assignee: '5', effort: 1, sprintId: 'sprint-2', tags: ['ci-cd', 'deployment'] },
    ],
  },
  {
    id: 'sprint-3',
    name: 'Sprint 3: Migration PostgreSQL',
    status: 'planning',
    startDate: '2025-02-03',
    endDate: '2025-02-14',
    goals: [
      'Migrer la base de données de SQLite vers PostgreSQL',
      'Optimiser le schema pour les performances',
      'Configurer connection pooling et replicas',
    ],
    tasks: [
      { id: 't16', title: 'Ajustement schema.prisma', description: 'Schema adjustments for PostgreSQL', priority: 'P0', status: 'todo', assignee: '2', effort: 1, sprintId: 'sprint-3', tags: ['database', 'migration'] },
      { id: 't17', title: 'Scripts migration données', description: 'SQLite to PostgreSQL migration scripts', priority: 'P0', status: 'todo', assignee: '3', effort: 2, sprintId: 'sprint-3', tags: ['database', 'migration'] },
      { id: 't18', title: 'Configuration PgBouncer', description: 'Connection pooling setup', priority: 'P0', status: 'todo', assignee: '5', effort: 1, sprintId: 'sprint-3', tags: ['database', 'performance'] },
      { id: 't19', title: 'Ajout indexes optimisés', description: 'Optimized indexes for frequent queries', priority: 'P0', status: 'todo', assignee: '2', effort: 1, sprintId: 'sprint-3', tags: ['database', 'performance'] },
    ],
  },
  {
    id: 'sprint-4',
    name: 'Sprint 4: Monitoring & Alerting',
    status: 'planning',
    startDate: '2025-02-17',
    endDate: '2025-02-28',
    goals: [
      'Intégrer Sentry pour tracking erreurs production',
      'Configurer alertes critiques',
      'Implémenter dashboards Grafana',
    ],
    tasks: [
      { id: 't20', title: 'Intégration Sentry', description: 'Sentry integration with sourcemaps', priority: 'P0', status: 'todo', assignee: '3', effort: 1, sprintId: 'sprint-4', tags: ['monitoring', 'devops'] },
      { id: 't21', title: 'Dashboards Grafana', description: 'Latency, errors, throughput dashboards', priority: 'P0', status: 'todo', assignee: '5', effort: 1.5, sprintId: 'sprint-4', tags: ['monitoring', 'grafana'] },
      { id: 't22', title: 'Configuration PagerDuty', description: 'Incident management setup', priority: 'P1', status: 'todo', assignee: '5', effort: 0.5, sprintId: 'sprint-4', tags: ['monitoring', 'incidents'] },
    ],
  },
  {
    id: 'sprint-5',
    name: 'Sprint 5: Performance Optimization',
    status: 'planning',
    startDate: '2025-03-03',
    endDate: '2025-03-14',
    goals: [
      'Implémenter le caching Redis',
      'Optimiser les requêtes base de données',
      'Configurer CDN pour assets',
    ],
    tasks: [
      { id: 't23', title: 'Integration Redis caching', description: 'Redis for session and data caching', priority: 'P0', status: 'todo', assignee: '2', effort: 1.5, sprintId: 'sprint-5', tags: ['performance', 'redis'] },
      { id: 't24', title: 'Optimisation requêtes N+1', description: 'Fix N+1 query issues', priority: 'P0', status: 'todo', assignee: '3', effort: 1, sprintId: 'sprint-5', tags: ['performance', 'database'] },
      { id: 't25', title: 'Configuration CDN', description: 'Cloudflare/Vercel CDN setup', priority: 'P0', status: 'todo', assignee: '5', effort: 1, sprintId: 'sprint-5', tags: ['performance', 'cdn'] },
    ],
  },
  {
    id: 'sprint-6',
    name: 'Sprint 6: UX & Onboarding',
    status: 'planning',
    startDate: '2025-03-17',
    endDate: '2025-03-28',
    goals: [
      'Créer un parcours onboarding interactif',
      'Implémenter aide contextuelle',
      'Développer tutoriels vidéo',
    ],
    tasks: [
      { id: 't26', title: 'Wizard onboarding', description: 'Interactive onboarding flow', priority: 'P0', status: 'todo', assignee: '4', effort: 2, sprintId: 'sprint-6', tags: ['ux', 'onboarding'] },
      { id: 't27', title: 'Tooltips contextuels', description: 'Contextual help system', priority: 'P0', status: 'todo', assignee: '4', effort: 1, sprintId: 'sprint-6', tags: ['ux', 'help'] },
      { id: 't28', title: 'Videos tutoriels', description: 'Create tutorial videos', priority: 'P1', status: 'todo', assignee: '8', effort: 2, sprintId: 'sprint-6', tags: ['docs', 'videos'] },
    ],
  },
  {
    id: 'sprint-7',
    name: 'Sprint 7: Security Hardening',
    status: 'planning',
    startDate: '2025-03-31',
    endDate: '2025-04-11',
    goals: [
      'Réaliser un audit de sécurité complet',
      'Corriger les vulnérabilités identifiées',
      'Configurer WAF',
    ],
    tasks: [
      { id: 't29', title: 'Penetration testing', description: 'External security audit', priority: 'P0', status: 'todo', assignee: '7', effort: 2, sprintId: 'sprint-7', tags: ['security', 'audit'] },
      { id: 't30', title: 'Remediation vulnérabilités', description: 'Fix critical vulnerabilities', priority: 'P0', status: 'todo', assignee: '3', effort: 2, sprintId: 'sprint-7', tags: ['security', 'fix'] },
      { id: 't31', title: 'Configuration WAF', description: 'Cloudflare/AWS WAF setup', priority: 'P0', status: 'todo', assignee: '5', effort: 1, sprintId: 'sprint-7', tags: ['security', 'waf'] },
    ],
  },
  {
    id: 'sprint-8',
    name: 'Sprint 8: Compliance & Certification',
    status: 'planning',
    startDate: '2025-04-14',
    endDate: '2025-04-25',
    goals: [
      'Préparer la documentation SOC2',
      'Implémenter les contrôles manquants',
      'Valider la conformité RGPD',
    ],
    tasks: [
      { id: 't32', title: 'Documentation SOC2', description: 'SOC2 policy documentation', priority: 'P0', status: 'todo', assignee: '7', effort: 2, sprintId: 'sprint-8', tags: ['compliance', 'soc2'] },
      { id: 't33', title: 'Controles SOC2', description: 'Implement missing SOC2 controls', priority: 'P0', status: 'todo', assignee: '3', effort: 2, sprintId: 'sprint-8', tags: ['compliance', 'soc2'] },
      { id: 't34', title: 'Validation RGPD', description: 'GDPR compliance validation', priority: 'P0', status: 'todo', assignee: '7', effort: 1, sprintId: 'sprint-8', tags: ['compliance', 'rgpd'] },
    ],
  },
];

const risks: Risk[] = [
  { id: 'r1', title: 'Perte de membres clés', probability: 'medium', impact: 'high', mitigation: 'Knowledge sharing, documentation exhaustive, pair programming', owner: 'Tech Lead', status: 'open' },
  { id: 'r2', title: 'Retard de dépendances externes', probability: 'high', impact: 'medium', mitigation: 'Mocking pour développement, contrats d\'API', owner: 'Backend Dev', status: 'open' },
  { id: 'r3', title: 'Vulnérabilité sécurité critique', probability: 'medium', impact: 'critical', mitigation: 'Scans automatiques, audits réguliers, processus de patch urgent', owner: 'Security Engineer', status: 'open' },
  { id: 'r4', title: 'Problèmes de performance', probability: 'medium', impact: 'high', mitigation: 'Load testing, monitoring proactif, capacity planning', owner: 'DevOps', status: 'open' },
  { id: 'r5', title: 'Scope creep', probability: 'high', impact: 'medium', mitigation: 'Backlog strict, PO gate, change management process', owner: 'Product Owner', status: 'open' },
  { id: 'r6', title: 'Migration DB échec', probability: 'medium', impact: 'critical', mitigation: 'Plan rollback, tests extensifs, migration progressive', owner: 'Backend Dev', status: 'open' },
];

// Helper functions
const getStatusColor = (status: TaskStatus | SprintStatus) => {
  const colors: Record<string, string> = {
    todo: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    review: 'bg-yellow-500',
    done: 'bg-green-500',
    blocked: 'bg-red-500',
    planning: 'bg-purple-500',
    active: 'bg-blue-500',
    completed: 'bg-green-500',
  };
  return colors[status] || 'bg-gray-500';
};

const getStatusLabel = (status: TaskStatus | SprintStatus) => {
  const labels: Record<string, string> = {
    todo: 'À faire',
    in_progress: 'En cours',
    review: 'En revue',
    done: 'Terminé',
    blocked: 'Bloqué',
    planning: 'Planification',
    active: 'Actif',
    completed: 'Terminé',
  };
  return labels[status] || status;
};

const getPriorityColor = (priority: TaskPriority) => {
  const colors: Record<TaskPriority, string> = {
    P0: 'bg-red-500',
    P1: 'bg-orange-500',
    P2: 'bg-yellow-500',
    P3: 'bg-gray-500',
  };
  return colors[priority];
};

const getRiskImpactColor = (impact: Risk['impact']) => {
  const colors: Record<Risk['impact'], string> = {
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
  };
  return colors[impact];
};

const getTeamMember = (id: string) => teamMembers.find(m => m.id === id);

export default function ProjectManagementDashboard() {
  const [activeTab, setActiveTab] = useState('sprints');
  const [selectedSprint, setSelectedSprint] = useState<Sprint>(sprints[0]);

  const calculateSprintProgress = (sprint: Sprint) => {
    const totalTasks = sprint.tasks.length;
    const doneTasks = sprint.tasks.filter(t => t.status === 'done').length;
    return totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  };

  const calculateVelocity = () => [65, 72, 68, 75, 80, 78, 82];

  const calculateBurndown = (sprint: Sprint) => {
    const totalEffort = sprint.tasks.reduce((sum, t) => sum + t.effort, 0);
    const remainingEffort = sprint.tasks.filter(t => t.status !== 'done').reduce((sum, t) => sum + t.effort, 0);
    return { total: totalEffort, remaining: remainingEffort };
  };

  const sprintProgress = calculateSprintProgress(selectedSprint);
  const burndown = calculateBurndown(selectedSprint);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">DataSphere Innovation</h1>
              <p className="text-xs text-gray-500">Project Management Dashboard • Phase 2</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <Activity className="h-3 w-3 mr-1" />
              Sprint 1 Actif
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Sprint Actuel</p>
                  <p className="text-2xl font-bold text-white">{sprintProgress}%</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedSprint?.name}</p>
                </div>
                <div className="p-3 bg-blue-900/50 rounded-lg">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <Progress value={sprintProgress} className="h-2 mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Tâches Totales</p>
                  <p className="text-2xl font-bold text-white">{selectedSprint?.tasks.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedSprint?.tasks.filter(t => t.status === 'done').length || 0} terminées
                  </p>
                </div>
                <div className="p-3 bg-purple-900/50 rounded-lg">
                  <ListTodo className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Effort Restant</p>
                  <p className="text-2xl font-bold text-white">{burndown.remaining}j</p>
                  <p className="text-xs text-gray-500 mt-1">sur {burndown.total}j total</p>
                </div>
                <div className="p-3 bg-orange-900/50 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Équipe</p>
                  <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
                  <p className="text-xs text-gray-500 mt-1">membres actifs</p>
                </div>
                <div className="p-3 bg-green-900/50 rounded-lg">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Risques Ouverts</p>
                  <p className="text-2xl font-bold text-white">{risks.filter(r => r.status === 'open').length}</p>
                  <p className="text-xs text-gray-500 mt-1">à mitiger</p>
                </div>
                <div className="p-3 bg-red-900/50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
            <TabsTrigger value="sprints" className="data-[state=active]:bg-emerald-600">
              <Calendar className="h-4 w-4 mr-2" />
              Sprints
            </TabsTrigger>
            <TabsTrigger value="backlog" className="data-[state=active]:bg-emerald-600">
              <ListTodo className="h-4 w-4 mr-2" />
              Backlog
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-emerald-600">
              <Users className="h-4 w-4 mr-2" />
              Équipe
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-emerald-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Métriques
            </TabsTrigger>
            <TabsTrigger value="risks" className="data-[state=active]:bg-emerald-600">
              <Shield className="h-4 w-4 mr-2" />
              Risques
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab Content */}
        <div className="mt-4">
          {/* Sprints Tab */}
          {activeTab === 'sprints' && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Sprint List */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Roadmap Sprints</CardTitle>
                    <CardDescription className="text-gray-400">
                      8 Sprints • 16 Semaines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      {sprints.map((sprint) => (
                        <div
                          key={sprint.id}
                          className={`p-4 border-b border-gray-700 cursor-pointer transition-all hover:bg-gray-700/50 ${
                            selectedSprint?.id === sprint.id ? 'bg-emerald-900/30 border-l-4 border-l-emerald-500' : ''
                          }`}
                          onClick={() => setSelectedSprint(sprint)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">{sprint.name}</span>
                            <Badge className={`${getStatusColor(sprint.status)} text-white text-xs`}>
                              {getStatusLabel(sprint.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <Calendar className="h-3 w-3" />
                            {sprint.startDate} → {sprint.endDate}
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={calculateSprintProgress(sprint)} 
                              className="h-1.5 flex-1" 
                            />
                            <span className="text-xs text-gray-400 w-10 text-right">
                              {calculateSprintProgress(sprint)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Sprint Details */}
              <div className="lg:col-span-2">
                {/* Sprint Goals */}
                <Card className="bg-gray-800/50 border-gray-700 mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">{selectedSprint.name}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {selectedSprint.startDate} - {selectedSprint.endDate}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(selectedSprint.status)} text-white`}>
                        {getStatusLabel(selectedSprint.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="text-sm font-medium text-white mb-3">Objectifs du Sprint</h4>
                    <ul className="space-y-2">
                      {selectedSprint.goals.map((goal, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <Target className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Task Board */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">Tableau des Tâches</CardTitle>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {selectedSprint.tasks.filter(t => t.status === 'done').length}/{selectedSprint.tasks.length} terminées
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      {/* Todo Column */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-gray-500" />
                          <span className="text-sm font-medium text-gray-300">À faire</span>
                          <Badge variant="outline" className="ml-auto border-gray-600 text-gray-400 text-xs">
                            {selectedSprint.tasks.filter(t => t.status === 'todo').length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {selectedSprint.tasks.filter(t => t.status === 'todo').map(task => (
                            <Card key={task.id} className="bg-gray-900/50 border-gray-700 p-3">
                              <div className="flex items-start justify-between mb-2">
                                <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                                  {task.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">{task.effort}j</span>
                              </div>
                              <p className="text-sm text-white mb-2">{task.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getTeamMember(task.assignee)?.avatar}</span>
                                <span className="text-xs text-gray-400">{getTeamMember(task.assignee)?.name}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* In Progress Column */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-sm font-medium text-gray-300">En cours</span>
                          <Badge variant="outline" className="ml-auto border-gray-600 text-gray-400 text-xs">
                            {selectedSprint.tasks.filter(t => t.status === 'in_progress').length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {selectedSprint.tasks.filter(t => t.status === 'in_progress').map(task => (
                            <Card key={task.id} className="bg-blue-900/20 border-blue-700/50 p-3">
                              <div className="flex items-start justify-between mb-2">
                                <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                                  {task.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">{task.effort}j</span>
                              </div>
                              <p className="text-sm text-white mb-2">{task.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getTeamMember(task.assignee)?.avatar}</span>
                                <span className="text-xs text-gray-400">{getTeamMember(task.assignee)?.name}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Review Column */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-sm font-medium text-gray-300">En revue</span>
                          <Badge variant="outline" className="ml-auto border-gray-600 text-gray-400 text-xs">
                            {selectedSprint.tasks.filter(t => t.status === 'review').length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {selectedSprint.tasks.filter(t => t.status === 'review').map(task => (
                            <Card key={task.id} className="bg-yellow-900/20 border-yellow-700/50 p-3">
                              <div className="flex items-start justify-between mb-2">
                                <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                                  {task.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">{task.effort}j</span>
                              </div>
                              <p className="text-sm text-white mb-2">{task.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getTeamMember(task.assignee)?.avatar}</span>
                                <span className="text-xs text-gray-400">{getTeamMember(task.assignee)?.name}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Done Column */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm font-medium text-gray-300">Terminé</span>
                          <Badge variant="outline" className="ml-auto border-gray-600 text-gray-400 text-xs">
                            {selectedSprint.tasks.filter(t => t.status === 'done').length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {selectedSprint.tasks.filter(t => t.status === 'done').map(task => (
                            <Card key={task.id} className="bg-green-900/20 border-green-700/50 p-3 opacity-75">
                              <div className="flex items-start justify-between mb-2">
                                <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                                  {task.priority}
                                </Badge>
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              </div>
                              <p className="text-sm text-white mb-2 line-through">{task.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getTeamMember(task.assignee)?.avatar}</span>
                                <span className="text-xs text-gray-400">{getTeamMember(task.assignee)?.name}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="grid gap-4 md:grid-cols-3">
              {teamMembers.map(member => (
                <Card key={member.id} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{member.avatar}</span>
                      <div>
                        <h3 className="font-medium text-white">{member.name}</h3>
                        <p className="text-sm text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Charge actuelle</span>
                        <span className={`font-medium ${member.currentLoad > 70 ? 'text-orange-400' : 'text-green-400'}`}>
                          {member.currentLoad}%
                        </span>
                      </div>
                      <Progress 
                        value={member.currentLoad} 
                        className={`h-2 ${member.currentLoad > 70 ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
                      />
                      <p className="text-xs text-gray-500">
                        {member.currentLoad > 70 ? '⚠️ Charge élevée' : '✓ Charge équilibrée'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Velocity Chart */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Vélocité
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Points par sprint
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-40">
                    {calculateVelocity().map((velocity, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-400"
                          style={{ height: `${velocity * 1.2}px` }}
                        />
                        <span className="text-xs text-gray-500">S{index + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Moyenne</p>
                      <p className="text-lg font-bold text-white">
                        {Math.round(calculateVelocity().reduce((a, b) => a + b, 0) / calculateVelocity().length)} pts
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">+8% vs prev</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Burndown Chart */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-blue-400" />
                    Burndown Sprint
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Évolution de l'effort restant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-40">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                      <line x1="0" y1="0" x2="200" y2="100" stroke="#6B7280" strokeWidth="2" strokeDasharray="5,5" />
                      <polyline
                        points="0,0 28,18 56,30 84,35 112,50 140,65 168,80 196,90"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="border-t border-gray-700/50" />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Effort restant</p>
                      <p className="text-lg font-bold text-white">{burndown.remaining}j</p>
                    </div>
                    <Badge className="bg-emerald-600 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      On Track
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Metrics */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    Qualité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Test Coverage</span>
                        <span className="text-white font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Code Quality Score</span>
                        <span className="text-white font-medium">92/100</span>
                      </div>
                      <Progress value={92} className="h-2 [&>div]:bg-purple-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Security Score</span>
                        <span className="text-white font-medium">88/100</span>
                      </div>
                      <Progress value={88} className="h-2 [&>div]:bg-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sprint Health */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-cyan-400" />
                    Santé du Sprint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-400">
                        {selectedSprint?.tasks.filter(t => t.status === 'done').length || 0}
                      </p>
                      <p className="text-xs text-gray-400">Complétées</p>
                    </div>
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-400">
                        {selectedSprint?.tasks.filter(t => t.status === 'in_progress').length || 0}
                      </p>
                      <p className="text-xs text-gray-400">En cours</p>
                    </div>
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-400">
                        {selectedSprint?.tasks.filter(t => t.status === 'todo').length || 0}
                      </p>
                      <p className="text-xs text-gray-400">À faire</p>
                    </div>
                    <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <p className="text-2xl font-bold text-red-400">
                        {selectedSprint?.tasks.filter(t => t.status === 'blocked').length || 0}
                      </p>
                      <p className="text-xs text-gray-400">Bloquées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Risks Tab */}
          {activeTab === 'risks' && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-400" />
                  Registre des Risques
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Identification et mitigation des risques projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Risque</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Probabilité</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Impact</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Mitigation</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Owner</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {risks.map(risk => (
                        <tr key={risk.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-3 px-4">
                            <p className="text-sm text-white">{risk.title}</p>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="outline" className={`border-gray-600 ${
                              risk.probability === 'high' ? 'text-red-400' :
                              risk.probability === 'medium' ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {risk.probability === 'high' ? 'Élevée' : risk.probability === 'medium' ? 'Moyenne' : 'Faible'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="outline" className={`border-gray-600 ${getRiskImpactColor(risk.impact)}`}>
                              {risk.impact === 'critical' ? 'Critique' :
                               risk.impact === 'high' ? 'Élevé' :
                               risk.impact === 'medium' ? 'Moyen' : 'Faible'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-xs text-gray-300 max-w-xs">{risk.mitigation}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-400">{risk.owner}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={
                              risk.status === 'resolved' ? 'bg-green-600' :
                              risk.status === 'mitigating' ? 'bg-yellow-600' : 'bg-red-600'
                            }>
                              {risk.status === 'resolved' ? 'Résolu' :
                               risk.status === 'mitigating' ? 'En cours' : 'Ouvert'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Backlog Tab */}
          {activeTab === 'backlog' && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Product Backlog</CardTitle>
                    <CardDescription className="text-gray-400">
                      Tâches priorisées pour les prochains sprints
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <ListTodo className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {sprints.filter(s => s.status === 'planning').flatMap(s => s.tasks).map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all"
                      >
                        <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                          {task.priority}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm text-white">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            {task.effort}j
                          </Badge>
                          <span className="text-lg">{getTeamMember(task.assignee)?.avatar}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
