'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart, ResponsiveContainer, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

// Sample data for charts
const executionData = [
  { name: 'Mon', completed: 12, failed: 2 },
  { name: 'Tue', completed: 15, failed: 1 },
  { name: 'Wed', completed: 18, failed: 3 },
  { name: 'Thu', completed: 14, failed: 0 },
  { name: 'Fri', completed: 20, failed: 2 },
  { name: 'Sat', completed: 8, failed: 1 },
  { name: 'Sun', completed: 5, failed: 0 },
];

const projectDistribution = [
  { name: 'Retail', value: 35, color: '#3b82f6' },
  { name: 'Finance', value: 25, color: '#8b5cf6' },
  { name: 'Healthcare', value: 20, color: '#10b981' },
  { name: 'SaaS', value: 12, color: '#f59e0b' },
  { name: 'Other', value: 8, color: '#6b7280' },
];

const workflowTrend = [
  { month: 'Jan', projects: 5, success: 4 },
  { month: 'Feb', projects: 8, success: 7 },
  { month: 'Mar', projects: 12, success: 11 },
  { month: 'Apr', projects: 15, success: 14 },
  { month: 'May', projects: 18, success: 17 },
  { month: 'Jun', projects: 22, success: 20 },
];

const agentExecutionData = [
  { agent: 'Discovery', avgTime: 45 },
  { agent: 'Architecture', avgTime: 32 },
  { agent: 'Pipeline', avgTime: 58 },
  { agent: 'Transform', avgTime: 42 },
  { agent: 'BI', avgTime: 28 },
];

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
};

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function ExecutionHistoryChart() {
  return (
    <ChartCard title="Execution History (Last 7 Days)">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={executionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Legend />
          <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
          <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ProjectDistributionChart() {
  return (
    <ChartCard title="Projects by Industry">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={projectDistribution}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {projectDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function IndustryDistributionChart() {
  return (
    <ChartCard title="Industry Distribution">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={projectDistribution} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" />
          <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {projectDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function WorkflowTrendChart() {
  return (
    <ChartCard title="Workflow Trends">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={workflowTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="projects" 
            stroke="#3b82f6" 
            name="Total Projects" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6' }}
          />
          <Line 
            type="monotone" 
            dataKey="success" 
            stroke="#10b981" 
            name="Successful" 
            strokeWidth={2}
            dot={{ fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function AgentExecutionChart() {
  return (
    <ChartCard title="Avg. Execution Time by Agent (seconds)">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={agentExecutionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="agent" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Bar dataKey="avgTime" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
