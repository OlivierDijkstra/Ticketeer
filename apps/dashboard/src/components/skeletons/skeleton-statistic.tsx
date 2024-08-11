'use server';

import { Skeleton } from '@/components/ui/skeleton';

export default async function SkeletonStatistic() {
  return <Skeleton className='h-[125px] w-full rounded-xl' />;
}
