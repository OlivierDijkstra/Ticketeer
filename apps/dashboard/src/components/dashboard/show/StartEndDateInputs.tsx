import { useEffect, useState } from 'react';

import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTimeInput } from '@/lib/hooks';

export default function StartEndDateInputs({
  defaultValue,
  value,
  onChange,
}: {
  defaultValue?: { start: Date; end: Date };
  value: {
    start: Date;
    end: Date;
  };
  onChange: (value: { start: Date; end: Date }) => void;
}) {
  const [startDate, setStartDate] = useState(
    defaultValue?.start || value.start
  );
  const [endDate, setEndDate] = useState(defaultValue?.end || value.end);

  useEffect(() => {
    if (value?.start !== startDate) {
      setStartDate(value.start);
    }

    if (value?.end !== endDate) {
      setEndDate(value.end);
    }
  }, [endDate, startDate, value]);

  function setTime(date: Date, value: string, type: 'hour' | 'minute') {
    if (type === 'hour') {
      date.setHours(parseInt(value));
    } else {
      date.setMinutes(parseInt(value));
    }

    date.setSeconds(0);

    return date;
  }

  function onDatePickerChange(date: Date, type: 'start' | 'end') {
    if (type === 'start') {
      if (startDate.toString() === date.toString()) return;

      const newDate = new Date(date);
      newDate.setHours(startDate.getHours());
      newDate.setMinutes(startDate.getMinutes());
      newDate.setSeconds(0);
      setStartDate(newDate);
      onChange({ start: newDate, end: endDate });
    } else {
      if (endDate.toString() === date.toString()) return;

      const newDate = new Date(date);
      newDate.setHours(endDate.getHours());
      newDate.setMinutes(endDate.getMinutes());
      newDate.setSeconds(0);
      setEndDate(new Date(newDate));
      onChange({ start: startDate, end: newDate });
    }
  }

  const [startHours, handleStartHourChange] = useTimeInput(
    startDate.getHours().toString().padStart(2, '0'),
    'hour',
    (value) => {
      setTime(startDate, value, 'hour');
      setStartDate(new Date(startDate));
      onChange({ start: startDate, end: endDate });
    }
  );

  const [startMinutes, handleStartMinutesChange] = useTimeInput(
    startDate.getMinutes().toString().padStart(2, '0'),
    'minute',
    (value) => {
      setTime(startDate, value, 'minute');
      setStartDate(new Date(startDate));
      onChange({ start: startDate, end: endDate });
    }
  );

  const [endHours, handleEndHourChange] = useTimeInput(
    endDate.getHours().toString().padStart(2, '0'),
    'hour',
    (value) => {
      setTime(endDate, value, 'hour');
      setEndDate(new Date(endDate));
      onChange({ start: startDate, end: endDate });
    }
  );

  const [endMinutes, handleEndMinutesChange] = useTimeInput(
    endDate.getMinutes().toString().padStart(2, '0'),
    'minute',
    (value) => {
      setTime(endDate, value, 'minute');
      setEndDate(new Date(endDate));
      onChange({ start: startDate, end: endDate });
    }
  );

  return (
    <div className='mb-2 flex w-full flex-col items-center justify-between gap-2 self-start xs:flex-row'>
      <fieldset>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='start'>Start Date</Label>
          <DatePicker
            id='start'
            defaultValue={startDate}
            value={startDate}
            onChange={(date) => onDatePickerChange(new Date(date), 'start')}
          />
        </div>

        <div className='mt-2 flex items-center gap-2'>
          <Input
            data-testid='start-hours'
            name='start.hours'
            type='text'
            value={startHours}
            onChange={handleStartHourChange}
            className='grid size-12 place-items-center font-mono text-lg'
          />

          <span className='text-muted-foreground'>:</span>

          <Input
            data-testid='start-minutes'
            name='start.minutes'
            type='text'
            value={startMinutes}
            onChange={handleStartMinutesChange}
            className='grid size-12 place-items-center font-mono text-lg'
          />
        </div>
      </fieldset>

      <span className='text-lg text-muted-foreground'>-</span>

      <fieldset>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='end'>End Date</Label>
          <DatePicker
            id='end'
            defaultValue={endDate}
            value={endDate}
            onChange={(date) => onDatePickerChange(new Date(date), 'end')}
          />
        </div>

        <div className='mt-2 flex items-center gap-2'>
          <Input
            inputMode='numeric'
            data-testid='end-hours'
            name='end.hours'
            type='text'
            value={endHours}
            onChange={handleEndHourChange}
            className='grid size-12 place-items-center font-mono text-lg'
          />

          <span className='text-muted-foreground'>:</span>

          <Input
            inputMode='numeric'
            data-testid='end-minutes'
            name='end.minutes'
            type='text'
            value={endMinutes}
            onChange={handleEndMinutesChange}
            className='grid size-12 place-items-center font-mono text-lg'
          />
        </div>
      </fieldset>
    </div>
  );
}
