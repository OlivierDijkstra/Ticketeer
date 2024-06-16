'use client';

import { Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GuestField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [guests, setGuests] = useState(value);
  const [guest, setGuest] = useState('');
  const containerRef = useRef<HTMLUListElement>(null);

  function addGuest() {
    if (guest) {
      setGuests([...guests, guest]);
      setGuest('');
      onChange([...guests, guest]);

      setTimeout(() => {
        if (containerRef.current?.scrollTo) {
          containerRef.current?.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }

  function removeGuest(index: number) {
    const newGuests = [...guests];
    newGuests.splice(index, 1);
    setGuests(newGuests);
    onChange(newGuests);
  }

  return (
    <div className='flex max-h-[180px] flex-col justify-between'>
      <ul
        data-testid='guests'
        ref={containerRef}
        className='mb-2 max-h-40 space-y-1 overflow-y-scroll rounded border p-2'
      >
        {guests?.map((guest, index) => (
          <li className='flex items-center justify-between gap-2' key={index}>
            <span className='text-sm'>{guest}</span>

            <Button
              name='remove-guest'
              type='button'
              onClick={() => removeGuest(index)}
              size='icon'
              variant='ghost'
              className='size-6'
            >
              <span className='sr-only'>Remove guest</span>
              <X />
            </Button>
          </li>
        ))}

        {guests.length === 0 && (
          <li className='text-center text-sm text-gray-500'>No guests added</li>
        )}
      </ul>

      <div className='flex items-center gap-2'>
        <Input
          name='guests'
          id='guests'
          value={guest}
          aria-labelledby='guests'
          placeholder='Add guest'
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addGuest();
            }
          }}
          onChange={(e) => {
            setGuest(e.target.value);
          }}
        />

        <Button
          disabled={!guest}
          className='flex items-center gap-2'
          variant='outline'
          type='button'
          onClick={addGuest}
        >
          <Plus /> <span>Add guest</span>
        </Button>
      </div>
    </div>
  );
}
