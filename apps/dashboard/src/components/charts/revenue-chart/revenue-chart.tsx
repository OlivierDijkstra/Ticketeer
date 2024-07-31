'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components//ui/chart';

export default function RevenueChart({
  data,
}: {
  data: { name: string; revenue: number }[];
}) {
  return (
    <ChartContainer
      config={{
        revenue: {
          label: 'Revenue',
          color: 'hsl(var(--chart-1))',
        },
      }}
      className='w-full'
    >
      <LineChart
        accessibilityLayer
        margin={{
          left: 14,
          right: 14,
          top: 10,
        }}
        data={data}
      >
        <CartesianGrid
          strokeDasharray='4 4'
          vertical={false}
          stroke='hsl(var(--muted-foreground))'
          strokeOpacity={0.5}
        />
        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
        <XAxis
          dataKey='name'
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            return new Date(value).toLocaleDateString('en-US', {
              month: 'short',
            });
          }}
        />
        <Line
          dataKey='revenue'
          type='natural'
          fill='var(--color-revenue)'
          stroke='var(--color-revenue)'
          strokeWidth={2}
          dot={false}
          activeDot={{
            fill: 'var(--color-revenue)',
            stroke: 'var(--color-revenue)',
            r: 4,
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator='line'
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString('en-US', {
                  month: 'long',
                });
              }}
            />
          }
          cursor={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
