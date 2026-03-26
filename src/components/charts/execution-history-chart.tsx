'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ExecutionData {
  day: string;
  completed: number;
  failed: number;
  running: number;
}

interface ExecutionHistoryChartProps {
  data?: ExecutionData[];
  title?: string;
  description?: string;
}

const defaultData: ExecutionData[] = [
  { day: 'Mon', completed: 12, failed: 2, running: 1 },
  { day: 'Tue', completed: 18, failed: 1, running: 2 },
  { day: 'Wed', completed: 15, failed: 3, running: 0 },
  { day: 'Thu', completed: 22, failed: 1, running: 1 },
  { day: 'Fri', completed: 19, failed: 0, running: 2 },
  { day: 'Sat', completed: 8, failed: 1, running: 0 },
  { day: 'Sun', completed: 5, failed: 0, running: 0 },
];

export function ExecutionHistoryChart({
  data = defaultData,
  title = 'Agent Execution History',
  description = 'Last 7 days of agent executions',
}: ExecutionHistoryChartProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
        <CardDescription className="text-xs text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 12 }} stroke="#4B5563" />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} stroke="#4B5563" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => (
                  <span className="text-xs text-gray-400">{value}</span>
                )}
              />
              <Bar dataKey="completed" name="Completed" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="running" name="Running" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" name="Failed" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
