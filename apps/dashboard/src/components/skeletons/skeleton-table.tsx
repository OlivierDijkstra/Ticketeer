import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonTable() {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <Skeleton className='h-4 w-1/3' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-[400px] w-full' />
        <Skeleton className='ml-auto mt-2 h-[25px] w-[50px]' />
      </CardContent>
    </Card>
  );
}
