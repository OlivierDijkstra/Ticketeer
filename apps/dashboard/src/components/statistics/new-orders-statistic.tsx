import { subDays } from 'date-fns';

import NumberStatistic from '@/components/statistics/number-statistic';
import { Statistics } from '@/lib/statistics';

export default async function NewOrdersStatistic({
  filters,
}: {
  filters?: Record<string, string>;
}) {
  const start_date = subDays(new Date(), 13).toISOString();
  const end_date = new Date().toISOString();

  let statistics: Statistics;

  try {
    statistics = await Statistics.fetchStatistics({
      model: 'order',
      start_date,
      end_date,
      group_by: 'week',
      filters,
    });
  } catch (error) {
    return (
      <NumberStatistic
        name='Error fetching new orders'
        percentage={0}
        value={0}
      />
    );
  }

  const ordersThisWeek = statistics.getLastPoint()?.increments;

  return (
    <NumberStatistic
      name='New Orders This Week'
      percentage={statistics.getPercentageIncrease()}
      value={ordersThisWeek || 0}
      period='week'
    />
  );
}
