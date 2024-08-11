import SkeletonCard from '@/components/skeletons/skeleton-card';
import SkeletonTable from '@/components/skeletons/skeleton-table';

export default function Loading() {
  return (
    <div className='space-y-4'>
      <SkeletonCard />

      <div className='grid gap-4 lg:grid-cols-2 '>
        <SkeletonCard />

        <SkeletonTable />
      </div>
    </div>
  );
}
