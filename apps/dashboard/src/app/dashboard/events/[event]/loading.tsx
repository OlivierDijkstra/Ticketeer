import SkeletonStatistic from '@/components/skeletons/skeleton-statistic';
import SkeletonTable from '@/components/skeletons/skeleton-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <SkeletonStatistic />
        <SkeletonStatistic />
      </div>
      <SkeletonTable />

      <div className='grid gap-4 lg:grid-cols-2 '>
        <Skeleton className='h-[250px]' />

        <SkeletonTable />
      </div>
    </div>
  );
}
