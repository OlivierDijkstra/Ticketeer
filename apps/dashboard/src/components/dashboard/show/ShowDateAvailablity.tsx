import ResourceAvailabilitySwitch from '@/components/dashboard/forms/ResourceAvailabilitySwitch';
import ShowDateForm from '@/components/dashboard/forms/ShowDateForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Show } from '@/types/api';

export default function ShowTitleCard({ show }: { show: Show }) {
  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between'>
          <CardTitle>Show</CardTitle>

          <ResourceAvailabilitySwitch
            type='show'
            data={show}
            tooltipText='Enable or disable show'
          />
        </div>
      </CardHeader>

      <CardContent>
        <ShowDateForm show={show} />
      </CardContent>
    </Card>
  );
}
