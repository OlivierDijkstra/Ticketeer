import SkeletonGraph from '@/components/skeletons/skeleton-graph';
import SkeletonStatistic from '@/components/skeletons/skeleton-statistic';
import SkeletonTable from '@/components/skeletons/skeleton-table';

export default function Loading() {
  return (
    <div>
      <div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <SkeletonStatistic />
        <SkeletonStatistic />
      </div>

      <div className='mb-2'>
        <SkeletonGraph />
      </div>

      <SkeletonTable />
    </div>
  );
}
