import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonGraph() {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <Skeleton className='h-4 w-1/3' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-[300px] w-full' />
      </CardContent>
    </Card>
  );
}
