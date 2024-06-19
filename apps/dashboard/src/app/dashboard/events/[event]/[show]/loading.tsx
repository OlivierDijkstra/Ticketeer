import SkeletonTable from '@/components/skeletons/SkeletonTable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div>
      <div className='mb-4 grid-cols-5 gap-2 space-y-4 md:grid md:space-y-0'>
        <div className='col-span-3'>
          <Card className='h-[275px]'>
            <CardContent>
              <CardHeader />
              <Skeleton className='h-[200px]' />
            </CardContent>
          </Card>
        </div>

        <div className='col-span-2'>
          <Card>
            <CardHeader />
            <CardContent>
              <Skeleton className='h-[200px]' />
            </CardContent>
          </Card>
        </div>
      </div>

      <SkeletonTable />
    </div>
  );
}
