'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
import type { AggregatedDataConfig } from '@/server/actions/aggregated-data';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

export default function CustomersChart() {
  const defaultDateRange = DATE_RANGES[2] as DateRanges;
  const defaultGranularity = determineGranularity(defaultDateRange);

  const [query, setQuery] = useState<AggregatedDataConfig>({
    modelType: 'Customer',
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
      title='New customers'
      dateRange={defaultDateRange}
      onDateRangeChange={handleDateRangeChange}
    >
      {isLoading && (
        <div className='absolute inset-0 z-10 grid h-full w-full place-items-center bg-white/50 dark:bg-black/50'>
          <Spinner />
        </div>
      )}

      <ChartContainer
        config={{
          value: {
            label: 'Customers',
            color: 'hsl(var(--chart-1))',
          },
        }}
        className='w-full'
      >
        <BarChart
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
          <YAxis hide />
          <XAxis
            dataKey='x'
            tickLine={true}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              return new Date(value).toLocaleDateString(
                process.env.NEXT_PUBLIC_LOCALE,
                timeFormat
              );
            }}
          />
          <Bar
            dataKey='value'
            type='monotone'
            animationDuration={DEFAULT_CHART_ANIMATION_DURATION}
            fill='var(--color-value)'
            radius={8}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
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
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
