'use server';

import { subDays } from 'date-fns';

import StatisticCard from '@/components/statistics/statistic-card';
import type { AggregatedDataConfig } from '@/server/actions/aggregated-data';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

export default async function NewOrdersStatistic(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const start_date = subDays(new Date(), 14);
  const end_date = new Date();

  const initialQuery: AggregatedDataConfig = {
    modelType: 'Order',
    aggregationType: 'sum',
    granularity: 'week',
    dateRange: [start_date, end_date],
  };

  const data = await fetchAggregatedData(initialQuery);

  const ordersThisWeek = Math.round(data?.[data.length - 1]?.value || 0);
  const ordersLastWeek = data?.[0]?.value || 0;

  const percentage =
    ordersLastWeek === 0
      ? ordersThisWeek > 0
        ? 100
        : 0
      : Math.round(((ordersThisWeek - ordersLastWeek) / ordersLastWeek) * 100);

  return (
    <StatisticCard
      name='New Orders This Week'
      percentage={percentage}
      value={ordersThisWeek}
      period='week'
      {...props}
    />
  );
}
