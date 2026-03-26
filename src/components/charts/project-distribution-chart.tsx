'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProjectData {
  name: string;
  value: number;
  color: string;
}

interface ProjectDistributionChartProps {
  data?: ProjectData[];
  title?: string;
  description?: string;
}

const defaultData: ProjectData[] = [
  { name: 'Retail & E-commerce', value: 35, color: '#3B82F6' },
  { name: 'Financial Services', value: 25, color: '#8B5CF6' },
  { name: 'Healthcare', value: 18, color: '#22C55E' },
  { name: 'Manufacturing', value: 12, color: '#F59E0B' },
  { name: 'SaaS & Technology', value: 7, color: '#EC4899' },
  { name: 'Other', value: 3, color: '#6B7280' },
];

export function ProjectDistributionChart({
  data = defaultData,
  title = 'Project Distribution',
  description = 'By industry',
}: ProjectDistributionChartProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
        <CardDescription className="text-xs text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                }}
                formatter={(value: number) => [`${value} projects`, 'Count']}
              />
              <Legend
                wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }}
                formatter={(value) => (
                  <span className="text-xs text-gray-400">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
