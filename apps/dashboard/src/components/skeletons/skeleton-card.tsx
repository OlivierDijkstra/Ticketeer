'use server';

import { Skeleton } from '@/components/ui/skeleton';

export default async function SkeletonCard() {
  return (
    <div className='flex flex-col space-y-2'>
      <Skeleton className='h-[50px] w-1/2 rounded-xl' />
      <Skeleton className='h-[250px] w-full rounded-xl' />
    </div>
  );
}
