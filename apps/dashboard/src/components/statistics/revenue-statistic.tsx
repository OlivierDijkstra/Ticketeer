'use client';

import formatMoney from '@repo/lib';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';

import type { ResultSet } from '@/components/charts/lib';
import StatisticCard from '@/components/statistics/statistic-card';
import { useConfig } from '@/lib/hooks';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

export default function NewOrdersStatistic() {
  const { config } = useConfig();

  const { data: resultSet, isError } = useQuery<ResultSet>({
    queryKey: ['revenueStatistic'],
    queryFn: async () => {
      const today = new Date();
      const start_date = subMonths(new Date(format(today, 'yyyy-MM-01')), 1);
      const end_date = new Date();

      return await fetchAggregatedData({
        modelType: 'Order',
        aggregationType: 'sum',
        granularity: 'month',
        dateRange: [start_date, end_date],
      });
    },
  });

  if (isError) {
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
    resultSet?.[resultSet.length - 1]?.value || 0
  );
  const revenueLastMonth = resultSet?.[0]?.value || 0;

  const percentage =
    revenueLastMonth === 0
      ? revenueThisMonth > 0
        ? 100
        : 0
      : Math.round(
          ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        );

  return (
    <StatisticCard
      name='Revenue This Month'
      percentage={percentage}
      value={formatMoney(
        revenueThisMonth,
        config?.APP_LOCALE,
        config?.APP_CURRENCY
      )}
      period='month'
    />
  );
}
