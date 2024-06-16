import dynamic from 'next/dynamic';

import ChartCard from '@/components/dashboard/statistics/ChartCard';
import { Statistics } from '@/lib/statistics';

const LineGraph = dynamic(
  () => import('@/components/dashboard/statistics/graphs/LineGraph'),
  {
    ssr: false,
  }
);

export default async function RevenueGraph() {
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

  return (
    <ChartCard name='Revenue Over Time'>
      <div className='min-h-[300px]'>
        <LineGraph data={statistics.dataPoints} />
      </div>
    </ChartCard>
  );
}
