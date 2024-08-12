'use server';

import type { DateRanges } from '@/components/charts/lib';
import { determineGranularity } from '@/components/charts/lib';
import type {
  AggregatedDataConfig,
  Granularity,
} from '@/server/actions/aggregated-data';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

interface ChartWrapperProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Chart: React.ComponentType<any>;
  defaultDateRange: DateRanges | [Date, Date];
  defaultGranularity: Granularity;
  modelType: string;
  aggregationType: 'count' | 'sum';
}

export default async function ChartWrapper({
  Chart,
  defaultDateRange,
  defaultGranularity,
  modelType,
  aggregationType,
}: ChartWrapperProps) {
  const initialQuery: AggregatedDataConfig = {
    modelType,
    aggregationType,
    granularity:
      defaultGranularity ||
      (typeof defaultDateRange === 'string'
        ? determineGranularity(defaultDateRange)
        : 'day'),
    dateRange: defaultDateRange,
  };

  const data = await fetchAggregatedData(initialQuery);

  return (
    <Chart
      initialQuery={initialQuery}
      refetch={fetchAggregatedData}
      initialData={data}
    />
  );
}
