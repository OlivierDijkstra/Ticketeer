'use server';

import { format } from 'date-fns';
import { Suspense } from 'react';

import ChartCard from '@/components/charts/chart-card';
import RevenueChart from '@/components/charts/revenue-chart/revenue-chart';
import Spinner from '@/components/spinner';
import { Statistics } from '@/lib/statistics';

export default async function RevenueChartData() {
  const today = new Date();
  const start_date = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate()
  ).toISOString();
  const end_date = new Date().toISOString();

  let statistics: Statistics;

  try {
    statistics = await Statistics.fetchStatistics({
      model: 'revenue',
      start_date,
      end_date,
      group_by: 'month',
    });
  } catch (error) {
    return <p>Err</p>;
  }

  const dataPoints = statistics.dataPoints.map((point) => ({
    name: format(new Date(point.start), 'dd MMM yyyy'),
    revenue: point.increments,
  }));

  return (
    <ChartCard title='Revenue'>
      <Suspense
        fallback={
          <div className='grid place-items-center'>
            <Spinner />
          </div>
        }
      >
        <RevenueChart data={dataPoints} />
      </Suspense>
    </ChartCard>
  );
}
