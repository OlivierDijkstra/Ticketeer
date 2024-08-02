import type { Filter } from '@cubejs-client/core';
import { subDays } from 'date-fns';

import type { ResultSet } from '@/components/charts/server';
import { fetchData } from '@/components/charts/server';
import StatisticCard from '@/components/statistics/statistic-card';

export default async function NewOrdersStatistic({
  filters,
}: {
  filters?: Filter[];
}) {
  async function handleDataFetch() {
    const start_date = subDays(new Date(), 7).toISOString();
    const end_date = new Date().toISOString();

    return await fetchData({
      measures: ['orders.total'],
      timeDimensions: [
        {
          dimension: 'orders.created_at',
          granularity: 'week',
          dateRange: [start_date, end_date],
        },
      ],
      order: {
        'orders.created_at': 'asc',
      },
      filters,
    });
  }

  let resultSet: ResultSet = [];

  try {
    resultSet = await handleDataFetch();
  } catch (error) {
    return (
      <StatisticCard name='Error fetching orders' value={0} percentage={0} />
    );
  }

  const ordersThisWeek = resultSet[resultSet.length - 1]?.value || 0;
  const ordersLastWeek = resultSet[0]?.value || 0;
  
  return (
    <StatisticCard
      name='New Orders This Week'
      percentage={
        Math.round(
          ((ordersThisWeek - ordersLastWeek) / ordersLastWeek) * 100
        ) || 0
      }
      value={ordersThisWeek}
      period='week'
    />
  );
}
