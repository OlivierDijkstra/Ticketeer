import SkeletonChart from '@/components/skeletons/skeleton-chart';
import SkeletonStatistic from '@/components/skeletons/skeleton-statistic';
import SkeletonTable from '@/components/skeletons/skeleton-table';

export default function Loading() {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <SkeletonStatistic />
        <SkeletonStatistic />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <SkeletonChart />
        <SkeletonChart />
      </div>

      <SkeletonTable />
    </div>
  );
}
