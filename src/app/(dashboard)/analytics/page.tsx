'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Activity,
  Zap,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  Building2,
  Database,
  Cpu,
  Gauge
} from 'lucide-react'

const analyticsData = {
  revenue: {
    mrr: 127500,
    mrrGrowth: 12.5,
    arr: 1530000,
    arrGrowth: 18.2,
    churnRate: 2.3,
    arpu: 425,
  },
  users: {
    total: 2847,
    active: 1892,
    newThisMonth: 234,
    churnedThisMonth: 45,
    byPlan: {
      starter: 1245,
      professional: 892,
      enterprise: 156,
      agency: 554,
    },
    byIndustry: {
      retail: 642,
      finance: 534,
      healthcare: 423,
      saas: 512,
      manufacturing: 398,
      logistics: 338,
    },
  },
  usage: {
    projectsCreated: 1245,
    pipelinesGenerated: 3421,
    executionsRun: 89234,
    dataProcessedTB: 12.4,
    apiCalls: 2456789,
    qualityTestsRun: 15678,
  },
  performance: {
    avgExecutionTime: 23.5,
    successRate: 98.7,
    avgResponseTime: 145,
    uptime: 99.97,
  },
  trends: {
    revenue: [
      { month: 'Jan', value: 98000 },
      { month: 'Fév', value: 105000 },
      { month: 'Mar', value: 108500 },
      { month: 'Avr', value: 112000 },
      { month: 'Mai', value: 118500 },
      { month: 'Juin', value: 127500 },
    ],
    users: [
      { month: 'Jan', value: 2100 },
      { month: 'Fév', value: 2250 },
      { month: 'Mar', value: 2420 },
      { month: 'Avr', value: 2580 },
      { month: 'Mai', value: 2710 },
      { month: 'Juin', value: 2847 },
    ],
    executions: [
      { month: 'Jan', value: 52000 },
      { month: 'Fév', value: 58000 },
      { month: 'Mar', value: 65000 },
      { month: 'Avr', value: 72000 },
      { month: 'Mai', value: 81000 },
      { month: 'Juin', value: 89234 },
    ],
  },
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  prefix = '', 
  suffix = '' 
}: { 
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  prefix?: string
  suffix?: string
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
          </div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${
            changeType === 'positive' ? 'text-green-500' : 
            changeType === 'negative' ? 'text-red-500' : 'text-muted-foreground'
          }`}>
            {changeType === 'positive' ? <ArrowUpRight className="h-4 w-4" /> : 
             changeType === 'negative' ? <ArrowDownRight className="h-4 w-4" /> : null}
            <span className="text-sm font-medium">{change}%</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

const MiniChart = ({ data, color = '#667eea' }: { data: { month: string; value: number }[]; color?: string }) => {
  const max = Math.max(...data.map(d => d.value))
  const height = 60
  
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full rounded-t"
            style={{ 
              height: `${(d.value / max) * height}px`,
              backgroundColor: color,
              opacity: 0.7 + (i / data.length) * 0.3,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedIndustry, setSelectedIndustry] = useState('all')

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Business metrics and performance insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Exporter</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="MRR" value={analyticsData.revenue.mrr} change={analyticsData.revenue.mrrGrowth} changeType="positive" icon={DollarSign} prefix="€" />
          <MetricCard title="ARR" value={analyticsData.revenue.arr} change={analyticsData.revenue.arrGrowth} changeType="positive" icon={TrendingUp} prefix="€" />
          <MetricCard title="ARPU" value={analyticsData.revenue.arpu} icon={Target} prefix="€" />
          <MetricCard title="Churn Rate" value={analyticsData.revenue.churnRate} changeType="negative" icon={TrendingDown} suffix="%" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Utilisateurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Users" value={analyticsData.users.total} change={8.5} changeType="positive" icon={Users} />
          <MetricCard title="Active Users" value={analyticsData.users.active} icon={Activity} />
          <MetricCard title="New This Month" value={analyticsData.users.newThisMonth} changeType="positive" icon={Zap} />
          <MetricCard title="Churned" value={analyticsData.users.churnedThisMonth} changeType="negative" icon={TrendingDown} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="industries">Industries</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly recurring revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniChart data={analyticsData.trends.revenue} color="#10b981" />
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  {analyticsData.trends.revenue.map(d => <span key={d.month}>{d.month}</span>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  User Growth
                </CardTitle>
                <CardDescription>Total users by month</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniChart data={analyticsData.trends.users} color="#667eea" />
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  {analyticsData.trends.users.map(d => <span key={d.month}>{d.month}</span>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Pipeline Executions
                </CardTitle>
                <CardDescription>Monthly execution count</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniChart data={analyticsData.trends.executions} color="#f59e0b" />
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  {analyticsData.trends.executions.map(d => <span key={d.month}>{d.month}</span>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Calls (M)</span>
                    <span className="font-medium">{(analyticsData.usage.apiCalls / 1000000).toFixed(1)}M</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quality Tests Run</span>
                    <span className="font-medium">{analyticsData.usage.qualityTestsRun.toLocaleString()}</span>
                  </div>
                  <Progress value={62} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(analyticsData.users.byPlan).map(([plan, count]) => {
              const planColors: Record<string, string> = { starter: 'bg-blue-500', professional: 'bg-purple-500', enterprise: 'bg-orange-500', agency: 'bg-green-500' }
              const planPrices: Record<string, number> = { starter: 499, professional: 1499, enterprise: 4999, agency: 2999 }
              return (
                <Card key={plan}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{plan}</CardTitle>
                      <Badge className={planColors[plan]}>€{planPrices[plan]}/mois</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{count}</div>
                    <p className="text-sm text-muted-foreground">utilisateurs</p>
                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="text-lg font-semibold">€{(count * planPrices[plan]).toLocaleString()}/mois</div>
                    </div>
                    <Progress value={(count / analyticsData.users.total) * 100} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="industries" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(analyticsData.users.byIndustry).map(([industry, count]) => {
              const industryIcons: Record<string, React.ElementType> = { retail: Building2, finance: DollarSign, healthcare: Activity, saas: Cpu, manufacturing: Database, logistics: Zap }
              const Icon = industryIcons[industry] || Building2
              return (
                <Card key={industry}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg"><Icon className="h-6 w-6 text-primary" /></div>
                      <div>
                        <h3 className="font-semibold capitalize">{industry}</h3>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm text-muted-foreground">{((count / analyticsData.users.total) * 100).toFixed(1)}% of users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Avg Execution Time" value={analyticsData.performance.avgExecutionTime} icon={Clock} suffix="s" />
            <MetricCard title="Success Rate" value={analyticsData.performance.successRate} icon={Target} suffix="%" />
            <MetricCard title="Avg Response Time" value={analyticsData.performance.avgResponseTime} icon={Gauge} suffix="ms" />
            <MetricCard title="Uptime" value={analyticsData.performance.uptime} icon={Activity} suffix="%" />
          </div>
          <Card>
            <CardHeader><CardTitle>System Performance</CardTitle><CardDescription>Real-time system health metrics</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200"><div className="flex items-center gap-2 text-green-700"><div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />API Status: Operational</div></div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200"><div className="flex items-center gap-2 text-green-700"><div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />Database: Healthy</div></div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200"><div className="flex items-center gap-2 text-green-700"><div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />Queue: Normal</div></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
