'use client';

import formatMoney from '@repo/lib';
import { format } from 'date-fns';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

import GraphTooltip from '@/components/graphs/graph-tooltip';
import { useGraphColors } from '@/lib/hooks';
import type { DataPoint } from '@/lib/statistics';

export default function LineGraph({ data }: { data: DataPoint[] }) {
  const { primary } = useGraphColors();

  const statistics = data.map((point) => ({
    name: format(new Date(point.start), 'dd MMM yyyy'),
    revenue: point.increments,
  }));

  return (
    <ResponsiveContainer width='100%' height={300} debounce={50}>
      <LineChart data={statistics}>
        <XAxis dataKey='name' axisLine={false} tickLine={false} />

        <Tooltip
          content={
            <GraphTooltip formatter={(value: number) => formatMoney(value)} />
          }
        />

        <Line
          type='monotone'
          strokeWidth={2}
          dataKey='revenue'
          stroke={primary}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
