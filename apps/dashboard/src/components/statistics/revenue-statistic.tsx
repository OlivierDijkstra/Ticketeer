'use server';

import formatMoney from '@repo/lib';
import { format, subMonths } from 'date-fns';

import StatisticCard from '@/components/statistics/statistic-card';
import type {
  AggregatedDataConfig} from '@/server/actions/aggregated-data';
import {
  fetchAggregatedData,
} from '@/server/actions/aggregated-data';

export default async function RevenueStatistic(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const start_date = subMonths(new Date(format(new Date(), 'yyyy-MM-01')), 1);
  const end_date = new Date();

  const initialQuery: AggregatedDataConfig = {
    modelType: 'Order',
    aggregationType: 'sum',
    granularity: 'month',
    dateRange: [start_date, end_date],
  };

  const data = await fetchAggregatedData(initialQuery);

  const revenueThisMonth = Math.round(data?.[data.length - 1]?.value || 0);
  const revenueLastMonth = data?.[0]?.value || 0;

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
        process.env.APP_LOCALE,
        process.env.APP_CURRENCY
      )}
      period='month'
      {...props}
    />
  );
}
