'use client';

import formatMoney from '@repo/lib';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import type { ChartConfig } from '@/components//ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components//ui/chart';
import ChartCard from '@/components/charts/chart-card';
import type { DateRanges } from '@/components/charts/lib';
import type { ResultSet } from '@/components/charts/lib';
import {
  determineDateFormat,
  determineGranularity,
} from '@/components/charts/lib';
import Spinner from '@/components/spinner';
import { DATE_RANGES, DEFAULT_CHART_ANIMATION_DURATION } from '@/lib/constants';
import {
  type AggregatedDataConfig,
  fetchAggregatedData,
} from '@/server/actions/aggregated-data';

const chartConfig = {
  value: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function RevenueChart() {
  const defaultDateRange = DATE_RANGES[0] as DateRanges;
  const defaultGranularity = determineGranularity(defaultDateRange);

  const [query, setQuery] = useState<AggregatedDataConfig>({
    modelType: 'Revenue',
    aggregationType: 'count',
    granularity: defaultGranularity,
    dateRange: defaultDateRange,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [resultSet, setResultSet] = useState<ResultSet>([]);

  const timeFormat = useMemo(
    () => determineDateFormat(query.granularity),
    [query.granularity]
  );

  const memoizedHandleDataFetch = useCallback(async () => {
    setIsLoading(true);
    const resultSet = await fetchAggregatedData(query);
    setResultSet(resultSet);
    setIsLoading(false);
  }, [query]);

  useEffect(() => {
    memoizedHandleDataFetch();
  }, [memoizedHandleDataFetch]);

  async function handleDateRangeChange(dateRange: DateRanges) {
    const newGranularity = determineGranularity(dateRange);
    setQuery({
      ...query,
      granularity: newGranularity,
      dateRange: dateRange,
    });
  }

  return (
    <ChartCard
      title='Revenue'
      dateRange={defaultDateRange}
      onDateRangeChange={handleDateRangeChange}
    >
      {isLoading && (
        <div className='absolute inset-0 z-10 grid h-full w-full place-items-center bg-white/50 dark:bg-black/50'>
          <Spinner />
        </div>
      )}

      <ChartContainer config={chartConfig} className='w-full'>
        <LineChart
          accessibilityLayer
          margin={{
            left: 14,
            right: 14,
            top: 10,
          }}
          data={resultSet}
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
          <Line
            dataKey='value'
            type='monotone'
            animationDuration={DEFAULT_CHART_ANIMATION_DURATION}
            fill='var(--color-value)'
            stroke='var(--color-value)'
            strokeWidth={2}
            dot={false}
            activeDot={{
              fill: 'var(--color-value)',
              stroke: 'var(--color-value)',
              r: 4,
            }}
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
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}
