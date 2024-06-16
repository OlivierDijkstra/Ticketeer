import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonStatistic() {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <Skeleton className='h-4 w-1/3' />
        <Skeleton className='h-12 w-1/2' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-2 w-full' />
      </CardContent>
    </Card>
  );
}
