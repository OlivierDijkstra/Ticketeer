import type { Filter } from '@cubejs-client/core';
import formatMoney from '@repo/lib';
import { format, subMonths } from 'date-fns';

import type { ResultSet } from '@/components/charts/server';
import { fetchData } from '@/components/charts/server';
import StatisticCard from '@/components/statistics/statistic-card';

export default async function NewOrdersStatistic({
  filters,
}: {
  filters?: Filter[];
}) {
  async function handleDataFetch() {
    const today = new Date();
    const start_date = subMonths(
      new Date(format(today, 'yyyy-MM-01')),
      1
    ).toISOString();
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
      <StatisticCard name='Error fetching revenue' value={0} percentage={0} />
    );
  }

  const revenueThisMonth = resultSet[resultSet.length - 1]?.value || 0;
  const revenueLastMonth = resultSet[0]?.value || 0;

  return (
    <StatisticCard
      name='Revenue This Month'
      percentage={
        Math.round(
          ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        ) || 0
      }
      value={formatMoney(revenueThisMonth)}
      period='month'
    />
  );
}
