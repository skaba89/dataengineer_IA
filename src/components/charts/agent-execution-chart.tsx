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

type ExecutionData = {
  date: string;
  business: number;
  discovery: number;
  architecture: number;
  pipeline: number;
  transformation: number;
  bi: number;
};

const mockData: ExecutionData[] = [
  { date: 'Lun', business: 2, discovery: 1, architecture: 1, pipeline: 0, transformation: 0, bi: 0 },
  { date: 'Mar', business: 1, discovery: 2, architecture: 2, pipeline: 1, transformation: 0, bi: 0 },
  { date: 'Mer', business: 0, discovery: 1, architecture: 1, pipeline: 3, transformation: 2, bi: 0 },
  { date: 'Jeu', business: 1, discovery: 0, architecture: 0, pipeline: 2, transformation: 3, bi: 1 },
  { date: 'Ven', business: 2, discovery: 2, architecture: 1, pipeline: 1, transformation: 1, bi: 2 },
  { date: 'Sam', business: 0, discovery: 0, architecture: 0, pipeline: 0, transformation: 0, bi: 0 },
  { date: 'Dim', business: 0, discovery: 0, architecture: 0, pipeline: 0, transformation: 0, bi: 0 },
];

const colors = {
  business: '#3B82F6',
  discovery: '#10B981',
  architecture: '#8B5CF6',
  pipeline: '#F59E0B',
  transformation: '#EF4444',
  bi: '#EC4899',
};

export function AgentExecutionChart({ data = mockData }: { data?: ExecutionData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
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
        <Bar dataKey="business" name="Business" fill={colors.business} stackId="a" />
        <Bar dataKey="discovery" name="Discovery" fill={colors.discovery} stackId="a" />
        <Bar dataKey="architecture" name="Architecture" fill={colors.architecture} stackId="a" />
        <Bar dataKey="pipeline" name="Pipeline" fill={colors.pipeline} stackId="a" />
        <Bar dataKey="transformation" name="Transform" fill={colors.transformation} stackId="a" />
        <Bar dataKey="bi" name="BI" fill={colors.bi} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
