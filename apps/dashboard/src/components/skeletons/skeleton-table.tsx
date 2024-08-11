'use server';

import { Skeleton } from '@/components/ui/skeleton';

export default async function SkeletonTable() {
  return (
    <Skeleton className='h-[400px] w-full' />
  );
}
