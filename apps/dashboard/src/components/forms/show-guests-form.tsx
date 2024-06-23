'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Show } from '@repo/lib';
import { PlusIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateShowAction } from '@/server/actions/shows';

export default function ShowGuestsForm({ show }: { show: Show }) {
  const schema = z
    .object({
      guests: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      ),
    })
    .required();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      guests: show.guests.map((guest) => ({
        id: guest,
        name: guest,
      })),
    },
  });

  const [newGuest, setNewGuest] = useState('');

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'guests',
  });

  useEffect(() => {
    const flattened = fields.flatMap((guest) => guest.name);
    const changed = flattened.some((guest, i) => guest !== show.guests[i]);

    if (changed) {
      toast.promise(
        updateShowAction({
          show_id: show.id,
          data: {
            guests: fields.map((guest) => guest.name),
          },
        }),
        {
          loading: 'Updating guests...',
          success: 'Guests updated',
          error: 'Failed to update guests',
        }
      );
    }
  }, [fields, show.guests, show.id]);

  return (
    <div>
      <div>
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
      </div>
    </div>
  );
}
