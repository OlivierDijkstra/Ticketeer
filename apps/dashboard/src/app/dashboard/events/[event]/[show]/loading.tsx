import SkeletonCard from '@/components/skeletons/skeleton-card';
import SkeletonTable from '@/components/skeletons/skeleton-table';

export default function Loading() {
  return (
    <div className='space-y-4'>
      <div className='mb-4 flex flex-col gap-2 md:flex-row'>
        <div className='flex md:w-2/3'>
          <SkeletonTable />
        </div>

        <div className='space-y-4 md:w-1/3'>
          <SkeletonCard />

          <SkeletonCard />
        </div>
      </div>

      <SkeletonTable />

      <SkeletonTable />
    </div>
  );
}
