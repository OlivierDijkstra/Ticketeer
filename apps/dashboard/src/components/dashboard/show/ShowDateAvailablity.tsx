'use client';

import type { Show } from '@repo/lib';
import { useState } from 'react';
import { toast } from 'sonner';

import EditableField from '@/components/dashboard/EditableField';
import ResourceAvailabilitySwitch from '@/components/dashboard/forms/ResourceAvailabilitySwitch';
import ShowDateForm from '@/components/dashboard/forms/ShowDateForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateShowAction } from '@/server/actions/shows';

export default function ShowTitleCard({ show }: { show: Show }) {
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState(show);

  async function handleDescriptionChange(value: string | null) {
    setLoading(true);

    try {
      const data = await updateShowAction({
        show_id: show.id,
        data: {
          description: value || undefined,
        },
      });

      setShowData(data);

      toast.success('Show updated successfully');
    } catch (error) {
      toast.error('Failed to update show', {
        description: 'Please try again later',
      });
    }

    setLoading(false);
  }

  return (
    <Card className={loading ? 'opacity-50 pointer-events-none' : ''}>
      <CardHeader className='bg-muted/50'>
        <div className='flex justify-between'>
          <CardTitle>Show</CardTitle>

          <ResourceAvailabilitySwitch
            type='show'
            data={showData}
            tooltipText='Enable or disable show'
          />
        </div>
      </CardHeader>

      <CardContent className='mt-4'>
        <ShowDateForm show={showData} />

        <hr className='my-4' />

        <EditableField
          type='textarea'
          minLength={0}
          value={showData.description}
          onChange={handleDescriptionChange}
          className='text-sm text-muted-foreground'
          tooltipText='Edit show description'
          placeholder='No description set'
        />
      </CardContent>
    </Card>
  );
}
