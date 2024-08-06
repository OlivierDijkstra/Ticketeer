'use server';

import { createUrl } from '@repo/lib';

import type { DateRanges, ResultSet } from '@/components/charts/lib';
import { fetchWithAuth } from '@/lib/fetch';

export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max';
export type Granularity = 'hour' | 'day' | 'week' | 'month' | 'year';

export type AggregatedDataConfig = {
  modelType: string;
  aggregationType: AggregationType;
  granularity: Granularity;
  dateRange: DateRanges | [Date, Date];
};

export async function fetchAggregatedData({
  modelType,
  aggregationType,
  granularity,
  dateRange,
}: AggregatedDataConfig) {
  const date_range =
    typeof dateRange === 'string' ? dateRange : JSON.stringify(dateRange);

  const url = createUrl(`api/aggregations`, {
    model_type: modelType,
    aggregation_type: aggregationType,
    granularity,
    date_range,
  });

  const response = await fetchWithAuth<{
    data: ResultSet;
  }>(url);

  return response.data;
}
