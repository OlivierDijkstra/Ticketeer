'use client';

import formatMoney from '@repo/lib';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import type { ChartConfig } from '@/components//ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components//ui/chart';
import ChartCard from '@/components/charts/chart-card';
import type { DateRanges } from '@/components/charts/lib';
import {
  determineDateFormat,
  determineGranularity,
} from '@/components/charts/lib';
import Spinner from '@/components/spinner';
import { DATE_RANGES, DEFAULT_CHART_ANIMATION_DURATION } from '@/lib/constants';
import type { AggregatedDataConfig } from '@/server/actions/aggregated-data';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

const chartConfig = {
  value: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function RevenueChart() {
  const defaultDateRange = DATE_RANGES[0] as DateRanges;
  const defaultGranularity = determineGranularity(defaultDateRange);
  const defaultQuery: AggregatedDataConfig = {
    modelType: 'Order',
    aggregationType: 'sum',
    granularity: defaultGranularity,
    dateRange: defaultDateRange,
  };

  const [query, setQuery] = useState<AggregatedDataConfig>(defaultQuery);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['revenueData', query],
    queryFn: () => fetchAggregatedData(query),
    refetchOnWindowFocus: false,
  });

  const timeFormat = useMemo(
    () => determineDateFormat(query.granularity),
    [query.granularity]
  );

  async function handleDateRangeChange(dateRange: DateRanges) {
    const newGranularity = determineGranularity(dateRange);
    const newQuery = {
      ...query,
      granularity: newGranularity,
      dateRange: dateRange,
    };

    setQuery(newQuery);
    refetch();
  }

  return (
    <ChartCard
      title='Revenue'
      dateRange={defaultDateRange}
      onDateRangeChange={handleDateRangeChange}
    >
      {isLoading && (
        <div className='absolute inset-0 z-10 grid h-full w-full place-items-center'>
          <Spinner />
        </div>
      )}

      <ChartContainer config={chartConfig} className='w-full'>
        <AreaChart
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
            dataKey='x'
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              return new Date(value).toLocaleDateString(
                process.env.NEXT_PUBLIC_LOCALE,
                timeFormat
              );
            }}
          />

          <defs>
            <linearGradient id='fillValue' x1='0' y1='0' x2='0' y2='1'>
              <stop
                offset='5%'
                stopColor='var(--color-value)'
                stopOpacity={0.8}
              />
              <stop
                offset='95%'
                stopColor='var(--color-value)'
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>

          <Area
            dataKey='value'
            type='natural'
            animationDuration={DEFAULT_CHART_ANIMATION_DURATION}
            fill='url(#fillValue)'
            fillOpacity={0.4}
            stroke='var(--color-value)'
            strokeWidth={2}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className='flex min-w-[130px] items-center text-xs text-muted-foreground'>
                    {chartConfig[name as keyof typeof chartConfig]?.label ||
                      name}
                    <div className='ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground'>
                      {formatMoney(value as string)}
                    </div>
                  </div>
                )}
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString(
                    process.env.NEXT_PUBLIC_LOCALE,
                    timeFormat
                  );
                }}
              />
            }
            cursor={false}
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}
