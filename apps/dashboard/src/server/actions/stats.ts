'use server';

import { fetchWithAuth } from '@/lib/fetch';
import type { DataPoint } from '@/lib/statistics';
import { createUrl } from '@/lib/utils';

export type StatsRequest = {
  model: 'customer' | 'revenue' | 'order';
  start_date: string;
  end_date: string;
  group_by: string;
  filters?: Record<string, string>;
};

export async function getStatsAction({
  model,
  start_date,
  end_date,
  group_by,
  filters = {},
}: StatsRequest) {
  const statsUrl = createUrl('api/stats', {
    model,
    start_date,
    end_date,
    group_by,
    filters,
  });

  return await fetchWithAuth<DataPoint[]>(statsUrl, {
    next: {
      tags: ['stats'],
      revalidate: 30,
    },
  });
}
