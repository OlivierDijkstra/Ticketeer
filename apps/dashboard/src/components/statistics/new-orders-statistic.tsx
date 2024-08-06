import { subDays } from 'date-fns';

import type { ResultSet } from '@/components/charts/lib';
import StatisticCard from '@/components/statistics/statistic-card';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

export default async function NewOrdersStatistic() {
  async function handleDataFetch() {
    const start_date = subDays(new Date(), 7);
    const end_date = new Date();

    return await fetchAggregatedData({
      modelType: 'Order',
      aggregationType: 'count',
      granularity: 'day',
      dateRange: [start_date, end_date],
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

  const ordersThisWeek = Math.round(
    resultSet[resultSet.length - 1]?.value || 0
  );
  const ordersLastWeek = resultSet[0]?.value || 0;

  return (
    <StatisticCard
      name='New Orders This Week'
      percentage={
        ordersLastWeek === 0
          ? ordersThisWeek > 0
            ? 100
            : 0
          : Math.round(
              ((ordersThisWeek - ordersLastWeek) / ordersLastWeek) * 100
            )
      }
      value={ordersThisWeek}
      period='week'
    />
  );
}
