'use client';

import { cn } from '@repo/lib';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DatePickerProps
  extends Omit<
    React.ComponentProps<typeof Button>,
    'onChange' | 'defaultValue' | 'value'
  > {
  defaultValue?: Date;
  value?: Date;
  onChange?: (date: string) => void;
}

export function DatePicker({
  defaultValue,
  value,
  onChange,
  ...props
}: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(defaultValue || value);

  function handleSetDate(newDate: Date | undefined) {
    if (!newDate) return;

    setDate(newDate);
    onChange?.(newDate.toISOString());
  }

  useEffect(() => {
    if (value?.toDateString() !== date?.toDateString()) {
      setDate(value);
    }
  }, [value, date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          {...props}
          onChange={undefined}
          variant={'outline'}
          className={cn(
            'min-w-48 justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={handleSetDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
