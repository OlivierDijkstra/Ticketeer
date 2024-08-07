import formatMoney from '@repo/lib';
import { format, subMonths } from 'date-fns';

import type { ResultSet } from '@/components/charts/lib';
import StatisticCard from '@/components/statistics/statistic-card';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

export default async function NewOrdersStatistic() {
  async function handleDataFetch() {
    const today = new Date();
    const start_date = subMonths(new Date(format(today, 'yyyy-MM-01')), 1);
    const end_date = new Date();

    return await fetchAggregatedData({
      modelType: 'Order',
      aggregationType: 'sum',
      granularity: 'month',
      dateRange: [start_date, end_date],
    });
  }

  let resultSet: ResultSet = [];

  try {
    resultSet = await handleDataFetch();
  } catch (error) {
    return (
      <StatisticCard
        name='Error fetching revenue'
        value={0}
        percentage={0}
        period='month'
      />
    );
  }

  const revenueThisMonth = Math.round(
    resultSet[resultSet.length - 1]?.value || 0
  );
  const revenueLastMonth = resultSet[0]?.value || 0;

  return (
    <StatisticCard
      name='Revenue This Month'
      percentage={
        revenueLastMonth === 0
          ? revenueThisMonth > 0
            ? 100
            : 0
          : Math.round(
              ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
            )
      }
      value={formatMoney(revenueThisMonth)}
      period='month'
    />
  );
}
