import SkeletonStatistic from '@/components/skeletons/skeleton-statistic';
import SkeletonTable from '@/components/skeletons/skeleton-table';

export default function Loading() {
  return (
    <div className='space-y-4'>
      <div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <SkeletonStatistic />
      </div>

      <SkeletonTable />
    </div>
  );
}
