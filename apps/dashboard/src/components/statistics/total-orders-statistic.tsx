import { subDays } from 'date-fns';

import NumberStatistic from '@/components/statistics/number-statistic';
import { Statistics } from '@/lib/statistics';

export default async function TotalOrdersStatistic({
  filters,
}: {
  filters?: Record<string, string>;
}) {
  const start_date = subDays(new Date(), 30).toISOString();
  const end_date = new Date().toISOString();

  let statistics: Statistics;

  try {
    statistics = await Statistics.fetchStatistics({
      model: 'order',
      start_date,
      end_date,
      group_by: 'month',
      filters,
    });
  } catch (error) {
    return (
      <NumberStatistic
        name='Error fetching total orders'
        percentage={0}
        value={0}
      />
    );
  }

  const totalOrders = statistics.getTotalChanges().totalIncrements;

  return (
    <NumberStatistic
      name='Total Orders This Month'
      percentage={statistics.getPercentageIncrease()}
      value={totalOrders}
      period='month'
    />
  );
}
