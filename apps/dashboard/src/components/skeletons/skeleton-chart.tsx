'use server';

import { Skeleton } from '@/components/ui/skeleton';

export default async function SkeletonChart() {
  return (
    <div className='flex flex-col space-y-3'>
      <Skeleton className='md:h-[350px] h-[400px] w-full rounded-xl' />
    </div>
  );
}
