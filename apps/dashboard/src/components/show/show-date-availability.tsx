'use client';

import { cn, type Show } from '@repo/lib';
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

  async function handleEmailDescriptionChange(value: string | number | null) {
    await handleFieldUpdate<Show, typeof updateShowAction>({
      updateAction: updateShowAction,
      data: {
        show_id: show.id,
        data: {
          email_description: value ? `${value}` : null,
        },
      },
      setLoading,
      setData: (data: Show) => {
        setShowData(data);
      },
      successMessage: 'Show email description updated successfully',
      errorMessage: 'Failed to update show email description',
    });
  }

  return (
    <Card
      className={cn([
        'w-full',
        loading ? 'pointer-events-none opacity-50' : '',
      ])}
    >
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

        <div className='space-y-2'>
          <div>
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
          </div>

          <div>
            <p className='text-sm font-medium'>Email Description</p>
            <p className='text-xs text-muted-foreground mb-2'>
              This description will be on the email confirmation sent to
              customers.
            </p>

            <EditableField
              type='textarea'
              minLength={0}
              value={showData.email_description}
              onChange={handleEmailDescriptionChange}
              className='text-sm text-muted-foreground'
              tooltipText='Edit show email description'
              placeholder='No email description set'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
