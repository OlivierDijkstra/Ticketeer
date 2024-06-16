'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import GuestField from '@/components/dashboard/show/GuestField';
import { cn } from '@/lib/utils';
import { updateShowAction } from '@/server/actions/shows';
import type { Show } from '@/types/api';

export default function ShowGuestsForm({ show }: { show: Show }) {
  const schema = z
    .object({
      guests: z.array(z.string()).optional(),
    })
    .required();

  const { handleSubmit, control } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      guests: show.guests,
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof schema>) {
    setLoading(true);

    await toast.promise(
      updateShowAction({
        show_id: show.id,
        data: {
          guests: data.guests,
        },
      }),
      {
        loading: 'Updating guests...',
        success: 'Guests updated',
        error: 'Failed to update guests',
      }
    );

    setLoading(false);
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn([
          'space-y-2 transition-opacity',
          {
            'pointer-events-none opacity-50': loading,
          },
        ])}
      >
        <Controller
          name='guests'
          control={control}
          render={({ field: { value, onChange } }) => (
            <GuestField
              value={value}
              onChange={(value) => {
                onChange(value);
                onSubmit({ guests: value });
              }}
            />
          )}
        />
      </form>
    </div>
  );
}
