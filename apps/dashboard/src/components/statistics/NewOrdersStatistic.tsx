import { subDays } from 'date-fns';

import NumberStatistic from '@/components/statistics/NumberStatistic';
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
        up={null}
      />
    );
  }

  const ordersThisWeek = statistics.getLastDataPoint().increments;
  const up = statistics.calculatePercentageIncrease() > 0;

  return (
    <NumberStatistic
      name='New Orders This Week'
      percentage={statistics.calculatePercentageIncrease()}
      value={ordersThisWeek}
      up={up}
    />
  );
}
