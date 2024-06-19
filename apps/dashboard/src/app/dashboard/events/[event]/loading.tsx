import SkeletonStatistic from '@/components/skeletons/SkeletonStatistic';
import SkeletonTable from '@/components/skeletons/SkeletonTable';

export default function Loading() {
  return (
    <div>
      <div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <SkeletonStatistic />
        <SkeletonStatistic />
      </div>

      <div className='mb-4'>
        <SkeletonTable />
      </div>

      <div className='mb-4'>
        <SkeletonTable />
      </div>

      <SkeletonTable />
    </div>
  );
}
