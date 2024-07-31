'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { PlusIcon, XIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import StartEndDateInputs from '@/components/show/start-end-date-inputs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createShowAction } from '@/server/actions/shows';

export default function CreateShowForm({
  callback,
}: {
  callback?: () => void;
}) {
  const params = useParams<{ event: string }>();

  const schema = z
    .object({
      description: z.string().max(255).optional(),
      enabled: z.boolean().optional(),
      dates: z.object({
        start: z.string(),
        end: z.string(),
      }),
      guests: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
          })
        )
        .optional(),
    })
    .required();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      enabled: false,
      dates: {
        start: format(today, 'yyyy-MM-dd HH:mm:ss'),
        end: format(today, 'yyyy-MM-dd HH:mm:ss'),
      },
      guests: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'guests',
  });

  const [newGuest, setNewGuest] = useState('');

  async function onSubmit(data: z.infer<typeof schema>) {
    await toast.promise(
      createShowAction({
        event_slug: params.event,
        data: {
          description: data.description,
          email_description: '',
          enabled: data.enabled,
          start: data.dates.start,
          end: data.dates.end,
          guests: data.guests?.map((guest) => guest.name),
        },
      }),
      {
        loading: 'Creating show...',
        success: () => {
          callback && callback();
          return 'Show created';
        },
        error: 'Failed to create show',
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <FormField
          control={form.control}
          name='dates'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StartEndDateInputs
                  value={{
                    start: new Date(field.value.start),
                    end: new Date(field.value.end),
                  }}
                  onChange={(dates) => {
                    field.onChange({
                      start: format(dates.start, 'yyyy-MM-dd HH:mm:ss'),
                      end: format(dates.end, 'yyyy-MM-dd HH:mm:ss'),
                    });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <hr className='my-4 space-y-4' />
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <hr className='my-4' />
        </div>

        <FormLabel>Guests</FormLabel>
        <div className='mb-1 flex w-full flex-wrap gap-2'>
          {fields.map((guest, i) => (
            <span
              key={guest.id}
              className='flex items-center rounded-md bg-foreground/5 px-2 py-1 text-sm'
            >
              <button
                onClick={() => remove(i)}
                type='button'
                className='mr-1 rounded-xl transition-colors hover:text-muted-foreground focus:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-2'
              >
                <XIcon />
                <span className='sr-only'>Remove</span>
              </button>

              {guest.name}
            </span>
          ))}
        </div>

        <div className='flex gap-2'>
          <Input
            type='text'
            placeholder='Add guest'
            value={newGuest}
            onChange={(e) => {
              setNewGuest(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                append({
                  id: newGuest,
                  name: newGuest,
                });
                setNewGuest('');
              }
            }}
            name='guest'
          />

          <Button
            type='button'
            variant='outline'
            disabled={!newGuest}
            onClick={() => {
              append({
                id: newGuest,
                name: newGuest,
              });
              setNewGuest('');
            }}
          >
            <PlusIcon className='mr-2' />
            Add
          </Button>
        </div>

        <div>
          <hr className='my-4 space-y-4' />
        </div>

        <FormField
          control={form.control}
          name='enabled'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center gap-2'>
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enabled</FormLabel>
              </div>
              <FormDescription>
                Enabled shows are displayed on the event page.
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end'>
          <Button disabled={form.formState.isSubmitting} type='submit'>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
