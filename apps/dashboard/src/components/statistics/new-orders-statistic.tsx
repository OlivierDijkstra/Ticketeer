'use client';

import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';

import type { ResultSet } from '@/components/charts/lib';
import StatisticCard from '@/components/statistics/statistic-card';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

export default function NewOrdersStatistic() {
  const { data: resultSet, isError } = useQuery<ResultSet>({
    queryKey: ['newOrdersStatistic'],
    queryFn: async () => {
      const start_date = subDays(new Date(), 7);
      const end_date = new Date();

      return await fetchAggregatedData({
        modelType: 'Order',
        aggregationType: 'count',
        granularity: 'day',
        dateRange: [start_date, end_date],
      });
    },
  });

  if (isError) {
    return (
      <StatisticCard name='Error fetching orders' value={0} percentage={0} />
    );
  }

  const ordersThisWeek = Math.round(
    resultSet?.[resultSet.length - 1]?.value || 0
  );
  const ordersLastWeek = resultSet?.[0]?.value || 0;

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
    />
  );
}
