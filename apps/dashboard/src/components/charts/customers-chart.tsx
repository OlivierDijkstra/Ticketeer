'use client';

import { useMemo, useState } from 'react';
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
import Spinner from '@/components/spinner';
import { DEFAULT_CHART_ANIMATION_DURATION } from '@/lib/constants';
import { useConfig } from '@/lib/hooks';
import type {
  AggregatedData,
  AggregatedDataConfig,
} from '@/server/actions/aggregated-data';

export default function CustomersChart({
  refetch,
  initialData,
  initialQuery,
}: {
  refetch: (config: AggregatedDataConfig) => Promise<AggregatedData>;
  initialData: AggregatedData;
  initialQuery: AggregatedDataConfig;
}) {
  const { config } = useConfig();

  const [granularity, setGranularity] = useState(initialQuery.granularity);
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const defaultDateRange = initialQuery.dateRange as DateRanges;

  async function handleDateRangeChange(dateRange: DateRanges) {
    setIsLoading(true);
    const newGranularity = determineGranularity(dateRange);
    setGranularity(newGranularity);

    const newData = await refetch({
      ...initialQuery,
      dateRange: dateRange,
      granularity: newGranularity,
    });

    setData(newData);
    setIsLoading(false);
  }

  const timeFormat = useMemo(
    () => determineDateFormat(granularity),
    [granularity]
  );

  return (
    <ChartCard
      title='New customers'
      dateRange={defaultDateRange}
      onDateRangeChange={handleDateRangeChange}
    >
      {isLoading && (
        <div className='absolute inset-0 z-10 grid h-full w-full place-items-center'>
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
          data={data}
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
                config?.APP_LOCALE || 'en-US',
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
                    config?.APP_LOCALE || 'en-US',
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
