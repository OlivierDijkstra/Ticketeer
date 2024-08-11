'use client';

import formatMoney from '@repo/lib';
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
import { DEFAULT_CHART_ANIMATION_DURATION } from '@/lib/constants';
import { useConfig } from '@/lib/hooks';
import type { AggregatedData, AggregatedDataConfig } from '@/server/actions/aggregated-data';

const chartConfig = {
  value: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function RevenueChart({
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
                config?.APP_LOCALE || 'en-US',
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
                    <div className='ml-1 flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground'>
                      {formatMoney(
                        value as string,
                        config.APP_LOCALE,
                        config.APP_CURRENCY
                      )}
                    </div>
                  </div>
                )}
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString(
                    config.APP_LOCALE,
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
