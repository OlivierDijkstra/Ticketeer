'use server';

import { createUrl } from '@repo/lib';

import type { DateRanges } from '@/components/charts/lib';
import { fetchWithAuth } from '@/lib/fetch';

export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max';
export type Granularity = 'hour' | 'day' | 'week' | 'month' | 'year';

export type AggregatedDataConfig = {
  modelType: string;
  aggregationType: AggregationType;
  granularity: Granularity;
  dateRange: DateRanges | [Date, Date];
};

export type AggregatedData = {
  x: string;
  value: number;
}[];

export async function fetchAggregatedData({
  modelType,
  aggregationType,
  granularity,
  dateRange,
}: AggregatedDataConfig) {
  try {
    const date_range =
      typeof dateRange === 'string' ? dateRange : JSON.stringify(dateRange);

    const url = createUrl(`api/aggregations`, {
      model_type: modelType,
      aggregation_type: aggregationType,
      granularity,
      date_range,
    });

    const response = await fetchWithAuth<{
      data: AggregatedData;
    }>(url);

    if (!response.data) {
      return [];
    }

    return response.data.map((item) => ({
      ...item,
      value: parseFloat(`${item.value}`),
    }));
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    return [];
  }
}
