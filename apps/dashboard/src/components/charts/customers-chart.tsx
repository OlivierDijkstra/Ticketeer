'use client';

import type { Query, TimeDimensionGranularity } from '@cubejs-client/core';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
import type { ResultSet } from '@/components/charts/server';
import { fetchData } from '@/components/charts/server';
import Spinner from '@/components/spinner';
import { DATE_RANGES, DEFAULT_CHART_ANIMATION_DURATION } from '@/lib/constants';

export default function CustomersChart() {
  const defaultDateRange = DATE_RANGES[0] || 'This year';
  const defaultGranularity = determineGranularity(defaultDateRange);

  const [query, setQuery] = useState<Query>({
    measures: ['customers.count'],
    timeDimensions: [
      {
        dimension: 'customers.created_at',
        granularity: defaultGranularity,
        dateRange: defaultDateRange,
      },
    ],
    order: {
      'customers.created_at': 'asc',
    },
  });

  const [resultSet, setResultSet] = useState<ResultSet>();
  const [isLoading, setIsLoading] = useState(false);
  const [granularity, setGranularity] =
    useState<TimeDimensionGranularity>(defaultGranularity);

  const timeFormat = useMemo(
    () => determineDateFormat(granularity),
    [granularity]
  );

  useEffect(() => {
    async function handleDataFetch() {
      setIsLoading(true);
      const resultSet = await fetchData(query);
      setResultSet(resultSet);
      setIsLoading(false);
    }

    handleDataFetch();
  }, [query]);

  async function handleDateRangeChange(dateRange: DateRanges) {
    const newGranularity = determineGranularity(dateRange);
    setGranularity(newGranularity);

    setQuery({
      ...query,
      timeDimensions: [
        {
          dimension: 'customers.created_at',
          granularity: newGranularity,
          dateRange: dateRange,
        },
      ],
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
