'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { updateEventAction } from '@/server/actions/events';
import { updateShowAction } from '@/server/actions/shows';

type Data = {
  enabled: boolean;
} & {
  [key: string]: unknown;
};

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
    setLoading(true);

    try {
      switch (type) {
        case 'event':
          await updateEventAction({
            event_slug: params.event as string,
            data: {
              enabled: checked,
            },
          });
          break;
        case 'product':
          // await updateProductAvailability(checked);
          break;
        case 'show':
          await updateShowAction({
            show_id: parseInt(params.show as string),
            data: {
              enabled: checked,
            },
          });
          break;
      }

      setEnabled(checked);

      toast.success('Availability updated', {
        description: `Resource is now ${checked ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast.error('Failed to update availability');
    }

    setLoading(false);
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
