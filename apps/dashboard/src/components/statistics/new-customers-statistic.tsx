import { subDays } from 'date-fns';

import NumberStatistic from '@/components/statistics/number-statistic';
import { Statistics } from '@/lib/statistics';

export default async function NewCustomersStatistic({
  filters,
}: {
  filters?: Record<string, string>;
}) {
  const start_date = subDays(new Date(), 30).toISOString();
  const end_date = new Date().toISOString();

  let statistics: Statistics;

  try {
    statistics = await Statistics.fetchStatistics({
      model: 'customer',
      start_date,
      end_date,
      group_by: 'month',
      filters,
    });
  } catch (error) {
    return (
      <NumberStatistic
        name='Error fetching new customers'
        percentage={0}
        value={0}
        up={null}
      />
    );
  }

  const newCustomers =
    statistics.getTotalIncrementsAndDecrements().totalIncrements;
  const up = statistics.calculatePercentageIncrease() > 0;

  return (
    <NumberStatistic
      name='New Customers This Month'
      percentage={statistics.calculatePercentageIncrease()}
      value={newCustomers}
      up={up}
    />
  );
}
