import { format, subMonths } from 'date-fns';

import NumberStatistic from '@/components/statistics/NumberStatistic';
import { Statistics } from '@/lib/statistics';

export default async function RevenueStatistic({
  filters,
}: {
  filters?: Record<string, string>;
}) {
  const today = new Date();
  const start_date = subMonths(
    new Date(format(today, 'yyyy-MM-01')),
    1
  ).toISOString();
  const end_date = new Date().toISOString();

  let statistics: Statistics;

  try {
    statistics = await Statistics.fetchStatistics({
      model: 'revenue',
      start_date,
      end_date,
      group_by: 'month',
      filters,
    });
  } catch (error) {
    return (
      <NumberStatistic
        name='Error fetching revenue'
        percentage={0}
        value={0}
        up={null}
      />
    );
  }

  const revenueThisMonth = statistics.getLastDataPoint().increments;
  const up = statistics.calculatePercentageIncrease() > 0;

  return (
    <NumberStatistic
      name='Revenue This Month'
      percentage={statistics.calculatePercentageIncrease()}
      value={Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
      })
        .format(revenueThisMonth)
        .toString()}
      up={up}
    />
  );
}
