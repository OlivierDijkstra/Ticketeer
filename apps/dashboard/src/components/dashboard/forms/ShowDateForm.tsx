'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import StartEndDateInputs from '@/components/dashboard/show/StartEndDateInputs';
import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { updateShowAction } from '@/server/actions/shows';
import type { Show } from '@/types/api';

export default function ShowDateForm({ show }: { show: Show }) {
  const schema = z
    .object({
      dates: z.object({
        start: z.string(),
        end: z.string(),
      }),
    })
    .required();

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      dates: {
        start: show.start,
        end: show.end,
      },
    },
  });

  function resetForm() {
    reset({
      dates: {
        start: show.start,
        end: show.end,
      },
    });
  }

  async function onSubmit(data: z.infer<typeof schema>) {
    const start = new Date(data.dates.start);
    const end = new Date(data.dates.end);

    await toast.promise(
      updateShowAction({
        show_id: show.id,
        data: {
          id: show.id,
          start: format(start, 'yyyy-MM-dd HH:mm:ss'),
          end: format(end, 'yyyy-MM-dd HH:mm:ss'),
        },
      }),
      {
        loading: 'Updating show...',
        success: 'Show updated',
        error: 'Failed to update show',
      }
    );
  }

  return (
    <form
      className='flex max-w-xl flex-col items-end'
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name='dates'
        control={control}
        render={({ field: { value, onChange } }) => (
          <StartEndDateInputs
            value={{
              start: new Date(value.start),
              end: new Date(value.end),
            }}
            onChange={(dates) => {
              onChange({
                start: format(dates.start, 'yyyy-MM-dd HH:mm:ss'),
                end: format(dates.end, 'yyyy-MM-dd HH:mm:ss'),
              });
            }}
          />
        )}
      />

      <div className='mt-4 flex items-center gap-2'>
        <Button
          size='sm'
          type='button'
          variant='outline'
          onClick={resetForm}
          disabled={!isDirty || isSubmitting}
        >
          Reset
        </Button>

        <Button size='sm' type='submit' disabled={!isDirty || isSubmitting}>
          {isSubmitting ? <Spinner variant='primary' size='sm' /> : 'Save'}
        </Button>
      </div>
    </form>
  );
}
