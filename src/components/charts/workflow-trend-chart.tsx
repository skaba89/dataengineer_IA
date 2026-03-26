'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type TrendData = {
  week: string;
  completed: number;
  inProgress: number;
  failed: number;
};

const mockData: TrendData[] = [
  { week: 'S1', completed: 2, inProgress: 1, failed: 0 },
  { week: 'S2', completed: 3, inProgress: 2, failed: 1 },
  { week: 'S3', completed: 5, inProgress: 1, failed: 0 },
  { week: 'S4', completed: 4, inProgress: 3, failed: 1 },
  { week: 'S5', completed: 7, inProgress: 2, failed: 0 },
  { week: 'S6', completed: 6, inProgress: 4, failed: 2 },
];

export function WorkflowTrendChart({ data = mockData }: { data?: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="completed"
          name="Complétés"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: '#10B981', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="inProgress"
          name="En cours"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: '#3B82F6', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="failed"
          name="Échecs"
          stroke="#EF4444"
          strokeWidth={2}
          dot={{ fill: '#EF4444', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
