import type { Show } from '@repo/lib';

import ResourceAvailabilitySwitch from '@/components/dashboard/forms/ResourceAvailabilitySwitch';
import ShowDateForm from '@/components/dashboard/forms/ShowDateForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShowTitleCard({ show }: { show: Show }) {
  return (
    <Card>
      <CardHeader className='bg-muted/50'>
        <div className='flex justify-between'>
          <CardTitle>Show</CardTitle>

          <ResourceAvailabilitySwitch
            type='show'
            data={show}
            tooltipText='Enable or disable show'
          />
        </div>
      </CardHeader>

      <CardContent className='mt-4'>
        <ShowDateForm show={show} />
      </CardContent>
    </Card>
  );
}
