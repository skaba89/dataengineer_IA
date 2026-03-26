'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

type IndustryData = {
  name: string;
  value: number;
  color: string;
};

const mockData: IndustryData[] = [
  { name: 'Retail & E-commerce', value: 35, color: '#3B82F6' },
  { name: 'Finance', value: 25, color: '#10B981' },
  { name: 'SaaS & Tech', value: 20, color: '#8B5CF6' },
  { name: 'Santé', value: 10, color: '#F59E0B' },
  { name: 'Industrie', value: 7, color: '#EF4444' },
  { name: 'Logistique', value: 3, color: '#EC4899' },
];

export function IndustryDistributionChart({ data = mockData }: { data?: IndustryData[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            color: '#F9FAFB',
          }}
          formatter={(value: number) => [`${value}%`, 'Part']}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
