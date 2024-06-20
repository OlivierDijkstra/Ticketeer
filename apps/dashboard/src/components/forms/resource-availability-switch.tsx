'use client';

import type { Event, Product, Show } from '@repo/lib';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { handleFieldUpdate } from '@/lib/utils';
import { updateEventAction } from '@/server/actions/events';
import {
  updateProductShowPivotAction,
  updateShowAction,
} from '@/server/actions/shows';

type Data = Event | Show | Product;

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
  const [enabled, setEnabled] = useState(
    (data as Event | Show).enabled || (data as Product).pivot?.enabled || false
  );
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
        if (!(data as Product).pivot) {
          toast.error('Failed to update product', {
            description: 'Please try again later',
          });

          throw new Error('Product pivot is required');
        }

        await handleFieldUpdate<Product, typeof updateProductShowPivotAction>({
          updateAction: updateProductShowPivotAction,
          data: {
            show_id: (data as Product).pivot?.show_id as number,
            product_id: (data as Product).id,
            data: {
              enabled: checked,
            },
          },
          setLoading,
          setData: () => setEnabled(checked),
          successMessage: 'Product updated successfully',
          errorMessage: 'Failed to update product',
        });
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
