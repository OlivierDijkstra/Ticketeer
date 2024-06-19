'use client';

import type { Event, Show } from '@repo/lib';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { handleFieldUpdate } from '@/lib/utils';
import { updateEventAction } from '@/server/actions/events';
import { updateShowAction } from '@/server/actions/shows';

type Data = Event | Show;

export default function ResourceAvailabilitySwitch({
  type,
  data,
  tooltipText = 'Enable or disable resource',
}: {
  type: 'event' | 'product' | 'show';
  data: Data;
  tooltipText?: string;
}) {
  const params = useParams<{ event?: string; show?: string }>();
  const [enabled, setEnabled] = useState(data.enabled);
  const [loading, setLoading] = useState(false);

  async function handleAvailabilityChange(checked: boolean) {
    switch (type) {
      case 'event':
        await handleFieldUpdate<Event, typeof updateEventAction>({
          updateAction: updateEventAction,
          data: {
            event_slug: params.event as string,
            data: {
              enabled: checked,
            },
          },
          setLoading,
          setData: () => setEnabled(checked),
          successMessage: 'Event updated successfully',
          errorMessage: 'Failed to update event',
        });
        break;
      case 'show':
        await handleFieldUpdate<Show, typeof updateShowAction>({
          updateAction: updateShowAction,
          data: {
            show_id: parseInt(params.show as string),
            data: {
              enabled: checked,
            },
          },
          setLoading,
          setData: () => setEnabled(checked),
          successMessage: 'Show updated successfully',
          errorMessage: 'Failed to update show',
        });
        break;
      case 'product':
        // await updateProductAvailability(checked);
        break;
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Switch
            disabled={loading}
            onCheckedChange={handleAvailabilityChange}
            checked={enabled}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className='text-xs font-normal'>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
