'use client';

import type { Event } from '@repo/lib';
import { cn } from '@repo/lib';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import EditableField from '@/components/editable-field';
import ResourceAvailabilitySwitch from '@/components/forms/resource-availability-switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { handleFieldUpdate } from '@/lib/utils';
import { updateEventAction } from '@/server/actions/events';

export default function EventSettingsCard({ event }: { event: Event }) {
  const [eventData, setEventData] = useState<Event>(event);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleNameChange(value: string | null | number) {
    await handleFieldUpdate<Event, typeof updateEventAction>({
      updateAction: updateEventAction,
      data: {
        event_slug: event.slug,
        data: {
          name: value ? `${value}` : undefined,
        },
      },
      setLoading,
      setData: (data: Event) => {
        setEventData(data);
        router.push(`/dashboard/events/${data.slug}`);
      },
      successMessage: 'Event updated successfully',
      errorMessage: 'Failed to update event',
    });
  }

  async function handleDescriptionChange(value: string | null | number) {
    await handleFieldUpdate<Event, typeof updateEventAction>({
      updateAction: updateEventAction,
      data: {
        event_slug: event.slug,
        data: {
          description: `${value}`,
        },
      },
      setLoading,
      setData: setEventData,
      successMessage: 'Event updated successfully',
      errorMessage: 'Failed to update event',
    });
  }

  async function handleDescriptionShortChange(value: string | null | number) {
    await handleFieldUpdate<Event, typeof updateEventAction>({
      updateAction: updateEventAction,
      data: {
        event_slug: event.slug,
        data: {
          description_short: `${value}`,
        },
      },
      setLoading,
      setData: setEventData,
      successMessage: 'Event updated successfully',
      errorMessage: 'Failed to update event',
    });
  }

  async function handleServiceFeeChange(value: string | number | null) {
    await handleFieldUpdate<Event, typeof updateEventAction>({
      updateAction: updateEventAction,
      data: {
        event_slug: event.slug,
        data: {
          service_fee: value ? `${value}` : undefined,
        },
      },
      setLoading,
      setData: setEventData,
      successMessage: 'Event updated successfully',
      errorMessage: 'Failed to update event',
    });
  }

  return (
    <Card className={cn('transition-opacity', loading ? 'opacity-50' : '')}>
      <CardHeader className='bg-muted/50'>
        <div className='flex justify-between'>
          <div className='space-y-1.5'>
            <CardTitle>Event</CardTitle>
            <CardDescription>Edit the event settings</CardDescription>
          </div>

          <ResourceAvailabilitySwitch
            type='event'
            data={eventData}
            tooltipText='Enable or disable event'
          />
        </div>
      </CardHeader>

      <CardContent className='mt-4'>
        <EditableField
          value={eventData.name}
          onChange={handleNameChange}
          className='text-xl font-semibold'
          tooltipText='Edit event name'
          confirmation
          required
        />

        <h3 className='mt-4 text-sm font-medium'>Short description</h3>
        <p className='mb-2 text-xs text-muted-foreground'>
          This description will be shown on the event page. Give your customers
          some useful information about the event.
        </p>

        <EditableField
          type='textarea'
          value={eventData.description}
          onChange={handleDescriptionChange}
          className='text-sm text-muted-foreground'
          tooltipText='Edit event description'
          placeholder='No description set'
          minLength={0}
        />

        <hr className='my-4' />

        <div className='flex flex-row justify-between gap-4'>
          <div>
            <h3 className='mt-4 text-sm font-medium'>Short description</h3>
            <p className='mb-2 text-xs text-muted-foreground'>
              This description will be shown on the event card on the home page
            </p>

            <EditableField
              type='textarea'
              value={eventData.description_short}
              onChange={handleDescriptionShortChange}
              className='text-sm text-muted-foreground'
              tooltipText='Edit event short description, shown on the event card on the home page'
              placeholder='No short description set'
              minLength={0}
            />
          </div>

          <div>
            <h3 className='mt-4 text-sm font-medium'>Service fee</h3>
            <p className='mb-2 text-xs text-muted-foreground'>
              This fee will be added to the total price of the event.
            </p>

            <EditableField
              type='currency'
              value={eventData.service_fee}
              onChange={handleServiceFeeChange}
              className='text-sm text-muted-foreground'
              tooltipText='Edit event short description, shown on the event card on the home page'
              placeholder='No short description set'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
