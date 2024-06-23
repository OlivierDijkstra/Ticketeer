'use client';

import formatMoney, { cn } from '@repo/lib';
import { Check, Pencil, X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useState } from 'react';

import { CurrencyInput } from '@/components/currency-input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function EditableField({
  value,
  tooltipText = 'Edit value',
  className,
  onChange,
  disabled,
  minLength = 5,
  type = 'input',
  confirmation = false,
  placeholder = 'No value',
  required = false,
}: {
  value?: string | null;
  tooltipText?: string;
  className?: string;
  onChange: (value: string | null | number) => void;
  disabled?: boolean;
  minLength?: number;
  type?: 'input' | 'textarea' | 'currency';
  confirmation?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  const [stateValue, setStateValue] = useState<string | number | null | undefined>(value);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  function onChangeHandler(value: string | number) {
    setStateValue(value);

    if (!value && required) {
      setError('Value cannot be empty');
    } else if (typeof value === 'string' && value.length < minLength) {
      if (minLength !== 0) {
        setError(`Value must be at least ${minLength} characters long`);
      }
    } else {
      setError(null);
    }
  }

  async function confirmChange() {
    if (error) return;

    if (stateValue === value) {
      setIsEditing(false);
      return;
    }

    if (confirmation && !dialogOpen) {
      setDialogOpen(true);
      return;
    }

    setDialogOpen(false);
    setIsEditing(false);

    try {
      await onChange(stateValue || null);
    } catch (error) {
      setStateValue(value);
    }
  }

  function onKeyDownHandler(
    event: KeyboardEvent<HTMLInputElement> | KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === 'Escape') {
      handleCloseDialog();
    }
  }

  function handleCloseDialog() {
    setError(null);
    setDialogOpen(false);
    setIsEditing(false);
    setStateValue(value);
  }

  function returnComponent() {
    if (type === 'input') {
      return (
        <Input
          autoFocus
          defaultValue={stateValue || undefined}
          onChange={(e) => onChangeHandler(e.target.value)}
          onKeyDown={onKeyDownHandler}
          placeholder={placeholder}
        />
      );
    } else if (type === 'textarea') {
      return (
        <Textarea
          autoFocus
          className='w-full'
          value={stateValue || undefined}
          onChange={(e) => onChangeHandler(e.target.value)}
          onKeyDown={onKeyDownHandler}
          placeholder={placeholder}
        />
      );
    } else if (type === 'currency') {
      return (
        <CurrencyInput
          autoFocus
          value={stateValue || undefined}
          onChange={(value) => onChangeHandler(value.toString())}
          onKeyDown={onKeyDownHandler}
          placeholder={placeholder}
        />
      );
    }
  }

  return (
    <div>
      <div className={cn([className, 'mb-2 flex items-center gap-2'])}>
        <div className='w-full overflow-hidden'>
          {isEditing ? (
            returnComponent()
          ) : (
            <p className='line-clamp-6'>
              {type === 'currency'
                ? formatMoney(stateValue)
                : stateValue || placeholder}
            </p>
          )}
        </div>

        {!isEditing ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={disabled}
                onClick={() => setIsEditing(true)}
                size='icon'
                variant='outline'
                className='aspect-square !size-8 rounded-full text-primary'
                aria-label='edit value'
              >
                <span className='sr-only'>{tooltipText}</span>
                <Pencil />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className='text-xs font-normal'>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <Button
              variant='outline'
              size='icon'
              className='aspect-square !size-8 rounded-full text-primary'
              onClick={confirmChange}
              disabled={!!error}
            >
              <span className='sr-only'>Save</span>
              <Check />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='aspect-square !size-8 rounded-full text-primary'
              onClick={handleCloseDialog}
            >
              <span className='sr-only'>Cancel</span>
              <X />
            </Button>
          </>
        )}
      </div>

      {error && isEditing && (
        <p className='text-xs font-medium text-red-500'>{error}</p>
      )}
      {!error && isEditing && (
        <p className='mb-1 !text-xs !font-medium !text-muted-foreground'>
          Click the save button to confirm, click the cancel button or press
          Escape to cancel
        </p>
      )}

      {confirmation && (
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will also change the link to this event. You will
                automatically be redirect to the new event link.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button onClick={handleCloseDialog} variant='outline'>
                Cancel
              </Button>
              <AlertDialogAction onClick={confirmChange}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
