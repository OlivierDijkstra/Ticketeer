'use client';

import type { Event } from '@repo/lib';
import { cn } from '@repo/lib';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import EditableField from '@/components/dashboard/EditableField';
import ResourceAvailabilitySwitch from '@/components/dashboard/forms/ResourceAvailabilitySwitch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { updateEventAction } from '@/server/actions/events';

export default function EventTitleCard({ event }: { event: Event }) {
  const [eventData, setEventData] = useState<Event>(event);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleNameChange(value: string | null) {
    if (!value) {
      toast.error('Event name is required');
      return;
    }

    setLoading(true);


    await toast.promise(
      updateEventAction({
        event_slug: event.slug,
        data: {
          name: value,
        },
      }),
      {
        loading: 'Updating event...',
        success: (data) => {
          router.push(`/dashboard/events/${data.slug}`);
          return 'Event updated successfully';
        },
        error: 'Failed to update event',
      }
    );

    setLoading(false);
  }

  async function handleDescriptionChange(value: string | null) {
    setLoading(true);

    try {
      const data = await updateEventAction({
        event_slug: event.slug,
        data: {
          description: value,
        },
      });

      setEventData(data);

      toast.success('Event updated successfully');
    } catch (error) {
      toast.error('Failed to update event', {
        description: 'Please try again later',
      });
    }

    setLoading(false);
  }

  async function handleDescriptionShortChange(value: string | null) {
    setLoading(true);

    try {
      const data = await updateEventAction({
        event_slug: event.slug,
        data: {
          description_short: value,
        },
      });

      setEventData(data);

      toast.success('Event updated successfully');
    } catch (error) {
      toast.error('Failed to update event', {
        description: 'Please try again later',
      });
    }

    setLoading(false);
  }

  return (
    <Card className={cn(
      'transition-opacity',
      loading ? 'opacity-50' : ''
    )}>
      <CardHeader
        className='bg-muted/50'
      >
        <div className='flex justify-between'>
          <div className='space-y-1.5'>
            <CardTitle>Event</CardTitle>
            <CardDescription>
              Edit the event name and description
            </CardDescription>
          </div>

          <ResourceAvailabilitySwitch
            type='event'
            data={eventData}
            tooltipText='Enable or disable event'
          />
        </div>
      </CardHeader>

      <CardContent
        className='mt-4'
      >
        <EditableField
          value={eventData.name}
          onChange={handleNameChange}
          className='text-xl font-semibold'
          tooltipText='Edit event name'
          confirmation
          required
        />

        <EditableField
          type='textarea'
          value={eventData.description}
          onChange={handleDescriptionChange}
          className='text-sm text-muted-foreground'
          tooltipText='Edit event description'
          placeholder='No description set'
        />

        <h3 className='text-sm font-medium mt-4'>Short description</h3>
        <p className='text-sm text-muted-foreground'>
          This description will be shown on the event card on the home page
        </p>
        

        <EditableField
          type='textarea'
          value={eventData.description_short}
          onChange={handleDescriptionShortChange}
          className='text-sm text-muted-foreground'
          tooltipText='Edit event short description, shown on the event card on the home page'
          placeholder='No short description set'
        />
      </CardContent>
    </Card>
  );
}
