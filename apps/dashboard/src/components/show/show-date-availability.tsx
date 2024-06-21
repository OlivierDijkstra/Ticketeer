'use client';

import type { Show } from '@repo/lib';
import { useState } from 'react';

import EditableField from '@/components/editable-field';
import ResourceAvailabilitySwitch from '@/components/forms/resource-availability-switch';
import ShowDateForm from '@/components/forms/show-date-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { handleFieldUpdate } from '@/lib/utils';
import { updateShowAction } from '@/server/actions/shows';

export default function ShowTitleCard({ show }: { show: Show }) {
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState(show);

  async function handleDescriptionChange(value: string | number | null) {
    await handleFieldUpdate<Show, typeof updateShowAction>({
      updateAction: updateShowAction,
      data: {
        show_id: show.id,
        data: {
          description: value ? `${value}` : null,
        },
      },
      setLoading,
      setData: (data: Show) => {
        setShowData(data);
      },
      successMessage: 'Show updated successfully',
      errorMessage: 'Failed to update show',
    });
  }

  return (
    <Card className={loading ? 'pointer-events-none opacity-50' : ''}>
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

        <p className='text-sm font-medium'>Description</p>
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
